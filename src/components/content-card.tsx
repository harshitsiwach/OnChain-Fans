"use client"

import { Lock, Eye, DollarSign } from "lucide-react"
import type { ReactNode } from "react"

interface ContentCardProps {
  id: string
  title: string
  contentType: "image" | "video" | "audio" | "text"
  priceUsdc: number
  previewUrl?: string
  viewCount?: number
  creatorName?: string
  action?: ReactNode
}

export function ContentCard({
  id,
  title,
  contentType,
  priceUsdc,
  previewUrl,
  viewCount,
  creatorName,
  action,
}: ContentCardProps) {
  const isFree = priceUsdc === 0

  return (
    <div className="group rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
      {/* Preview */}
      <a href={`/content/${id}`} className="block relative aspect-[4/3] overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            {contentType === "image" && <Eye className="w-8 h-8 text-zinc-600" />}
            {contentType === "video" && (
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium">
          {!isFree ? (
            <>
              <Lock className="w-3 h-3 text-pink-400" />
              <span className="text-pink-300">{priceUsdc.toFixed(2)} USDC</span>
            </>
          ) : (
            <span className="text-green-400">Free</span>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-zinc-400 capitalize">
          {contentType}
        </div>
      </a>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-zinc-100 truncate">{title}</h3>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          {creatorName && <span>{creatorName}</span>}
          {viewCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
