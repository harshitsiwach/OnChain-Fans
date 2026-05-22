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
    <X402Gate
      contentId={contentId}
      title={title}
      priceUsdc={priceUsdc}
      previewUrl={previewUrl}
      contentType={contentType}
      creatorName={creatorName}
    >
      {/* Unlocked content */}
      <div className="rounded-[16px] overflow-hidden border border-[#2a1f3d] bg-[#1a1425]">
        {contentType === "image" && fileUrl && (
          <img src={fileUrl} alt={title} className="w-full h-auto max-h-[80vh] object-contain" />
        )}
        {contentType === "video" && fileUrl && (
          <video src={fileUrl} controls className="w-full max-h-[80vh]" autoPlay />
        )}
        {contentType === "text" && (
          <div className="p-8 text-[#b8a9d4] leading-relaxed whitespace-pre-wrap">{fileUrl}</div>
        )}
        {(contentType === "image" || contentType === "video") && !fileUrl && (
          <div className="p-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#0096cc]/20 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-[#40c4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[#7a6b99]">Content unlocked!</p>
            <p className="text-xs text-[#40c4ff] font-medium">✓ x402 payment verified on Arc</p>
          </div>
        )}
      </div>

      {/* Unlock badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-xs text-[#b8a9d4] w-fit">
        <div className="w-2 h-2 rounded-full bg-[#40c4ff] shadow-[0_0_6px_rgba(64,196,255,0.6)]" />
        <span>Unlocked via {creatorName}</span>
        <span className="text-[#3d2d5c]">·</span>
        <span className="text-[#e040a0] font-medium">x402 · Arc</span>
      </div>
    </X402Gate>
  )
}
