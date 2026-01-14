#!/usr/bin/env tsx

/**
 * Solana x402 v2 payment test script.
 *
 * Usage:
 *  SOLANA_SECRET_KEY='[12,34,...]' \
 *  GATEWAY_URL=http://localhost:3402 \
 *  SOLANA_ROUTE=/x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary \
 *  bun run scripts/test-solana-payment.ts
 *
 * Required env vars:
 *  - SOLANA_SECRET_KEY: JSON array (Uint8Array), base58 (Phantom export), or base64 64-byte key
 *
 * Optional:
 *  - GATEWAY_URL (default http://localhost:3402)
 *  - SOLANA_ROUTE (default /x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary)
 *  - SOLANA_RPC_URL
 *  - SOLANA_MAX_PAYMENT (micro USDC, bigint string) - payment limit
 *  - SOLANA_BODY (JSON string request payload)
 *
 * Protocol v2 notes:
 *  - Uses PAYMENT-SIGNATURE header instead of X-PAYMENT
 *  - Network format: CAIP-2 (solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp)
 *  - Amount as string instead of BigInt
 */

import { Buffer } from "buffer";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import type { WalletAdapter } from "x402-solana/types";
import { createX402Client } from "x402-solana/client";

function ensureWindowFetch() {
  const g = globalThis as unknown as {
    window?: { fetch?: typeof fetch };
    fetch?: typeof fetch;
  };

  if (!g.window) {
    if (!g.fetch) {
      throw new Error("Global fetch is not available. Use Node.js 18+.");
    }
    g.window = {
      fetch: g.fetch.bind(globalThis),
    };
  } else if (!g.window.fetch) {
    if (!g.fetch) {
      throw new Error("Global fetch is not available. Use Node.js 18+.");
    }
    g.window.fetch = g.fetch.bind(globalThis);
  }
}

function decodeSecretKey(raw: string): Uint8Array {
  const trimmed = raw.trim();

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error("SOLANA_SECRET_KEY JSON must be an array of numbers");
    }
    return Uint8Array.from(parsed);
  }

  // Phantom exports 64-byte secret keys as base58
  try {
    const decoded = bs58.decode(trimmed);
    if (decoded.length === 64) {
      return decoded;
    }
  } catch {
    // ignore and try other formats
  }

  // Fallback to base64-encoded secret key bytes
  try {
    const buffer = Buffer.from(trimmed, "base64");
    if (buffer.length === 64) {
      return new Uint8Array(buffer);
    }
  } catch {
    // ignore
  }

  throw new Error(
    "SOLANA_SECRET_KEY must be a JSON array, base58 (Phantom export), or base64-encoded 64-byte secret key"
  );
}

function buildWallet(secret: Uint8Array): WalletAdapter {
  const keypair = Keypair.fromSecretKey(secret);
  return {
    publicKey: keypair.publicKey,
    address: keypair.publicKey.toBase58(),
    async signTransaction(tx: VersionedTransaction): Promise<VersionedTransaction> {
      tx.sign([keypair]);
      return tx;
    },
  };
}

async function main() {
  const secretEnv = process.env.SOLANA_SECRET_KEY;
  if (!secretEnv) {
    throw new Error(
      "Set SOLANA_SECRET_KEY (JSON array or base64 secret key) before running"
    );
  }

  ensureWindowFetch();

  const gatewayUrl = process.env.GATEWAY_URL ?? "http://localhost:3402";
  const route =
    process.env.SOLANA_ROUTE ??
    "/x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary";
  const networkOverride = process.env.SOLANA_NETWORK;
  if (networkOverride && networkOverride !== "solana") {
    throw new Error("SOLANA_NETWORK must be 'solana'");
  }
  const network = "solana" as const;
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const maxPayment = process.env.SOLANA_MAX_PAYMENT
    ? BigInt(process.env.SOLANA_MAX_PAYMENT)
    : undefined;

  const requestBody = process.env.SOLANA_BODY
    ? JSON.parse(process.env.SOLANA_BODY)
    : { limit: 1 };

  const wallet = buildWallet(decodeSecretKey(secretEnv));

  const client = createX402Client({
    wallet,
    network,
    ...(rpcUrl ? { rpcUrl } : {}),
    ...(maxPayment ? { amount: maxPayment } : {}),
  });

  console.log("🚀 Sending paid request via Solana x402");
  console.log("Gateway:", gatewayUrl);
  console.log("Route:", route);
  console.log("Network:", network);

  const response = await client.fetch(`${gatewayUrl}${route}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("Response status:", response.status);
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    console.log("Response JSON:", JSON.stringify(parsed, null, 2));
  } catch {
    console.log("Raw response:", text);
  }

  // v2 uses PAYMENT-RESPONSE header (case may vary)
  const receiptHeader = response.headers.get("payment-response") || response.headers.get("PAYMENT-RESPONSE");
  if (receiptHeader) {
    console.log("Settlement receipt:", receiptHeader);
  }
}

main().catch((error) => {
  console.error("❌ Solana payment test failed:", error);
  process.exit(1);
});
