"use client"

import { Lock, Eye, DollarSign, Play, Image, Music, FileText } from "lucide-react"
import type { ReactNode } from "react"

const typeIcons: Record<string, ReactNode> = {
  image: <Image className="w-5 h-5" />,
  video: <Play className="w-5 h-5" />,
  audio: <Music className="w-5 h-5" />,
  text: <FileText className="w-5 h-5" />,
}

interface ContentCardProps {
  id: string
  title: string
  contentType: "image" | "video" | "audio" | "text"
  priceUsdc: number
  previewUrl?: string
  viewCount?: number
  creatorName?: string
  purchaseCount?: number
}

export function ContentCard({
  id,
  title,
  contentType,
  priceUsdc,
  previewUrl,
  viewCount,
  creatorName,
  purchaseCount,
}: ContentCardProps) {
  const isFree = priceUsdc === 0

  return (
    <a
      href={`/content/${id}`}
      className="card group overflow-hidden !p-0"
    >
      {/* Preview area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1425] to-[#221a33] flex items-center justify-center">
            <div className="text-[#7a6b99] opacity-50">
              {typeIcons[contentType] || <Eye className="w-8 h-8" />}
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b14] via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="badge badge-purple capitalize">
            {typeIcons[contentType]}
            <span className="ml-1">{contentType}</span>
          </span>
          {!isFree && (
            <span className="badge badge-pink">
              <Lock className="w-3 h-3" />
              <span>{priceUsdc.toFixed(2)} USDC</span>
            </span>
          )}
          {isFree && (
            <span className="badge badge-blue">
              Free
            </span>
          )}
        </div>

        {/* Title on overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold text-white truncate drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-3 py-2.5 flex items-center justify-between text-xs text-[#7a6b99] font-medium">
        <div className="flex items-center gap-3">
          {creatorName && <span>{creatorName}</span>}
          {viewCount !== undefined && viewCount > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewCount}
            </span>
          )}
        </div>
        {purchaseCount !== undefined && purchaseCount > 0 && (
          <span className="text-[#e040a0]">{purchaseCount} unlocked</span>
        )}
      </div>
    </a>
  )
}
