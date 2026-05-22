"use client"

import { useState } from "react"
import { useWallet, shortAddress } from "@/lib/wallet-provider"
import { Lock, Unlock, Loader2, Wallet, CheckCircle } from "lucide-react"
import type { PaymentRequired, PaymentPayload } from "@/lib/x402/types"

interface X402GateProps {
  contentId: string
  title: string
  priceUsdc: number
  previewUrl?: string
  contentType: string
  children: React.ReactNode
}

export function X402Gate({ contentId, title, priceUsdc, previewUrl, contentType, children }: X402GateProps) {
  const { address, provider, connect, isConnecting } = useWallet()
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [status, setStatus] = useState<"locked" | "signing" | "submitting" | "unlocked" | "error">("locked")
  const [error, setError] = useState<string>("")
  const [txHash, setTxHash] = useState<string>("")
  const [showConnect, setShowConnect] = useState(false)

  async function handleUnlock() {
    if (!address || !provider) {
      setShowConnect(true)
      return
    }

    setIsUnlocking(true)
    setError("")

    try {
      // Step 1: Request content → get 402 challenge
      setStatus("signing")
      const res1 = await fetch(`/api/content/${contentId}`)
      if (res1.ok) {
        // Already unlocked somehow
        setStatus("unlocked")
        setIsUnlocking(false)
        return
      }

      if (res1.status !== 402) {
        throw new Error(`Unexpected response: ${res1.status}`)
      }

      const challenge: PaymentRequired = await res1.json()
      const accepted = challenge.accepts[0]
      const meta = challenge.extensions?.paymentPermitContext?.meta
      if (!meta) throw new Error("Malformed 402 challenge")

      // Step 2: Sign EIP-712 TransferWithAuthorization
      setStatus("signing")
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

      // Step 3: Build payload and retry
      setStatus("submitting")
      const permit = {
        meta: { ...meta },
        buyer: address,
        caller: address,
        payment: {
          payToken: accepted.asset,
          payAmount: accepted.amount,
          payTo: accepted.payTo,
        },
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
    } finally {
      setIsUnlocking(false)
    }
  }

  if (status === "unlocked") {
    return (
      <div className="space-y-2">
        {children}
        {txHash && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-3 h-3" />
            <span>Paid · tx: {shortAddress(txHash)}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Blurred preview */}
      <div className="relative overflow-hidden rounded-xl">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={title}
              className="w-full h-64 object-cover blur-xl opacity-60"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-64 bg-zinc-900 flex items-center justify-center">
            <Lock className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
            {status === "signing" ? (
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            ) : status === "submitting" ? (
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            ) : (
              <Lock className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <p className="text-white font-semibold text-lg">{title}</p>
          <p className="text-zinc-400 text-sm text-center max-w-xs">
            {status === "signing"
              ? "Sign in your wallet to authorize payment..."
              : status === "submitting"
              ? "Submitting payment to Arc blockchain..."
              : `Unlock this content for ${priceUsdc.toFixed(2)} USDC`}
          </p>

          {showConnect && !address ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <button
              onClick={handleUnlock}
              disabled={isUnlocking || !address}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              {isUnlocking ? "Processing..." : `Unlock · ${priceUsdc.toFixed(2)} USDC`}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {status === "error" && error && (
        <div className="mt-2 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
