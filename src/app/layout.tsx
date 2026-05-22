import type { Metadata } from "next"
import "./globals.css"
import { WalletProvider } from "@/lib/wallet-provider"
import { Header } from "@/components/header"

export const metadata: Metadata = {
  title: "Onchain Fans — Pay-per-view Content on Arc",
  description: "OnlyFans on the blockchain. Pay-per-view content via USDC and x402 micropayments on Arc.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#0f0b14] text-[#faf5ff] antialiased min-h-screen">
        <WalletProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  )
}
