// ====================
// EVM v2 Route Generator with X402 Payment Integration + builder-code declaration
// ====================
// A parallel v2 (CAIP-2 / PAYMENT-SIGNATURE) route tree for Base mainnet that
// declares the Heurist builder code in its 402 responses and accepts the code
// echoed by the client (plus client service codes). Settlement goes through the
// Heurist facilitator, which appends the ERC-8021 attribution suffix on-chain.
//
// The existing v1 tree (/x402/agents/...) is left untouched; these routes live
// under /x402/base/agents/... .

import type { Express, Request, Response } from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import {
  decodePaymentSignatureHeader,
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from "@x402/core/http";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import { config } from "../config/env.js";
import { callMeshTool } from "./mesh-client.js";
import { collectToolRouteDefinitions, HEURIST_ATTRIBUTION_SUFFIX } from "./route-definitions.js";
import { type JsonSchema } from "./schema-utils.js";
import { buildBazaarDiscoveryExtension } from "./solana-discovery.js";
import { buildBuilderCodeDeclaration } from "./builder-code.js";

// Base mainnet, CAIP-2.
const EVM_V2_NETWORK = "eip155:8453";
const FACILITATOR_URL = "https://facilitator.heurist.xyz";
// Same treasury as the v1 mainnet tree: whitelisted on the facilitator (never
// redirected) and in its builder-code inject allowlist.
const HEURIST_PAY_TO = "0xa112c9c8bf655c678c768b6fd42a1c6fbfed7d60";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
// EIP-712 domain for Base USDC (required by clients to sign the authorization).
const USDC_EXTRA = { name: "USD Coin", version: "2" };
const MAX_TIMEOUT_SECONDS = 120;

function usdToAtomicUnits(usd: string): string {
  return Math.round(parseFloat(usd) * 1_000_000).toString();
}

let facilitatorClient: HTTPFacilitatorClient | null = null;
function getFacilitatorClient(): HTTPFacilitatorClient {
  if (!facilitatorClient) {
    facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
  }
  return facilitatorClient;
}

type PaymentRequirements = {
  scheme: string;
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: Record<string, unknown>;
};

export function generateEvmV2Routes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];

  const defs = collectToolRouteDefinitions(metadata, {
    protocol: "x402",
    network: "base" as const,
    pathFor: (agentId, toolName) => `/x402/base/agents/${agentId}/${toolName}`,
  });
  logger.info(`Generating EVM v2 routes for ${defs.length} tools`);

  for (const def of defs) {
    app.post(
      def.path,
      createEvmV2Handler(
        def.agentId,
        def.toolName,
        def.priceUsd,
        def.paymentDescription,
        def.schemaWithDebug,
      ),
    );
    routes.push(def.routeInfo);
    logger.info(`✓ Configured EVM v2 route: POST ${def.path} ($${def.priceUsd} on ${EVM_V2_NETWORK})`);
  }

  // Debug route (parity with /x402/debug).
  app.post(
    "/x402/base/debug",
    createEvmV2Handler(
      "debug",
      "debug",
      "0.001",
      "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time. " +
        HEURIST_ATTRIBUTION_SUFFIX,
      { type: "object", properties: {} } as JsonSchema,
      async () => {
        const sleepTime = Math.floor(Math.random() * 20) + 1;
        await new Promise((resolve) => setTimeout(resolve, sleepTime * 1000));
        return { message: `Debug mode is enabled. Slept for ${sleepTime} seconds` };
      },
    ),
  );
  routes.push({
    agentId: "debug",
    toolName: "debug",
    description: "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time.",
    path: "/x402/base/debug",
    priceUsd: "0.001",
    protocol: "x402",
    transport: "http",
    network: "base",
  });

  logger.info(
    `Successfully registered ${routes.length} EVM v2 routes (builder-code enabled), payments to ${HEURIST_PAY_TO}`,
  );
  return routes;
}

// Factory for a single v2 EVM payment-protected route. `execute` overrides the
// default Mesh tool call (used by the debug route).
function createEvmV2Handler(
  agentId: string,
  toolName: string,
  priceUsd: string,
  description: string,
  inputSchema: JsonSchema,
  execute?: (req: Request) => Promise<unknown>,
) {
  const run = execute ?? ((req: Request) => callMeshTool(agentId, toolName, req.body || {}));

  return async (req: Request, res: Response): Promise<void> => {
    const resourceUrl = `${config.baseUrl}${req.path}`;
    const requirements: PaymentRequirements = {
      scheme: "exact",
      network: EVM_V2_NETWORK,
      asset: USDC_BASE,
      amount: usdToAtomicUnits(priceUsd),
      payTo: HEURIST_PAY_TO,
      maxTimeoutSeconds: MAX_TIMEOUT_SECONDS,
      extra: USDC_EXTRA,
    };

    try {
      const sigHeader =
        req.header("PAYMENT-SIGNATURE") || req.header("payment-signature");

      // No payment → 402 declaring requirements + the builder-code extension.
      if (!sigHeader) {
        const extensions: Record<string, unknown> = {
          ...buildBazaarDiscoveryExtension(inputSchema),
          ...(buildBuilderCodeDeclaration() ?? {}),
        };
        const paymentRequired = {
          x402Version: 2,
          error: "Payment required",
          resource: { url: resourceUrl, description, mimeType: "application/json" },
          accepts: [requirements],
          extensions,
        };
        res
          .status(402)
          .set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(paymentRequired as any))
          .set(
            "Access-Control-Expose-Headers",
            "PAYMENT-REQUIRED, PAYMENT-RESPONSE, X-PAYMENT-RESPONSE",
          )
          .json(paymentRequired);
        return;
      }

      // Decode the client's payment payload (carries any echoed builder code).
      let payload;
      try {
        payload = decodePaymentSignatureHeader(sigHeader);
      } catch {
        res.status(400).json({ error: "invalid PAYMENT-SIGNATURE header" });
        return;
      }

      // Verify with the Heurist facilitator.
      const verify = await getFacilitatorClient().verify(payload as any, requirements as any);
      if (!verify.isValid) {
        logger.warn(`EVM v2 verify failed for ${agentId}/${toolName}: ${verify.invalidReason}`);
        res.status(402).json({ error: "invalid payment", reason: verify.invalidReason });
        return;
      }

      // Execute the tool (payment verified).
      logger.info(`Executing EVM v2 paid request for ${agentId}/${toolName}`);
      const result = await run(req);

      // Settle — forwards the payload (incl. echoed builder-code extension) so the
      // facilitator appends {a, w, s} to the on-chain calldata.
      const settle = await getFacilitatorClient().settle(payload as any, requirements as any);
      if (settle.success) {
        const encoded = encodePaymentResponseHeader(settle);
        res.set("PAYMENT-RESPONSE", encoded);
        res.set("X-PAYMENT-RESPONSE", Buffer.from(JSON.stringify(settle)).toString("base64"));
        res.set("Access-Control-Expose-Headers", "PAYMENT-RESPONSE, X-PAYMENT-RESPONSE");
      } else {
        // Tool already executed; surface but don't fail the user.
        logger.error(`EVM v2 settle failed for ${agentId}/${toolName}: ${settle.errorReason}`);
      }

      res.json(toolName === "debug" ? (result as object) : { result });
    } catch (error) {
      logger.error(`EVM v2 handler error for ${agentId}/${toolName}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Payment processing failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  };
}
