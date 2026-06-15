// AWS Marketplace Agent Pay route generator (extended x402).
//
// Additive sibling to the crypto rails: serves each eligible tool at
// /x402/agentpay/agents/{agentId}/{toolName}. Unpaid requests get a 402 with a
// KMS-signed quote token; paid requests (X-PAYMENT header) are verified against
// Agent Pay before the Mesh tool runs. Per-tool price is read dynamically from
// mesh metadata, so price changes need no code change.
//
// The SDK (aws-agent-pay-x402) is distributed as a tarball and loaded via a
// runtime dynamic import, so the project builds and the gateway starts
// independently of it.

import type { Express, Request, Response } from "express";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import { callMeshTool } from "./mesh-client.js";
import { config } from "../config/env.js";
import { collectToolRouteDefinitions } from "./route-definitions.js";

const AGENTPAY_NETWORK = "aws:base" as const;

export async function generateAgentPayRoutes(
  app: Express,
  metadata: MeshMetadata,
): Promise<RouteInfo[]> {
  const { productId, serviceUrl, kmsAliasArn, region } = config.agentPay;
  if (!productId || !serviceUrl || !kmsAliasArn) {
    logger.warn(
      "Agent Pay config incomplete (need AGENTPAY_PRODUCT_ID / AGENTPAY_SERVICE_URL / AGENTPAY_KMS_ALIAS_ARN)",
    );
    return [];
  }

  // Typed as string (not a literal) so the build doesn't statically resolve the
  // tarball-distributed SDK; it is required at runtime.
  const sdkModuleName: string = "aws-agent-pay-x402";
  const sdk: any = await import(sdkModuleName);

  const signer = sdk.createKmsSigner({
    keyArn: kmsAliasArn,
    region,
    serviceUrl,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  });
  const agentPay = new sdk.AgentPayServerScheme({ signer });
  const verifier = new sdk.AgentPayFacilitatorClient(
    undefined,
    undefined,
    undefined,
    undefined,
    { type: "kms", kmsKeyArn: kmsAliasArn, region },
  );

  const buildRequirements = (priceUsd: string) =>
    agentPay.enhancePaymentRequirements({
      scheme: "agent-pay",
      network: AGENTPAY_NETWORK,
      amount: priceUsd,
      asset: "iso4217:USD",
      payTo: "seller",
      maxTimeoutSeconds: 300,
      extra: { settlement: { product_id: productId } },
    });

  const defs = collectToolRouteDefinitions(metadata, {
    protocol: "agent-pay",
    network: AGENTPAY_NETWORK,
    pathFor: (agentId, toolName) =>
      `/x402/agentpay/agents/${agentId}/${toolName}`,
  });

  const routes: RouteInfo[] = [];

  for (const def of defs) {
    app.post(def.path, async (req: Request, res: Response) => {
      try {
        const paymentHeader = req.headers["x-payment"] as string | undefined;
        const requirements = await buildRequirements(def.priceUsd);

        if (!paymentHeader) {
          res.status(402).json({ x402Version: 2, accepts: [requirements] });
          return;
        }

        const payment = JSON.parse(paymentHeader);
        const verification = await verifier.verify(payment, requirements, {
          method: req.method,
          url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
          dpopProof: req.headers["dpop"] as string | undefined,
        });

        if (!verification?.isValid) {
          res.status(402).json({
            x402Version: 2,
            error: verification?.invalidMessage ?? "payment verification failed",
            accepts: [requirements],
          });
          return;
        }

        const result = await callMeshTool(def.agentId, def.toolName, req.body || {});
        if (!res.headersSent) res.json({ result });
      } catch (error) {
        logger.error(
          `Agent Pay handler error for ${def.agentId}/${def.toolName}:`,
          error,
        );
        if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
      }
    });

    routes.push(def.routeInfo);
    logger.info(`✓ Configured Agent Pay route: POST ${def.path} ($${def.priceUsd})`);
  }

  logger.info(
    `Successfully registered ${routes.length} Agent Pay routes (product ${productId})`,
  );
  return routes;
}
