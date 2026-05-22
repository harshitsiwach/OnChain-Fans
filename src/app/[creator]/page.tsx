import { notFound } from "next/navigation"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ContentCard } from "@/components/content-card"
import { Heart, Users, DollarSign, Share2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: creatorSlug } = await params
  const supabase = await createSupabaseServerClient()

  // Look up creator by display_name or id
  const { data: creator } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(id, display_name, avatar_url)")
    .or(`display_name.eq.${creatorSlug},id.eq.${creatorSlug}`)
    .single()

  if (!creator) notFound()

  // Fetch their content
  const { data: content } = await supabase
    .from("content_items")
    .select("*")
    .eq("creator_profile_id", creator.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      {/* Creator header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shrink-0">
          {(creator.display_name || creator.profiles?.display_name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{creator.display_name || creator.profiles?.display_name}</h1>
            {creator.is_verified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-800">
                Verified
              </span>
            )}
          </div>
          {creator.bio && <p className="text-zinc-400">{creator.bio}</p>}
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {creator.total_fans || 0} fans
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {(creator.total_earnings_usdc / 1_000_000).toFixed(2)} USDC earned
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {content?.length || 0} posts
            </span>
          </div>
        </div>
        {creator.subscription_price_usdc > 0 && (
          <Link
            href={`/subscribe/${creator.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all shrink-0"
          >
            <Heart className="w-4 h-4" />
            Subscribe · {(creator.subscription_price_usdc / 1_000_000).toFixed(2)} USDC/mo
          </Link>
        )}
      </div>

      {/* Content grid */}
      {content && content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {content.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              contentType={item.content_type}
              priceUsdc={item.price_usdc / 1_000_000}
              previewUrl={item.preview_url || undefined}
              viewCount={item.view_count}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-zinc-600">
          <p>No content yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
