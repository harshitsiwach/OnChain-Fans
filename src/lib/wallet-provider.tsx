"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface WalletState {
  address: string | null
  chainId: number | null
  provider: any | null
  isConnecting: boolean
  walletType: "none" | "metamask" | "smart"
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  provider: null,
  isConnecting: false,
  walletType: "none",
  connect: async () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    provider: null,
    isConnecting: false,
    walletType: "none",
  })

  const updateState = useCallback((partial: Partial<WalletState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      alert("No wallet found. Install MetaMask or Rabby.")
      return
    }

    updateState({ isConnecting: true })
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" })
      const chainIdHex = await eth.request({ method: "eth_chainId" })
      const chainId = parseInt(chainIdHex, 16)

      updateState({
        address: accounts[0],
        chainId,
        provider: eth,
        isConnecting: false,
        walletType: "metamask",
      })

      // Listen for changes
      eth.on("accountsChanged", (accs: string[]) => {
        updateState({ address: accs[0] || null })
      })
      eth.on("chainChanged", (hex: string) => {
        updateState({ chainId: parseInt(hex, 16) })
      })
    } catch (err) {
      console.error("Wallet connection failed:", err)
      updateState({ isConnecting: false })
    }
  }, [updateState])

  const disconnect = useCallback(() => {
    updateState({
      address: null,
      chainId: null,
      provider: null,
      walletType: "none",
    })
  }, [updateState])

  // Auto-connect on mount if already connected
  useEffect(() => {
    const eth = (window as any).ethereum
    if (eth) {
      eth.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connect()
        }
      }).catch(() => {})
    }
  }, [connect])

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

// Short wallet address display
export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
