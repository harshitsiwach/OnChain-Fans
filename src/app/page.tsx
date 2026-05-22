import Link from "next/link"
import { Heart, Sparkles, ArrowRight, Zap, Shield, Coins } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="pt-16 pb-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-4">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          Powered by x402 + Arc Blockchain
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
          The OnlyFans
          <br />
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            on the Blockchain
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Pay-per-view content with USDC. No chargebacks. Sub-second unlocks.
          Self-custodial. Powered by x402 micropayments on Arc.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/creators"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all"
          >
            Explore Content
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-900 transition-all"
          >
            Become a Creator
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { icon: Zap, title: "Connect Wallet", desc: "Use MetaMask or passkey — no signup needed. Face ID to pay." },
          { icon: Coins, title: "Pay with USDC", desc: "x402 protocol automatically handles the 402 challenge. One tap to unlock." },
          { icon: Shield, title: "Instant Access", desc: "Sub-second Arc finality means content unlocks immediately. No waiting." },
        ].map((item) => (
          <div key={item.title} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600/20 to-purple-600/20 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-pink-400" />
            </div>
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-zinc-500">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto text-center space-y-8 pb-16">
        <h2 className="text-2xl font-bold">Why Onchain Fans?</h2>
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            "Creators keep 100% — no platform cut",
            "Zero chargebacks — USDC is final",
            "Sub-second content unlock via Arc",
            "x402 gasless for fans (server pays gas)",
            "Self-custodial — you hold your keys",
            "Passkey wallets — no browser extensions",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
              <Heart className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
