// Metadata service - fetch and filter Mesh agents

import axios from "axios";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";
import type { MeshMetadata, AgentMetadata } from "../types/mesh.js";
import type { PaymentConfig } from "../types/x402.js";
import { x402Config } from "../config/x402.js";

let cachedMetadata: MeshMetadata | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchMeshMetadata(): Promise<MeshMetadata> {
  const now = Date.now();

  // Return cached if fresh
  if (cachedMetadata && now - lastFetch < CACHE_TTL) {
    return cachedMetadata;
  }

  logger.info("Fetching Mesh metadata from " + config.meshMetadataUrl);

  const response = await axios.get<MeshMetadata>(config.meshMetadataUrl, {
    timeout: 10000,
  });

  cachedMetadata = response.data;
  lastFetch = now;

  logger.info(`Fetched metadata for ${Object.keys(cachedMetadata.agents).length} agents`);

  return cachedMetadata;
}

export function getEligibleAgents(metadata: MeshMetadata): Array<[string, AgentMetadata]> {
  const eligible: Array<[string, AgentMetadata]> = [];

  for (const [agentId, agent] of Object.entries(metadata.agents)) {
    // Hidden agents are excluded from every route and discovery endpoint
    if (agent.metadata?.hidden) {
      continue;
    }

    // Must have x402_config.enabled = true
    if (!agent.metadata?.x402_config?.enabled) {
      continue;
    }

    // Must have author_address
    if (!agent.metadata?.author_address) {
      logger.warn(`Agent ${agentId} missing author_address, skipping`);
      continue;
    }

    // Must have tools
    if (!agent.tools || agent.tools.length === 0) {
      logger.warn(`Agent ${agentId} has no tools, skipping`);
      continue;
    }

    eligible.push([agentId, agent]);
  }

  logger.info(`Found ${eligible.length} eligible agents for X402`);
  return eligible;
}

export function getToolPrice(agent: AgentMetadata, toolName: string): string {
  // Priority: tool-specific price > agent default > global default
  const toolPrice = agent.metadata?.x402_config?.tool_prices?.[toolName];
  if (toolPrice) return toolPrice;

  const agentDefault = agent.metadata?.x402_config?.default_price_usd;
  if (agentDefault) return agentDefault;

  return config.defaultPriceUsd;
}

export function getPaymentConfig(
  agent: AgentMetadata,
  toolName: string
): PaymentConfig {
  const priceUsd = getToolPrice(agent, toolName);

  // Convert USD to USDC smallest unit (6 decimals)
  // Example: "0.10" USD -> 100000 smallest units
  const priceFloat = parseFloat(priceUsd);
  if (isNaN(priceFloat) || priceFloat < 0) {
    throw new Error(`Invalid price for ${agent.metadata?.name}/${toolName}: ${priceUsd}`);
  }

  const usdcAmount = Math.floor(priceFloat * 1_000_000);

  return {
    payTo: agent.metadata?.author_address || "",
    asset: x402Config.getUsdcAddress(),
    maxAmountRequired: usdcAmount.toString(),
    maxTimeoutSeconds: x402Config.paymentTimeoutSeconds,
    network: config.x402Network,
  };
}
