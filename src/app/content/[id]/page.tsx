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
  const creatorName = content.creator_profiles?.display_name || "Unknown Creator"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/${creatorName}`}
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        ← Back to {creatorName}
      </Link>

      {/* Content info */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{content.title}</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>by {creatorName}</span>
          <span>·</span>
          <span className="capitalize">{content.content_type}</span>
          {content.tags?.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-1">
                {content.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      {content.description && (
        <p className="text-zinc-400">{content.description}</p>
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
