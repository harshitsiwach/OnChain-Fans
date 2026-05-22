"use client"

import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet-connect"
import { Heart, Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2a1f3d] bg-[#0f0b14]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e040a0] to-[#7c52aa] flex items-center justify-center shadow-lg shadow-[#e040a0]/30">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="w-3 h-3 text-[#0096cc] absolute -top-0.5 -right-0.5 animate-float" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#faf5ff]">
                onchain<span className="text-[#e040a0]">fans</span>
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/", label: "Discover" },
              { href: "/creators", label: "Creators" },
              { href: "/dashboard", label: "Studio" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-[9999px] text-sm font-medium text-[#b8a9d4] hover:text-[#faf5ff] hover:bg-[#1a1425] transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Wallet */}
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
