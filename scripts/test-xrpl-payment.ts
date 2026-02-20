#!/usr/bin/env tsx

/**
 * XRPL x402 payment test script.
 *
 * Usage:
 *  XRPL_SEED='s████████████████████████' \
 *  GATEWAY_URL=https://mesh.heurist.xyz \
 *  XRPL_ROUTE=/x402/xrpl/agents/AIXBTProjectInfoAgent/get_market_summary \
 *  bun run scripts/test-xrpl-payment.ts
 *
 * Required:
 *  - XRPL_SEED: seed for an XRPL wallet that can sign transactions
 *
 * Optional:
 *  - GATEWAY_URL (default https://mesh.heurist.xyz)
 *  - XRPL_ROUTE (default /x402/xrpl/agents/AIXBTProjectInfoAgent/get_market_summary)
 *  - XRPL_WS_URL (defaults to SDK network endpoint)
 *  - XRPL_BODY (JSON string payload)
 */

import { Wallet } from "xrpl";
import { x402Fetch } from "x402-xrpl";

async function main() {
  const seed = process.env.XRPL_SEED?.trim();
  if (!seed) {
    throw new Error("XRPL_SEED environment variable is required");
  }

  const wallet = Wallet.fromSeed(seed);
  const gatewayUrl = process.env.GATEWAY_URL ?? "https://mesh.heurist.xyz";
  const route =
    process.env.XRPL_ROUTE ??
    "/x402/xrpl/agents/AIXBTProjectInfoAgent/get_market_summary";
  const body = process.env.XRPL_BODY ? JSON.parse(process.env.XRPL_BODY) : { limit: 1 };

  const fetchPaid = x402Fetch({
    wallet,
    network: "xrpl:1",
    ...(process.env.XRPL_WS_URL && { wsUrl: process.env.XRPL_WS_URL }),
  });

  console.log("🚀 XRPL x402 Payment Test");
  console.log("Gateway:", gatewayUrl);
  console.log("Route:", route);
  console.log("Wallet:", wallet.classicAddress);

  const response = await fetchPaid(`${gatewayUrl}${route}`, {
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
  console.error("❌ XRPL payment test failed:", error);
  process.exit(1);
});
