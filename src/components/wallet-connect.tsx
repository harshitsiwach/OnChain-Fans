"use client"

import { useWallet, shortAddress } from "@/lib/wallet-provider"
import { Wallet, LogOut } from "lucide-react"

export function WalletConnectButton() {
  const { address, connect, disconnect, isConnecting } = useWallet()

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {shortAddress(address)}
        </div>
        <button
          onClick={disconnect}
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-500 hover:to-blue-500 transition-all disabled:opacity-50"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}
