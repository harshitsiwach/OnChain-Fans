import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { z } from "zod"

const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  content_type: z.enum(["image", "video", "audio", "text"]),
  mime_type: z.string().optional().default(""),
  file_url: z.string().optional().default(""),
  preview_url: z.string().optional().default(""),
  price_usdc: z.number().int().min(0).default(0),
  tags: z.array(z.string()).optional().default([]),
  is_published: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Find the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Find or create creator profile
  let { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("profile_id", profile.id)
    .single()

  if (!creatorProfile) {
    return NextResponse.json({ error: "Set up your creator profile first" }, { status: 400 })
  }

  try {
    const body = createContentSchema.parse(await req.json())

    const { data, error } = await supabase
      .from("content_items")
      .insert({
        creator_profile_id: creatorProfile.id,
        title: body.title,
        description: body.description,
        content_type: body.content_type,
        mime_type: body.mime_type || getMimeType(body.content_type),
        file_url: body.file_url,
        preview_url: body.preview_url,
        price_usdc: body.price_usdc,
        tags: body.tags,
        is_published: body.is_published,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || "Validation error" }, { status: 400 })
    }
    const msg = err instanceof Error ? err.message : "Failed to create content"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function getMimeType(type: string): string {
  const map: Record<string, string> = {
    image: "image/jpeg",
    video: "video/mp4",
    audio: "audio/mpeg",
    text: "text/plain",
  }
  return map[type] || "application/octet-stream"
}
