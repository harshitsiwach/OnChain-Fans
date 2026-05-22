"use client"

import { useWallet, shortAddress } from "@/lib/wallet-provider"
import { Wallet, LogOut } from "lucide-react"

export function WalletConnectButton() {
  const { address, connect, disconnect, isConnecting } = useWallet()

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-[9999px] bg-[#1a1425] border border-[#2a1f3d] text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-[#40c4ff] shadow-[0_0_6px_rgba(64,196,255,0.6)]" />
          <span className="text-[#b8a9d4]">{shortAddress(address)}</span>
        </div>
        <button
          onClick={disconnect}
          className="p-2 rounded-[9999px] hover:bg-[#1a1425] text-[#7a6b99] hover:text-[#e040a0] transition-all duration-200"
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
      className="btn-pill btn-pink"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}
