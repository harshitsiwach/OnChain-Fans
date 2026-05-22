import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createChallenge, verifyPermit, challengeResponse, paymentSuccessResponse } from "@/lib/x402/server"
import type { PaymentPayload } from "@/lib/x402/types"

const SERVER_PRIVATE_KEY = (process.env.SERVER_PRIVATE_KEY || "") as `0x${string}`
const SERVER_ADDRESS = (process.env.NEXT_PUBLIC_SERVER_ADDRESS || "") as `0x${string}`

/**
 * GET /api/content/[id]
 *
 * x402-gated content endpoint:
 * - No payment header → 402 challenge with payment requirements
 * - Valid payment header → verify EIP-3009 permit, submit to chain, return content
 *
 * Headers (for payment):
 *   X-Payment-Signature: base64(PaymentPayload)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  // Fetch content from DB
  const { data: content, error } = await supabase
    .from("content_items")
    .select("*, creator_profiles!inner(id, display_name, arc_payment_address)")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error || !content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  const price = BigInt(content.price_usdc)
  const creatorAddress = content.creator_profiles?.arc_payment_address as `0x${string}` | undefined

  // Check if user already paid (if authenticated)
  const paymentHeader = req.headers.get("X-Payment-Signature") || req.headers.get("x-payment-signature")

  // If free content (price = 0), just deliver it
  if (price === BigInt(0)) {
    return await deliverContent(content, supabase, id)
  }

  if (!paymentHeader) {
    // No payment provided — issue 402 challenge
    const challenge = createChallenge(id, price, creatorAddress || "0x0000000000000000000000000000000000000000")
    return challengeResponse(challenge)
  }

  // Payment header present — verify and settle
  try {
    const decoded = JSON.parse(atob(paymentHeader)) as PaymentPayload
    const result = await verifyPermit(decoded, SERVER_PRIVATE_KEY, SERVER_ADDRESS)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Payment verification failed" },
        { status: 402, headers: { "X-Payment-Error": result.error || "" } }
      )
    }

    // Record the purchase in Supabase
    // We get the buyer profile from the permit's buyer field
    const buyerAddress = result.from!.toLowerCase()

    // Look up or create profile for this wallet
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("arc_wallet_address", buyerAddress)
      .single()

    let buyerProfileId: string
    if (existingProfile) {
      buyerProfileId = existingProfile.id
    } else {
      // Create anon profile for wallet-only users
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ arc_wallet_address: buyerAddress, display_name: `fan_${buyerAddress.slice(2, 8)}` })
        .select("id")
        .single()
      buyerProfileId = newProfile?.id || "00000000-0000-0000-0000-000000000000"
    }

    // Insert purchase record
    await supabase.from("content_purchases").insert({
      content_id: id,
      buyer_profile_id: buyerProfileId,
      amount_usdc: Number(result.amount),
      tx_hash: result.txHash,
    })

    // Increment purchase count
    await supabase.rpc("increment_purchase_count", { content_id: id })

    // Deliver content with payment response header
    return await deliverContent(content, supabase, id, result.txHash!)
  } catch (err) {
    console.error("x402 payment error:", err)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

async function deliverContent(
  content: any,
  supabase: any,
  contentId: string,
  txHash?: `0x${string}`
): Promise<NextResponse> {
  // For MVP: content is served from a local path or URL
  // In production: IPFS, Arweave, or S3
  const fileUrl = content.file_url
  if (!fileUrl) {
    return NextResponse.json({
      id: content.id,
      title: content.title,
      description: content.description,
      content_type: content.content_type,
      // Demo: return metadata + frontend renders content
      unlocked: true,
      txHash,
    })
  }

  // For external URLs, redirect
  if (fileUrl.startsWith("http")) {
    const res = NextResponse.redirect(fileUrl)
    if (txHash) {
      res.headers.set("X-Payment-Response", JSON.stringify({ txHash, status: "confirmed" }))
    }
    return res
  }

  // For local files, serve directly
  try {
    const fs = await import("fs/promises")
    const path = await import("path")
    const fullPath = path.resolve(fileUrl.replace("~", process.env.HOME || ""))
    const fileBuffer = await fs.readFile(fullPath)
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": content.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${content.title}"`,
      },
    })
    if (txHash) {
      response.headers.set("X-Payment-Response", JSON.stringify({ txHash, status: "confirmed" }))
    }
    return response
  } catch {
    return NextResponse.json({
      id: content.id,
      title: content.title,
      description: content.description,
      content_type: content.content_type,
      unlocked: true,
      txHash,
    })
  }
}
