import type { Express, Request, Response } from "express";
import { requirePayment } from "x402-xrpl/express";
import { config } from "../config/env.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/x402.js";
import logger from "../utils/logger.js";
import { callMeshTool } from "./mesh-client.js";
import { collectToolRouteDefinitions } from "./route-definitions.js";
import { buildXrplPaymentOption } from "./xrpl-payment-config.js";

const XRPL_NETWORK = "xrpl" as const;

export function generateXrplRoutes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];

  if (!config.xrpl.enabled) {
    logger.info("XRPL X402 disabled (X402_XRPL_ENABLED=false)");
    return routes;
  }

  const payTo = config.xrpl.treasuryAddress.trim();
  const facilitatorUrl = config.xrpl.facilitatorUrl.trim();
  const asset = config.xrpl.asset.trim();

  if (!payTo || !facilitatorUrl || !asset) {
    logger.info(
      "XRPL X402 disabled (missing one of: X402_XRPL_TREASURY_ADDRESS, X402_XRPL_FACILITATOR_URL, X402_XRPL_ASSET)"
    );
    return routes;
  }

  const defs = collectToolRouteDefinitions(metadata, {
    author: payTo,
    network: XRPL_NETWORK,
    pathFor: (agentId, toolName) => `/x402/xrpl/agents/${agentId}/${toolName}`,
  });
  logger.info(`Generating XRPL routes for ${defs.length} tools`);

  for (const def of defs) {
    const resourceUrl = `${config.baseUrl}${def.path}`;
    const paymentOption = buildXrplPaymentOption({
      asset,
      priceUsd: def.priceUsd,
      issuer: config.xrpl.issuer,
    });

    app.post(
      def.path,
      requirePayment({
        price: paymentOption.amount,
        payToAddress: payTo,
        network: config.xrpl.network,
        facilitatorUrl,
        asset: paymentOption.asset,
        ...(paymentOption.issuer ? { issuer: paymentOption.issuer } : {}),
        maxTimeoutSeconds: 120,
        resource: resourceUrl,
        description: def.paymentDescription,
        mimeType: "application/json",
      }),
      createXrplToolHandler(def.agentId, def.toolName)
    );

    routes.push(def.routeInfo);

    logger.info(
      `✓ Configured XRPL route: POST ${def.path} ($${def.priceUsd} on ${config.xrpl.network})`
    );
  }

  logger.info(
    `Successfully registered ${routes.length} XRPL routes, payments to ${payTo}`
  );
  return routes;
}

function createXrplToolHandler(agentId: string, toolName: string) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info(`Executing XRPL paid request for ${agentId}/${toolName}`);
      const toolArguments = req.body || {};
      const result = await callMeshTool(agentId, toolName, toolArguments);

      const paymentResponse = res.getHeader("PAYMENT-RESPONSE");
      if (typeof paymentResponse === "string" && paymentResponse) {
        res.set("X-PAYMENT-RESPONSE", paymentResponse);
        mergeExposeHeaders(res, ["PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"]);
      }

      res.json({ result });
    } catch (error) {
      logger.error(`XRPL route handler error for ${agentId}/${toolName}:`, error);
      res.status(500).json({
        error: "Tool execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

function mergeExposeHeaders(res: Response, headers: string[]): void {
  const existing = res.getHeader("Access-Control-Expose-Headers");
  const values =
    typeof existing === "string"
      ? existing
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean)
      : [];
  const merged = Array.from(new Set([...values, ...headers]));
  res.set("Access-Control-Expose-Headers", merged.join(", "));
}
