// x402 Protocol Types — based on x402 v2 spec
// Implemented for Arc EVM (EIP-3009 TransferWithAuthorization)

export type X402Scheme = "exact_permit" | "exact"

export interface ResourceInfo {
  url?: string
  description?: string
  mimeType?: string
}

export interface PaymentRequirements {
  scheme: X402Scheme
  network: string // e.g. "eip155:5042002"
  amount: string   // smallest unit (6 decimals for USDC)
  asset: string    // token contract address
  payTo: string    // recipient address
  maxTimeoutSeconds?: number
  extra?: {
    name?: string
    version?: string
  }
}

export interface PaymentPermitMeta {
  kind: "PAYMENT_ONLY"
  paymentId: string
  nonce: string
  validAfter: number
  validBefore: number
}

export interface PaymentPermitPayment {
  payToken: string
  payAmount: string
  payTo: string
}

export interface PaymentPermit {
  meta: PaymentPermitMeta
  buyer: string
  caller: string
  payment: PaymentPermitPayment
}

export interface PaymentRequired {
  x402Version: number
  error?: string
  resource?: ResourceInfo
  accepts: PaymentRequirements[]
  extensions?: {
    paymentPermitContext?: {
      meta: PaymentPermitMeta
    }
  }
}

export interface SignedPermit {
  signature: string // hex-encoded EIP-712 signature
  permit: PaymentPermit
}

export interface PaymentPayload {
  x402Version: number
  resource?: ResourceInfo
  accepted: PaymentRequirements
  payload: {
    signature: string
    paymentPermit: PaymentPermit
  }
}

export interface PaymentResponse {
  txHash?: string
  status: "confirmed" | "pending" | "failed"
  error?: string
}

export const X402_VERSION = 2
