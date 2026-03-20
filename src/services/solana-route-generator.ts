// ====================
// Solana Route Generator with X402 v2 Payment Integration
// ====================
// Uses x402-solana/server X402PaymentHandler for payment processing
// Protocol v2: CAIP-2 networks, PAYMENT-SIGNATURE header, string amounts

import type { Express, Request, Response } from "express";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import { config } from "../config/env.js";
import { callMeshTool } from "./mesh-client.js";
import { collectToolRouteDefinitions } from "./route-definitions.js";
import { type JsonSchema } from "./schema-utils.js";
import {
  getSolanaPaymentHandler,
  usdToAtomicUnits,
  USDC_MINT_MAINNET,
} from "./solana-payment-handler.js";
import { buildSolanaUnpaidResponse } from "./solana-unpaid-response.js";

const SOLANA_NETWORK = "solana" as const;

// ====================
// Main Solana Route Generator Function (v2)
// ====================
export function generateSolanaRoutes(
  app: Express,
  metadata: MeshMetadata
): RouteInfo[] {
  const routes: RouteInfo[] = [];

  // ====================
  // Solana Payment Configuration
  // ====================
  const SOLANA_PAY_TO = config.solana.treasuryAddress?.trim();

  if (!SOLANA_PAY_TO) {
    logger.info("Solana X402 disabled (missing X402_SOLANA_TREASURY_ADDRESS)");
    return [];
  }

  // Initialize payment handler (singleton)
  const paymentHandler = getSolanaPaymentHandler();

  const defs = collectToolRouteDefinitions(metadata, {
    author: SOLANA_PAY_TO,
    protocol: "x402",
    network: SOLANA_NETWORK,
    pathFor: (agentId, toolName) => `/x402/solana/agents/${agentId}/${toolName}`,
  });
  logger.info(`Generating Solana v2 routes for ${defs.length} tools`);

  // ====================
  // Register routes with v2 payment handling
  // ====================
  for (const def of defs) {
    app.post(
      def.path,
      createPaymentHandler(
        paymentHandler,
        def.agentId,
        def.toolName,
        def.priceUsd,
        def.paymentDescription,
        def.schemaWithDebug
      )
    );

    routes.push(def.routeInfo);

    logger.info(
      `✓ Configured Solana v2 route: POST ${def.path} ($${def.priceUsd} on ${SOLANA_NETWORK})`
    );
  }

  logger.info(
    `Successfully registered ${routes.length} Solana X402 v2 routes, payments to ${SOLANA_PAY_TO}`
  );
  return routes;
}

// ====================
// Payment Handler Factory (v2)
// ====================
// Creates an Express handler that implements x402 v2 payment flow
function createPaymentHandler(
  paymentHandler: ReturnType<typeof getSolanaPaymentHandler>,
  agentId: string,
  toolName: string,
  priceUsd: string,
  description: string,
  inputSchema: JsonSchema
) {
  return async (req: Request, res: Response): Promise<void> => {
    const resourceUrl = `${config.baseUrl}/x402/solana/agents/${agentId}/${toolName}`;

    try {
      // Step 1: Extract payment header (v2 uses PAYMENT-SIGNATURE)
      const paymentHeader = paymentHandler.extractPayment(req.headers as any);

      // Step 2: Create payment requirements (v2 format)
      const paymentRequirements = await paymentHandler.createPaymentRequirements(
        {
          amount: usdToAtomicUnits(parseFloat(priceUsd)),
          asset: {
            address: USDC_MINT_MAINNET,
            decimals: 6,
          },
          description,
          mimeType: "application/json",
          maxTimeoutSeconds: 120,
        },
        resourceUrl
      );

      // Step 3: No payment header → return 402
      if (!paymentHeader) {
        const response = paymentHandler.create402Response(
          paymentRequirements,
          resourceUrl
        );
        const { responseBody, paymentRequiredHeader } = buildSolanaUnpaidResponse(
          response.body as Record<string, unknown>,
          inputSchema
        );
        res.status(response.status)
          .set("PAYMENT-REQUIRED", paymentRequiredHeader)
          .json(responseBody);
        return;
      }

      // Step 4: Verify payment with facilitator
      const verified = await paymentHandler.verifyPayment(
        paymentHeader,
        paymentRequirements
      );

      if (!verified.isValid) {
        logger.warn(
          `Payment verification failed for ${agentId}/${toolName}: ${verified.invalidReason}`
        );
        res.status(402).json({
          error: "Invalid payment",
          reason: verified.invalidReason,
        });
        return;
      }

      // Step 5: Execute tool (payment verified)
      logger.info(`Executing Solana paid request for ${agentId}/${toolName}`);
      const toolArguments = req.body || {};
      const result = await callMeshTool(agentId, toolName, toolArguments);

      // Step 6: Settle payment with facilitator
      const settlement = await paymentHandler.settlePayment(
        paymentHeader,
        paymentRequirements
      );

      if (!settlement.success) {
        logger.error(
          `Settlement failed for ${agentId}/${toolName}: ${settlement.errorReason}`
        );
        // Note: We still return the result since tool execution succeeded
        // Settlement failure is logged but doesn't affect user
      } else {
        // Expose settlement metadata so clients can retrieve tx hash.
        const encodedSettlement = Buffer.from(JSON.stringify(settlement)).toString(
          "base64"
        );
        res.set("PAYMENT-RESPONSE", encodedSettlement);
        // Backward compatibility for clients still reading v1 header.
        res.set("X-PAYMENT-RESPONSE", encodedSettlement);
        // Required for browser clients to access custom response headers.
        res.set(
          "Access-Control-Expose-Headers",
          "PAYMENT-RESPONSE, X-PAYMENT-RESPONSE"
        );
      }

      // Step 7: Return result
      res.json({ result });
    } catch (error) {
      logger.error(`Solana payment handler error for ${agentId}/${toolName}:`, error);
      res.status(500).json({
        error: "Payment processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
