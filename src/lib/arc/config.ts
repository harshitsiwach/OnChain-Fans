import { defineChain } from "viem"

export const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // native gas token uses 18 decimals
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const

// USDC ERC-20 interface address on Arc testnet — 6 decimals
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000"

// Chain constants
export const CHAIN_ID = 5042002
export const CHAIN_NAMESPACE = "eip155:5042002"
export const CCTP_DOMAIN = 26

// EIP-3009 constants
export const EIP_3009_TYPED_DATA = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const

export function getEIP712Domain() {
  return {
    name: "USDC",
    version: "2",
    chainId: CHAIN_ID,
    verifyingContract: USDC_ADDRESS as `0x${string}`,
  }
}

// USDC decimals helper
export const USDC_DECIMALS = 6
export function usdcFromBaseUnits(amount: bigint): string {
  return (Number(amount) / 10 ** USDC_DECIMALS).toFixed(2)
}
export function usdcToBaseUnits(amount: number): bigint {
  return BigInt(Math.floor(amount * 10 ** USDC_DECIMALS))
}
