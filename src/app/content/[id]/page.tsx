import { notFound } from "next/navigation"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ContentGate } from "./content-gate"

export const dynamic = "force-dynamic"

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const { data: content } = await supabase
    .from("content_items")
    .select("*, creator_profiles!inner(id, display_name)")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (!content) notFound()

  const priceUsdc = content.price_usdc / 1_000_000
  const creatorName = content.creator_profiles?.display_name || "Unknown"

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-bounce-in">
      {/* Breadcrumb */}
      <Link
        href={`/${creatorName}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#b8a9d4] hover:text-[#e040a0] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {creatorName}
      </Link>

      {/* Content info */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#faf5ff]">{content.title}</h1>
        <div className="flex items-center flex-wrap gap-2 text-sm text-[#b8a9d4]">
          <span className="font-medium">by {creatorName}</span>
          <span className="text-[#3d2d5c]">·</span>
          <span className="badge badge-purple capitalize">{content.content_type}</span>
          {content.tags?.length > 0 && content.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="badge text-[10px] px-2.5 py-0.5 bg-[#1a1425] text-[#7a6b99] border border-[#2a1f3d]">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      {content.description && (
        <p className="text-[#b8a9d4] leading-relaxed">{content.description}</p>
      )}

      {/* x402 Content Gate */}
      <ContentGate
        contentId={content.id}
        title={content.title}
        priceUsdc={priceUsdc}
        contentType={content.content_type}
        previewUrl={content.preview_url || undefined}
        creatorName={creatorName}
        fileUrl={content.file_url}
      />
    </div>
  )
}
