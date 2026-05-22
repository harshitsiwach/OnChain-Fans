"use client"

import Link from "next/link"
import { WalletConnectButton } from "@/components/wallet-connect"
import { Heart, Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-pink-500 fill-pink-500/30" />
              <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">onchain</span>
                <span className="text-pink-500">fans</span>
              </span>
              <span className="text-[10px] text-zinc-500 -mt-1">powered by x402 · arc</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Discover</Link>
            <Link href="/creators" className="hover:text-white transition-colors">Creators</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </nav>

          {/* Wallet */}
          <WalletConnectButton />
        </div>
      </div>
    </header>
  )
}
