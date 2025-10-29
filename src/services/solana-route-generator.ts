import type { Express, Request, Response } from "express";
import { X402PaymentHandler } from "x402-solana/server";
import { usdToMicroUsdc } from "x402-solana/utils";
import type { RouteConfig as X402RouteConfig } from "x402-solana/types";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/x402.js";
import { config } from "../config/env.js";
import { getEligibleAgents, getToolPrice } from "./metadata.js";
import { callMeshTool } from "./mesh-client.js";

const SOLANA_NETWORK = "solana" as const;
const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_USDC_DECIMALS = 6;

function resolveTreasury(): string | null {
  const treasury = config.solana.treasuryAddress?.trim();
  if (!treasury) {
    logger.info("Solana X402 disabled (missing X402_SOLANA_TREASURY_ADDRESS)");
    return null;
  }
  return treasury;
}

function buildRouteConfig(
  path: string,
  priceUsd: string,
  description: string | undefined
): X402RouteConfig | null {
  const priceFloat = parseFloat(priceUsd);
  if (Number.isNaN(priceFloat) || priceFloat <= 0) {
    logger.warn(`Skipping Solana route ${path}: invalid USD price "${priceUsd}"`);
    return null;
  }

  const microUnits = usdToMicroUsdc(priceFloat);

  let resource: `${string}://${string}`;
  try {
    resource = new URL(path, config.baseUrl).toString() as `${string}://${string}`;
  } catch (error) {
    logger.warn(
      `Unable to construct absolute resource URL for Solana route ${path}:`,
      error
    );
    return null;
  }

  return {
    price: {
      amount: microUnits.toString(),
      asset: {
        address: SOLANA_USDC_MINT,
        decimals: SOLANA_USDC_DECIMALS,
      },
    },
    network: SOLANA_NETWORK,
    config: {
      description,
      mimeType: "application/json",
      resource,
      maxTimeoutSeconds: 120,
    },
  };
}

async function handleSolanaRequest(
  req: Request,
  res: Response,
  routeConfig: X402RouteConfig,
  handler: X402PaymentHandler,
  agentId: string,
  toolName: string
) {
  let paymentRequirements;
  try {
    paymentRequirements = await handler.createPaymentRequirements(routeConfig);
  } catch (error) {
    logger.error(
      `Failed to create Solana payment requirements for ${agentId}/${toolName}:`,
      error
    );
    res.status(500).json({ error: "Unable to prepare payment requirements" });
    return;
  }

  const paymentHeader = handler.extractPayment(req.headers);
  if (!paymentHeader) {
    const response = handler.create402Response(paymentRequirements);
    res.status(response.status).json(response.body);
    return;
  }

  const verified = await handler.verifyPayment(paymentHeader, paymentRequirements);
  if (!verified) {
    res.status(402).json({ error: "Invalid payment" });
    return;
  }

  try {
    const result = await callMeshTool(agentId, toolName, req.body || {});
    const settled = await handler.settlePayment(
      paymentHeader,
      paymentRequirements
    );
    if (!settled) {
      logger.warn(
        `Settlement failed for Solana payment ${agentId}/${toolName} (request: ${req.originalUrl})`
      );
    }
    res.json({ result });
  } catch (error) {
    logger.error(
      `Error executing Mesh tool ${agentId}/${toolName} for Solana route:`,
      error
    );
    res.status(500).json({ error: "Failed to execute tool" });
  }
}

export function generateSolanaRoutes(
  app: Express,
  metadata: MeshMetadata
): RouteInfo[] {
  const treasury = resolveTreasury();
  if (!treasury) {
    return [];
  }

  const facilitatorUrl = config.solana.facilitatorUrl;
  const rpcUrl = config.solana.rpcUrl || undefined;

  const x402 = new X402PaymentHandler({
    network: SOLANA_NETWORK,
    treasuryAddress: treasury,
    facilitatorUrl,
    ...(rpcUrl ? { rpcUrl } : {}),
  });

  const routes: RouteInfo[] = [];
  const eligibleAgents = getEligibleAgents(metadata);

  logger.info(
    `Generating Solana routes for ${eligibleAgents.length} eligible agents`
  );

  for (const [agentId, agent] of eligibleAgents) {
    if (!agent.tools) continue;

    for (const toolSchema of agent.tools) {
      const toolName = toolSchema.function.name;
      const path = `/x402/solana/agents/${agentId}/${toolName}`;
      const priceUsd = getToolPrice(agent, toolName);

      const routeConfig = buildRouteConfig(
        path,
        priceUsd,
        toolSchema.function.description
      );

      if (!routeConfig) {
        continue;
      }

      app.post(path, async (req: Request, res: Response) => {
        await handleSolanaRequest(req, res, routeConfig, x402, agentId, toolName);
      });

      routes.push({
        agentId,
        toolName,
        path,
        priceUsd,
        author: treasury,
        network: SOLANA_NETWORK,
      });

      logger.info(
        `✓ Registered Solana route: POST ${path} ($${priceUsd} on ${SOLANA_NETWORK})`
      );
    }
  }

  return routes;
}
