import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Heart, Users, DollarSign, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: creators } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(id, display_name, avatar_url)")
    .limit(50)

  if (!creators?.length) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#e040a0]/10 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-[#e040a0]" />
        </div>
        <h2 className="text-2xl font-bold">No creators yet</h2>
        <p className="text-[#b8a9d4]">Be the first to start creating!</p>
        <Link href="/dashboard" className="btn-pill btn-pink px-8 py-3">
          <Sparkles className="w-4 h-4" />
          Become a Creator
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="animate-bounce-in">
        <h1 className="text-3xl font-bold gradient-pink-purple">Creators</h1>
        <p className="text-[#b8a9d4] mt-1">Support your favorite creators with USDC</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {creators.map((creator, i) => (
          <Link
            key={creator.id}
            href={`/${creator.profiles?.display_name || creator.id}`}
            className="card p-5 space-y-4 animate-bounce-in"
            style={{ animationDelay: `${0.05 * i}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e040a0] to-[#7c52aa] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#e040a0]/20">
                {(creator.display_name || creator.profiles?.display_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-[#faf5ff]">{creator.display_name || creator.profiles?.display_name}</h3>
                {creator.is_verified && (
                  <span className="badge badge-blue text-[10px] px-2 py-0.5 mt-0.5">Verified</span>
                )}
              </div>
            </div>

            {creator.bio && (
              <p className="text-sm text-[#b8a9d4] line-clamp-2 leading-relaxed">{creator.bio}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-[#7a6b99] font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {creator.total_fans || 0}
              </span>
              {creator.subscription_price_usdc > 0 && (
                <span className="flex items-center gap-1.5 text-[#e040a0]">
                  <DollarSign className="w-3.5 h-3.5" />
                  {(creator.subscription_price_usdc / 1_000_000).toFixed(2)}/mo
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
