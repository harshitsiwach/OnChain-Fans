import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Heart, Upload, DollarSign, Eye, TrendingUp, Plus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-16 space-y-4">
        <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-semibold">Creator Dashboard</h2>
        <p className="text-zinc-500">Sign in to manage your content and earnings</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
        >
          Sign In
        </Link>
      </div>
    )
  }

  // Get user's creator profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .single()

  const { data: creatorProfile } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("profile_id", profile?.id || "")
    .single()

  const { data: content } = await supabase
    .from("content_items")
    .select("*")
    .eq("creator_profile_id", creatorProfile?.id || "")
    .order("created_at", { ascending: false })

  const { data: purchases } = await supabase
    .from("content_purchases")
    .select("amount_usdc")
    .in("content_id", content?.map(c => c.id) || [])

  const totalEarnings = purchases?.reduce((sum, p) => sum + (p.amount_usdc || 0), 0) || 0
  const totalViews = content?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0
  const totalPurchases = purchases?.length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage your content and earnings</p>
        </div>
        {creatorProfile && (
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Upload Content
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Earnings", value: `${(totalEarnings / 1_000_000).toFixed(2)} USDC`, icon: DollarSign, color: "text-green-400" },
          { label: "Content", value: content?.length || 0, icon: Eye, color: "text-blue-400" },
          { label: "Purchases", value: totalPurchases, icon: TrendingUp, color: "text-purple-400" },
          { label: "Views", value: totalViews, icon: Eye, color: "text-yellow-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Setup creator profile or show content */}
      {!creatorProfile ? (
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center space-y-4">
          <Upload className="w-10 h-10 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-semibold">Become a Creator</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            Set up your creator profile to start uploading content and earning USDC via x402 micropayments on Arc.
          </p>
          <Link
            href="/dashboard/setup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
          >
            <Heart className="w-4 h-4" />
            Set Up Creator Profile
          </Link>
        </div>
      ) : content?.length === 0 ? (
        <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 text-center space-y-4">
          <Upload className="w-10 h-10 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-semibold">No Content Yet</h2>
          <p className="text-zinc-500">Upload your first piece of x402-gated content</p>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload First Content
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content?.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="capitalize text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {item.content_type}
                  </span>
                  <span className="text-sm text-pink-400 font-medium">
                    {(item.price_usdc / 1_000_000).toFixed(2)} USDC
                  </span>
                </div>
                <h3 className="font-medium truncate">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{item.view_count || 0} views</span>
                  <span>{item.purchase_count || 0} purchases</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
