// Solana X402 Payment Handler v2
// Uses x402-solana/server for payment verification and settlement

import { X402PaymentHandler } from "x402-solana/server";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";

// Solana mainnet USDC mint address
export const USDC_MINT_MAINNET = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// PayAI facilitator URL
const PAYAI_FACILITATOR_URL = "https://facilitator.payai.network";

// Create singleton payment handler instance
let handlerInstance: X402PaymentHandler | null = null;

export function getSolanaPaymentHandler(): X402PaymentHandler {
  if (!handlerInstance) {
    const treasuryAddress = config.solana.treasuryAddress?.trim();

    if (!treasuryAddress) {
      throw new Error(
        "X402_SOLANA_TREASURY_ADDRESS is required for Solana payment handling"
      );
    }

    handlerInstance = new X402PaymentHandler({
      network: "solana", // Auto-converted to CAIP-2 internally
      treasuryAddress,
      facilitatorUrl: PAYAI_FACILITATOR_URL,
      rpcUrl: config.solana.rpcUrl || undefined,
      defaultToken: {
        address: USDC_MINT_MAINNET,
        decimals: 6,
      },
      defaultTimeoutSeconds: 120,
    });

    logger.info(
      `Initialized Solana X402 v2 handler: treasury=${treasuryAddress.substring(0, 12)}..., facilitator=${PAYAI_FACILITATOR_URL}`
    );
  }

  return handlerInstance;
}

// Helper to convert USD price to USDC atomic units (6 decimals)
export function usdToAtomicUnits(usdPrice: number): string {
  return Math.round(usdPrice * 1_000_000).toString();
}

// Helper to convert atomic units to USD
export function atomicUnitsToUsd(atomicUnits: string): number {
  return parseInt(atomicUnits, 10) / 1_000_000;
}
