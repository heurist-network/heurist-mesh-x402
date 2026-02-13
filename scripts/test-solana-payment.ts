#!/usr/bin/env tsx

/**
 * Solana x402 v2 payment test script.
 *
 * Usage:
 *  SOLANA_SECRET_KEY='your-base58-phantom-export' \
 *  GATEWAY_URL=https://mesh.heurist.xyz \
 *  SOLANA_ROUTE=/x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary \
 *  bun run scripts/test-solana-payment.ts
 *
 * Required:
 *  - SOLANA_SECRET_KEY: base58 private key (Phantom export format)
 *
 * Optional:
 *  - GATEWAY_URL (default https://mesh.heurist.xyz)
 *  - SOLANA_ROUTE (default /x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary)
 *  - SOLANA_RPC_URL
 *  - SOLANA_MAX_PAYMENT (micro USDC)
 *  - SOLANA_BODY (JSON string)
 */

import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import type { WalletAdapter } from "x402-solana/types";
import { createX402Client } from "x402-solana/client";

async function main() {
  if (!process.env.SOLANA_SECRET_KEY) {
    throw new Error("SOLANA_SECRET_KEY environment variable is required");
  }

  const secretKey = bs58.decode(process.env.SOLANA_SECRET_KEY.trim());
  if (secretKey.length !== 64) {
    throw new Error("Invalid secret key length. Must be 64 bytes (base58 Phantom export)");
  }

  const keypair = Keypair.fromSecretKey(secretKey);
  const wallet: WalletAdapter = {
    publicKey: keypair.publicKey,
    address: keypair.publicKey.toBase58(),
    signTransaction: async (tx: VersionedTransaction) => {
      tx.sign([keypair]);
      return tx;
    },
  };

  const gatewayUrl = process.env.GATEWAY_URL ?? "https://mesh.heurist.xyz";
  const route = process.env.SOLANA_ROUTE ?? "/x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary";
  const body = process.env.SOLANA_BODY ? JSON.parse(process.env.SOLANA_BODY) : { limit: 1 };

  const client = createX402Client({
    wallet,
    network: "solana",
    ...(process.env.SOLANA_RPC_URL && { rpcUrl: process.env.SOLANA_RPC_URL }),
    ...(process.env.SOLANA_MAX_PAYMENT && { amount: BigInt(process.env.SOLANA_MAX_PAYMENT) }),
  });

  console.log("🚀 Solana x402 Payment Test");
  console.log("Gateway:", gatewayUrl);
  console.log("Route:", route);
  console.log("Wallet:", wallet.address);

  const response = await client.fetch(`${gatewayUrl}${route}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("\nStatus:", response.status);
  const text = await response.text();
  console.log("Response:", text);

  const receipt =
    response.headers.get("payment-response") ||
    response.headers.get("PAYMENT-RESPONSE") ||
    response.headers.get("x-payment-response") ||
    response.headers.get("X-PAYMENT-RESPONSE");
  if (receipt) {
    console.log("Receipt (base64):", receipt);
    try {
      const settlement = JSON.parse(Buffer.from(receipt, "base64").toString("utf8"));
      console.log("Settlement:", settlement);
      if (settlement?.transaction) {
        console.log("Tx Hash:", settlement.transaction);
      }
    } catch {
      console.log("Receipt decode failed (non-base64 or invalid JSON)");
    }
  }
}

main().catch((error) => {
  console.error("❌ Solana payment test failed:", error);
  process.exit(1);
});
