import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Heart, Users, DollarSign } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: creators } = await supabase
    .from("creator_profiles")
    .select("*, profiles!inner(id, display_name, avatar_url)")
    .limit(50)

  if (!creators?.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-semibold">No creators yet</h2>
        <p className="text-zinc-500">Be the first to start creating!</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
        >
          Become a Creator
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Creators</h1>
        <p className="text-zinc-500 mt-1">Support your favorite creators with USDC</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {creators.map((creator) => (
          <Link
            key={creator.id}
            href={`/${creator.profiles?.display_name || creator.id}`}
            className="group rounded-xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all p-5 space-y-4"
          >
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {(creator.display_name || creator.profiles?.display_name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors">
                  {creator.display_name || creator.profiles?.display_name}
                </h3>
                {creator.is_verified && (
                  <span className="text-xs text-blue-400">✓ Verified</span>
                )}
              </div>
            </div>

            {/* Bio */}
            {creator.bio && (
              <p className="text-sm text-zinc-500 line-clamp-2">{creator.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {creator.total_fans || 0}
              </span>
              {creator.subscription_price_usdc > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
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
