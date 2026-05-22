import Link from "next/link"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Heart, Upload, DollarSign, Eye, TrendingUp, Plus, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-20 space-y-6 animate-bounce-in">
        <div className="w-16 h-16 rounded-full bg-[#e040a0]/10 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 text-[#e040a0]" />
        </div>
        <h2 className="text-2xl font-bold">Creator Studio</h2>
        <p className="text-[#b8a9d4]">Sign in to manage your content and earnings</p>
        <Link href="/login" className="btn-pill btn-pink px-8 py-3">
          Sign In
        </Link>
      </div>
    )
  }

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
    <div className="space-y-8 animate-bounce-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-pink-purple">Studio</h1>
          <p className="text-[#b8a9d4] mt-1">Manage your content and earnings</p>
        </div>
        {creatorProfile && (
          <Link href="/dashboard/upload" className="btn-pill btn-pink">
            <Plus className="w-4 h-4" />
            Upload Content
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Earnings", value: `${(totalEarnings / 1_000_000).toFixed(2)} USDC`, icon: DollarSign, color: "text-[#e040a0]" },
          { label: "Content", value: content?.length || 0, icon: Eye, color: "text-[#7c52aa]" },
          { label: "Purchases", value: totalPurchases, icon: TrendingUp, color: "text-[#0096cc]" },
          { label: "Views", value: totalViews, icon: Eye, color: "text-[#e040a0]" },
        ].map((stat, i) => (
          <div key={stat.label} className="card p-5 space-y-2" style={{ animationDelay: `${0.05 * i}s` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#b8a9d4]">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-[#faf5ff]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Content area */}
      {!creatorProfile ? (
        <div className="card p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#7c52aa]/10 flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7 text-[#7c52aa]" />
          </div>
          <h2 className="text-xl font-bold">Become a Creator</h2>
          <p className="text-[#b8a9d4] max-w-md mx-auto text-sm">
            Set up your creator profile to start uploading content and earning USDC via x402 micropayments on Arc.
          </p>
          <Link href="/dashboard/setup" className="btn-pill btn-purple px-8 py-3 inline-flex">
            <Sparkles className="w-4 h-4" />
            Set Up Creator Profile
          </Link>
        </div>
      ) : content?.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#0096cc]/10 flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7 text-[#0096cc]" />
          </div>
          <h2 className="text-xl font-bold">No Content Yet</h2>
          <p className="text-[#b8a9d4] text-sm">Upload your first piece of x402-gated content</p>
          <Link href="/dashboard/upload" className="btn-pill btn-pink px-8 py-3 inline-flex">
            <Upload className="w-4 h-4" />
            Upload First Content
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#faf5ff]">Your Content</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {content?.map((item, i) => (
              <div key={item.id} className="card p-4 space-y-2" style={{ animationDelay: `${0.05 * i}s` }}>
                <div className="flex items-center justify-between">
                  <span className="badge badge-purple text-[10px] px-2.5 py-0.5 capitalize">{item.content_type}</span>
                  <span className="text-sm font-bold text-[#e040a0]">
                    {(item.price_usdc / 1_000_000).toFixed(2)} USDC
                  </span>
                </div>
                <h3 className="font-bold text-[#faf5ff] truncate">{item.title}</h3>
                <div className="flex items-center gap-4 text-xs text-[#7a6b99] font-medium">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.view_count || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {item.purchase_count || 0} purchases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
