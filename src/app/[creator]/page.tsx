import { notFound } from "next/navigation"
import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { ContentCard } from "@/components/content-card"
import { Heart, Users, DollarSign } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
  const { creator: creatorSlug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: creator } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(id, display_name, avatar_url)")
    .or(`display_name.eq.${creatorSlug},id.eq.${creatorSlug}`)
    .single()

  if (!creator) notFound()

  const { data: content } = await supabase
    .from("content_items")
    .select("*")
    .eq("creator_profile_id", creator.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  const displayName = creator.display_name || creator.profiles?.display_name || "Creator"
  const totalEarned = creator.total_earnings_usdc / 1_000_000

  return (
    <div className="space-y-8 animate-bounce-in">
      {/* Creator header */}
      <div className="card !p-0 overflow-hidden">
        {/* Banner area */}
        <div className="h-32 bg-gradient-to-r from-[#e040a0]/20 via-[#7c52aa]/20 to-[#0096cc]/20 relative">
          {/* Avatar overlapping */}
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e040a0] to-[#7c52aa] flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-[#e040a0]/30 border-4 border-[#0f0b14]">
              {displayName[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="pt-14 pb-6 px-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#faf5ff]">{displayName}</h1>
                {creator.is_verified && (
                  <span className="badge badge-blue text-xs">Verified</span>
                )}
              </div>
              {creator.bio && <p className="text-[#b8a9d4] text-sm leading-relaxed">{creator.bio}</p>}
            </div>
            {creator.subscription_price_usdc > 0 && (
              <Link
                href={`/subscribe/${creator.id}`}
                className="btn-pill btn-pink shrink-0"
              >
                <Heart className="w-4 h-4" />
                Subscribe · {(creator.subscription_price_usdc / 1_000_000).toFixed(2)} USDC/mo
              </Link>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-[#b8a9d4] font-medium">
              <Users className="w-4 h-4 text-[#7c52aa]" />
              {creator.total_fans || 0} fans
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-[#b8a9d4] font-medium">
              <DollarSign className="w-4 h-4 text-[#e040a0]" />
              {totalEarned.toFixed(2)} USDC earned
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-[#b8a9d4] font-medium">
              <Heart className="w-4 h-4 text-[#0096cc]" />
              {content?.length || 0} posts
            </div>
          </div>
        </div>
      </div>

      {/* Content grid */}
      {content && content.length > 0 ? (
        <div>
          <h2 className="text-lg font-bold text-[#faf5ff] mb-4">Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {content.map((item, i) => (
              <div key={item.id} style={{ animationDelay: `${0.05 * i}s` }} className="animate-bounce-in">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  contentType={item.content_type}
                  priceUsdc={item.price_usdc / 1_000_000}
                  previewUrl={item.preview_url || undefined}
                  viewCount={item.view_count}
                  purchaseCount={item.purchase_count}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#7c52aa]/10 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6 text-[#7c52aa]" />
          </div>
          <p className="text-[#7a6b99] font-medium">No content yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
