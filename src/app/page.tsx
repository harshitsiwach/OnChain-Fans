import Link from "next/link"
import { Heart, Sparkles, ArrowRight, Zap, Shield, Coins, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-24">
      {/* === Hero === */}
      <section className="relative pt-20 pb-12 text-center space-y-8 overflow-hidden">
        {/* Background orbs */}
        <div className="orb-pink absolute -top-32 -left-32" />
        <div className="orb-purple absolute -top-20 right-0" />
        <div className="orb-blue absolute bottom-0 left-1/3" />

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-xs font-medium text-[#b8a9d4] mb-6 animate-bounce-in">
            <Sparkles className="w-3.5 h-3.5 text-[#e040a0]" />
            Powered by x402 + Arc Blockchain
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight animate-bounce-in" style={{ animationDelay: "0.1s" }}>
            The OnlyFans
            <br />
            <span className="gradient-pink-purple">
              on the Blockchain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#b8a9d4] max-w-2xl mx-auto mt-6 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
            Pay-per-view content with USDC. No chargebacks. Sub-second unlocks.
            Self-custodial. Powered by x402 micropayments on Arc.
          </p>

          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 pt-8 animate-bounce-in" style={{ animationDelay: "0.3s" }}>
            <Link href="/creators" className="btn-pill btn-pink text-base px-8 py-3.5">
              Explore Content
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="btn-pill btn-outline text-base px-8 py-3.5">
              <Heart className="w-5 h-5" />
              Become a Creator
            </Link>
          </div>
        </div>
      </section>

      {/* === How it Works === */}
      <section className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-pink-purple">How It Works</h2>
          <p className="text-[#b8a9d4] mt-2">Three taps. Zero friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Wallet, title: "Connect", desc: "Use MetaMask or Face ID passkey — no email, no signup.", color: "text-[#e040a0]", bg: "bg-[#e040a0]/10", border: "border-[#e040a0]/20" },
            { icon: Zap, title: "Pay", desc: "x402 handles the 402 challenge automatically. One signature = done.", color: "text-[#7c52aa]", bg: "bg-[#7c52aa]/10", border: "border-[#7c52aa]/20" },
            { icon: Shield, title: "Unlock", desc: "Sub-second Arc finality. Content delivers instantly. No waiting.", color: "text-[#0096cc]", bg: "bg-[#0096cc]/10", border: "border-[#0096cc]/20" },
          ].map((item, i) => (
            <div key={item.title} className="card p-8 text-center space-y-4 animate-bounce-in" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className={`w-14 h-14 rounded-[16px] ${item.bg} ${item.border} border flex items-center justify-center mx-auto`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-lg font-bold text-[#faf5ff]">{item.title}</h3>
              <p className="text-sm text-[#b8a9d4] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === Features Grid === */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-pink-blue">Why Onchain Fans?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Heart, text: "Creators keep 100% — no platform cut", color: "#e040a0" },
            { icon: Shield, text: "Zero chargebacks — USDC is final", color: "#7c52aa" },
            { icon: Zap, text: "Sub-second content unlock via Arc", color: "#0096cc" },
            { icon: Star, text: "x402 gasless for fans (server pays gas)", color: "#e040a0" },
            { icon: Coins, text: "Self-custodial — you hold your keys", color: "#7c52aa" },
            { icon: Wallet, text: "Passkey wallets — no browser extensions", color: "#0096cc" },
          ].map((feature, i) => (
            <div key={feature.text} className="card p-5 flex items-start gap-3 animate-bounce-in" style={{ animationDelay: `${0.05 * i}s` }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-4.5 h-4.5" style={{ color: feature.color }} />
              </div>
              <span className="text-sm font-medium text-[#b8a9d4] leading-relaxed pt-1">{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === CTA Footer === */}
      <section className="text-center pb-16 animate-bounce-in">
        <div className="card p-12 max-w-2xl mx-auto space-y-6">
          <Heart className="w-10 h-10 text-[#e040a0] mx-auto" />
          <h2 className="text-2xl font-bold">Ready to start?</h2>
          <p className="text-[#b8a9d4]">No signup. No platform fees. Just USDC and content.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/creators" className="btn-pill btn-pink px-8 py-3">
              Explore Content
            </Link>
            <Link href="/dashboard" className="btn-pill btn-outline px-8 py-3">
              Start Creating
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Icons not imported
function Wallet(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> }
