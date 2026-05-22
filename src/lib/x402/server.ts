import { createPublicClient, http, type Hex } from "viem"
import { ARC_TESTNET, CHAIN_ID, CHAIN_NAMESPACE, USDC_ADDRESS, getEIP712Domain } from "@/lib/arc/config"
import {
  type PaymentRequired,
  type PaymentRequirements,
  type PaymentPayload,
  type PaymentPermit,
  type PaymentResponse,
  X402_VERSION,
} from "./types"
import { randomBytes } from "crypto"

// USDC ABI snippets for EIP-3009
const usdcAbi = [
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    name: "transferWithAuthorization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "nonceOf",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

const publicClient = createPublicClient({
  chain: ARC_TESTNET,
  transport: http(),
})

// Generates a unique payment ID as 0x + 32 hex chars
function generatePaymentId(): string {
  return "0x" + randomBytes(16).toString("hex")
}

function generateNonce(): string {
  return "0x" + randomBytes(32).toString("hex") as `0x${string}`
}

/**
 * Generate a 402 PaymentRequired response for a content item.
 */
export function createChallenge(
  contentId: string,
  amountInBaseUnits: bigint,
  creatorAddress: `0x${string}`,
  userAddress?: `0x${string}`
): PaymentRequired & { status: number } {
  const now = Math.floor(Date.now() / 1000)
  const paymentId = generatePaymentId()

  const requirements: PaymentRequirements = {
    scheme: "exact_permit",
    network: CHAIN_NAMESPACE,
    amount: amountInBaseUnits.toString(),
    asset: USDC_ADDRESS,
    payTo: creatorAddress.toLowerCase(),
    maxTimeoutSeconds: 300, // 5 minutes
    extra: {
      name: "USDC",
      version: "2",
    },
  }

  const meta = {
    kind: "PAYMENT_ONLY" as const,
    paymentId,
    nonce: generateNonce(),
    validAfter: now - 60, // 60s clock skew tolerance
    validBefore: now + 300, // 5 min window
  }

  const challenge: PaymentRequired = {
    x402Version: X402_VERSION,
    resource: {
      url: `/api/content/${contentId}`,
      description: "Unlock this content",
      mimeType: "application/octet-stream",
    },
    accepts: [requirements],
    extensions: {
      paymentPermitContext: { meta },
    },
  }

  return { ...challenge, status: 402 as const }
}

/**
 * Verify an EIP-3009 TransferWithAuthorization signature.
 * Returns the signed payment details if valid.
 */
export async function verifyPermit(
  payload: PaymentPayload,
  serverPrivateKey: `0x${string}`,
  serverAddress: `0x${string}`
): Promise<{
  valid: boolean
  txHash?: `0x${string}`
  error?: string
  from?: `0x${string}`
  amount?: bigint
}> {
  try {
    const { accepted, payload: { signature, paymentPermit } } = payload
    const permit = paymentPermit

    // Validate time window
    const now = Math.floor(Date.now() / 1000)
    if (now < permit.meta.validAfter) {
      return { valid: false, error: "Permit not yet valid" }
    }
    if (now > permit.meta.validBefore) {
      return { valid: false, error: "Permit expired" }
    }

    // Validate payment details match what we required
    if (permit.payment.payToken.toLowerCase() !== accepted.asset.toLowerCase()) {
      return { valid: false, error: "Token mismatch" }
    }
    if (BigInt(permit.payment.payAmount) < BigInt(accepted.amount)) {
      return { valid: false, error: "Insufficient payment amount" }
    }
    if (permit.payment.payTo.toLowerCase() !== accepted.payTo.toLowerCase()) {
      return { valid: false, error: "Recipient mismatch" }
    }

    // Parse the EIP-712 signature (v, r, s)
    const sig = signature as Hex
    // viem's recoverAddress needs { v, r, s }
    const { recoverAddress, verifyTypedData } = await import("viem")
    const hash = (await import("viem")).hashTypedData({
      domain: getEIP712Domain(),
      types: {
        TransferWithAuthorization: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "validAfter", type: "uint256" },
          { name: "validBefore", type: "uint256" },
          { name: "nonce", type: "bytes32" },
        ],
      },
      primaryType: "TransferWithAuthorization",
      message: {
        from: permit.buyer as `0x${string}`,
        to: permit.payment.payTo as `0x${string}`,
        value: BigInt(permit.payment.payAmount),
        validAfter: BigInt(permit.meta.validAfter),
        validBefore: BigInt(permit.meta.validBefore),
        nonce: permit.meta.nonce as `0x${string}`,
      },
    })

    // Verify the signature is valid
    const recovered = await recoverAddress({ hash, signature: sig })
    if (recovered.toLowerCase() !== permit.buyer.toLowerCase()) {
      return { valid: false, error: "Signature doesn't match buyer" }
    }

    // Check balance on Arc
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: "balanceOf",
      args: [permit.buyer as `0x${string}`],
    })
    if (balance < BigInt(permit.payment.payAmount)) {
      return { valid: false, error: "Insufficient USDC balance" }
    }

    // Check the nonce hasn't been used
    const currentNonce = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: "nonceOf",
      args: [permit.buyer as `0x${string}`],
    })
    if (currentNonce === permit.meta.nonce) {
      // Nonce already used — payment was already submitted
      return { valid: false, error: "Nonce already consumed" }
    }

    // Submit the transferWithAuthorization to the blockchain
    // We need a wallet client with the server's private key
    const { createWalletClient, parseSignature } = await import("viem")
    const { privateKeyToAccount } = await import("viem/accounts")

    const parsedSig = parseSignature(sig)
    const account = privateKeyToAccount(serverPrivateKey)

    const walletClient = createWalletClient({
      account,
      chain: ARC_TESTNET,
      transport: http(),
    })

    const txHash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: "transferWithAuthorization",
      args: [
        permit.buyer as `0x${string}`,
        permit.payment.payTo as `0x${string}`,
        BigInt(permit.payment.payAmount),
        BigInt(permit.meta.validAfter),
        BigInt(permit.meta.validBefore),
        permit.meta.nonce as `0x${string}`,
        Number(parsedSig.v ?? 27),
        parsedSig.r ?? "0x0",
        parsedSig.s ?? "0x0",
      ],
    })

    // Wait for confirmation (sub-second on Arc)
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    if (receipt.status !== "success") {
      return { valid: false, error: "Transaction reverted", txHash }
    }

    return {
      valid: true,
      txHash,
      from: permit.buyer as `0x${string}`,
      amount: BigInt(permit.payment.payAmount),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { valid: false, error: message }
  }
}

/**
 * Generate a standard 402 JSON response.
 */
export function challengeResponse(challenge: PaymentRequired & { status: number }): Response {
  return Response.json(challenge, {
    status: 402,
    headers: {
      "X-402-Version": String(X402_VERSION),
      "Access-Control-Expose-Headers": "X-402-Version, X-Payment-Response",
    },
  })
}

/**
 * Generate a successful payment response.
 */
export function paymentSuccessResponse(
  body: BodyInit | null,
  txHash: `0x${string}`,
  headers?: Record<string, string>
): Response {
  const paymentResponse: PaymentResponse = {
    txHash,
    status: "confirmed",
  }
  return new Response(body, {
    status: 200,
    headers: {
      "X-Payment-Response": JSON.stringify(paymentResponse),
      "Access-Control-Expose-Headers": "X-Payment-Response, X-402-Version",
      ...headers,
    },
  })
}
