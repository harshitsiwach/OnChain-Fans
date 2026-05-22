"use client"

import { getEIP712Domain, USDC_ADDRESS } from "@/lib/arc/config"
import type { PaymentRequired, PaymentPayload, X402Scheme } from "./types"

/**
 * Sign a TransferWithAuthorization permit using EIP-712.
 * This runs in the browser via window.ethereum or a viem wallet client.
 */
export async function signTransferAuthorization(
  ethProvider: any,
  from: `0x${string}`,
  to: `0x${string}`,
  amount: bigint,
  validAfter: number,
  validBefore: number,
  nonce: `0x${string}`
): Promise<`0x${string}`> {
  const domain = getEIP712Domain()
  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  }
  const value = {
    from,
    to,
    value: amount.toString(),
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
    nonce,
  }

  // Use eth_signTypedData_v4
  const signature = await ethProvider.request({
    method: "eth_signTypedData_v4",
    params: [from, JSON.stringify({
      domain,
      types,
      primaryType: "TransferWithAuthorization",
      message: value,
    })],
  })

  return signature as `0x${string}`
}

/**
 * Build a PaymentPayload from a 402 challenge response and a signed permit.
 */
export function buildPaymentPayload(
  challenge: PaymentRequired,
  signature: `0x${string}`,
  buyerAddress: `0x${string}`,
  selectedIndex: number = 0
): PaymentPayload {
  const accepted = challenge.accepts[selectedIndex]
  const meta = challenge.extensions?.paymentPermitContext?.meta
  if (!meta) throw new Error("No payment permit context in challenge")

  const permit = {
    meta: { ...meta },
    buyer: buyerAddress,
    caller: buyerAddress,
    payment: {
      payToken: accepted.asset,
      payAmount: accepted.amount,
      payTo: accepted.payTo,
    },
  }

  return {
    x402Version: challenge.x402Version,
    resource: challenge.resource,
    accepted,
    payload: {
      signature,
      paymentPermit: permit,
    },
  }
}

/**
 * Full helper: fetch a x402-gated resource.
 * Handles 402 challenge → sign → retry flow.
 */
export async function fetchX402Protected(
  url: string,
  ethProvider: any,
  userAddress: `0x${string}`,
  options?: { mimeType?: string }
): Promise<{ data: Blob; paymentTxHash?: string }> {
  // Step 1: Initial request (no payment)
  let res = await fetch(url)

  if (res.status !== 402) {
    // Already accessible (paid before or free)
    const data = await res.blob()
    return { data }
  }

  // Step 2: Parse the 402 challenge
  const challenge: PaymentRequired = await res.json()
  const accepted = challenge.accepts[0]
  const meta = challenge.extensions?.paymentPermitContext?.meta
  if (!meta) throw new Error("Malformed 402 challenge")

  // Step 3: Sign the permit
  const signature = await signTransferAuthorization(
    ethProvider,
    userAddress,
    accepted.payTo as `0x${string}`,
    BigInt(accepted.amount),
    meta.validAfter,
    meta.validBefore,
    meta.nonce as `0x${string}`
  )

  // Step 4: Build the payment payload
  const payload = buildPaymentPayload(challenge, signature, userAddress)

  // Step 5: Retry with payment header
  res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Payment-Signature": btoa(JSON.stringify(payload)),
    },
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Payment failed: ${errText}`)
  }

  const data = await res.blob()
  const paymentResponse = res.headers.get("X-Payment-Response")
  const txHash = paymentResponse
    ? (JSON.parse(paymentResponse)?.txHash as string | undefined)
    : undefined

  return { data, paymentTxHash: txHash as `0x${string}` | undefined }
}

/**
 * Check if the browser provider supports EIP-3009 (eth_signTypedData_v4).
 */
export function canSignEIP3009(): boolean {
  if (typeof window === "undefined") return false
  const eth = (window as any).ethereum
  return !!eth?.request
}
