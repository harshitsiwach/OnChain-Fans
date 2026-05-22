"use client"

import { useState } from "react"
import { useWallet, shortAddress } from "@/lib/wallet-provider"
import { Lock, Unlock, Loader2, Wallet, CheckCircle, Sparkles } from "lucide-react"
import type { PaymentRequired, PaymentPayload } from "@/lib/x402/types"

interface X402GateProps {
  contentId: string
  title: string
  priceUsdc: number
  previewUrl?: string
  contentType: string
  creatorName?: string
  children: React.ReactNode
}

export function X402Gate({ contentId, title, priceUsdc, previewUrl, contentType, creatorName, children }: X402GateProps) {
  const { address, provider, connect, isConnecting } = useWallet()
  const [status, setStatus] = useState<"locked" | "signing" | "submitting" | "unlocked" | "error">("locked")
  const [error, setError] = useState("")
  const [txHash, setTxHash] = useState("")
  const [showConnect, setShowConnect] = useState(false)

  async function handleUnlock() {
    if (!address || !provider) {
      setShowConnect(true)
      return
    }

    setStatus("signing")
    setError("")

    try {
      // Step 1: Get 402 challenge
      const res1 = await fetch(`/api/content/${contentId}`)
      if (res1.ok) { setStatus("unlocked"); return }
      if (res1.status !== 402) throw new Error(`Unexpected status: ${res1.status}`)

      const challenge: PaymentRequired = await res1.json()
      const accepted = challenge.accepts[0]
      const meta = challenge.extensions?.paymentPermitContext?.meta
      if (!meta) throw new Error("Malformed 402 challenge")

      // Step 2: Sign EIP-712 TransferWithAuthorization
      const domain = {
        name: "USDC",
        version: "2",
        chainId: 5042002,
        verifyingContract: accepted.asset,
      }
      const types = {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      }
      const value = {
        from: address,
        to: accepted.payTo,
        value: accepted.amount,
        validAfter: meta.validAfter.toString(),
        validBefore: meta.validBefore.toString(),
        nonce: meta.nonce,
      }

      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify({ domain, types, primaryType: "TransferWithAuthorization", message: value })],
      })

      // Step 3: Submit payment
      setStatus("submitting")
      const permit = {
        meta: { ...meta },
        buyer: address,
        caller: address,
        payment: { payToken: accepted.asset, payAmount: accepted.amount, payTo: accepted.payTo },
      }
      const payload: PaymentPayload = {
        x402Version: challenge.x402Version,
        accepted,
        payload: { signature, paymentPermit: permit },
      }

      const res2 = await fetch(`/api/content/${contentId}`, {
        headers: {
          "Content-Type": "application/json",
          "X-Payment-Signature": btoa(JSON.stringify(payload)),
        },
      })

      if (!res2.ok) {
        const err = await res2.text()
        throw new Error(err || "Payment rejected")
      }

      const paymentResp = res2.headers.get("X-Payment-Response")
      const hash = paymentResp ? JSON.parse(paymentResp)?.txHash : undefined
      setStatus("unlocked")
      if (hash) setTxHash(hash)
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Transaction failed")
    }
  }

  if (status === "unlocked") {
    return (
      <div className="space-y-3 animate-bounce-in">
        {children}
        <div className="flex items-center gap-2 px-4 py-2 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-xs text-[#b8a9d4] w-fit">
          <CheckCircle className="w-4 h-4 text-[#40c4ff]" />
          <span>Paid via x402</span>
          {txHash && (
            <>
              <span className="text-[#3d2d5c]">·</span>
              <span className="font-mono text-[#7a6b99]">tx: {shortAddress(txHash)}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Blurred preview */}
      <div className="relative overflow-hidden rounded-[16px] border border-[#2a1f3d]">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={title}
              className="w-full h-72 sm:h-96 object-cover blur-2xl opacity-40 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b14] via-[#0f0b14]/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-72 sm:h-96 bg-gradient-to-br from-[#1a1425] to-[#221a33] flex items-center justify-center">
            <Lock className="w-16 h-16 text-[#3d2d5c]" />
          </div>
        )}

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
          {/* Status icon */}
          <div className={`rounded-full p-4 ${
            status === "signing" ? "bg-[#7c52aa]/30 animate-pulse-glow" :
            status === "submitting" ? "bg-[#0096cc]/30 animate-pulse-glow" :
            "bg-[#1a1425] border border-[#2a1f3d]"
          }`}>
            {status === "signing" ? (
              <Loader2 className="w-7 h-7 text-[#b181e8] animate-spin" />
            ) : status === "submitting" ? (
              <Loader2 className="w-7 h-7 text-[#40c4ff] animate-spin" />
            ) : (
              <Lock className="w-7 h-7 text-[#e040a0]" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#faf5ff] text-center">{title}</h2>
          {creatorName && (
            <p className="text-sm text-[#b8a9d4]">by {creatorName}</p>
          )}

          {/* Price tag */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-[9999px] bg-[#e040a0]/10 border border-[#e040a0]/20">
            <Sparkles className="w-4 h-4 text-[#e040a0]" />
            <span className="font-bold text-[#e040a0]">{priceUsdc.toFixed(2)} USDC</span>
          </div>

          {/* Status text */}
          <p className="text-sm text-[#b8a9d4] text-center max-w-sm">
            {status === "signing"
              ? "Sign the permit in your wallet to authorize the payment..."
              : status === "submitting"
              ? "Submitting to Arc blockchain..."
              : "Unlock this content with one signature. Gasless for you."}
          </p>

          {/* Button */}
          {showConnect && !address ? (
            <button onClick={connect} disabled={isConnecting} className="btn-pill btn-pink text-base px-8 py-3">
              <Wallet className="w-5 h-5" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <button onClick={handleUnlock} disabled={status === "signing" || status === "submitting" || !address}
              className={`btn-pill text-base px-8 py-3 ${
                status === "signing" || status === "submitting"
                  ? "btn-blue"
                  : "btn-pink"
              }`}
            >
              {status === "signing" ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Signing...</>
              ) : status === "submitting" ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Confirming...</>
              ) : (
                <><Unlock className="w-5 h-5" /> Unlock · {priceUsdc.toFixed(2)} USDC</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {status === "error" && error && (
        <div className="mt-3 px-4 py-3 rounded-[16px] bg-[#e040a0]/10 border border-[#e040a0]/20 text-[#e040a0] text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  )
}
