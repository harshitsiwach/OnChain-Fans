"use client"

import { X402Gate } from "@/components/x402-gate"

interface ContentGateProps {
  contentId: string
  title: string
  priceUsdc: number
  contentType: string
  previewUrl?: string
  fileUrl?: string
  creatorName: string
}

export function ContentGate({ contentId, title, priceUsdc, contentType, previewUrl, fileUrl, creatorName }: ContentGateProps) {
  return (
    <div className="space-y-4">
      <X402Gate
        contentId={contentId}
        title={title}
        priceUsdc={priceUsdc}
        previewUrl={previewUrl}
        contentType={contentType}
      >
        {/* Unlocked content rendering */}
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          {contentType === "image" && fileUrl && (
            <img
              src={fileUrl}
              alt={title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
          {contentType === "video" && fileUrl && (
            <video
              src={fileUrl}
              controls
              className="w-full max-h-[80vh]"
              autoPlay
            />
          )}
          {contentType === "text" && (
            <div className="p-6 text-zinc-300 prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{fileUrl}</p>
            </div>
          )}
          {(contentType === "image" || contentType === "video") && !fileUrl && (
            <div className="p-12 text-center text-zinc-500">
              <p>Content unlocked! (Demo mode — file URL not configured)</p>
              <p className="text-xs mt-2 text-green-500">✓ Payment verified on Arc</p>
            </div>
          )}
        </div>

        {/* Creator credits */}
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Unlocked via {creatorName}</span>
          <span className="text-green-400 text-xs">x402 · Arc USDC</span>
        </div>
      </X402Gate>
    </div>
  )
}
