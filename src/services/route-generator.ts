// Route generator - create X402-protected routes for Mesh tools

import type { Express, Request, Response } from "express";
import { x402 } from "x402-express";
import { config } from "../config/env.js";
import { x402Config } from "../config/x402.js";
import logger from "../utils/logger.js";
import type { MeshMetadata, AgentMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/x402.js";
import { getEligibleAgents, getPaymentConfig, getToolPrice } from "./metadata.js";
import { callMeshTool } from "./mesh-client.js";

export function generateRoutes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const eligibleAgents = getEligibleAgents(metadata);

  logger.info(`Generating routes for ${eligibleAgents.length} eligible agents`);

  for (const [agentId, agent] of eligibleAgents) {
    if (!agent.tools) continue;

    for (const toolSchema of agent.tools) {
      const toolName = toolSchema.function.name;
      const path = `/x402/agents/${agentId}/${toolName}`;
      const priceUsd = getToolPrice(agent, toolName);
      const paymentConfig = getPaymentConfig(agent, toolName);

      // Create route handler
      const handler = createToolHandler(agentId, agent, toolName);

      // Get facilitator URL based on environment
      const facilitatorUrl = x402Config.getFacilitatorUrl();

      // Configure X402 middleware
      const x402Middleware = x402({
        payTo: paymentConfig.payTo,
        maxAmountRequired: paymentConfig.maxAmountRequired,
        asset: paymentConfig.asset,
        network: paymentConfig.network,
        maxTimeoutSeconds: paymentConfig.maxTimeoutSeconds,
        facilitatorUrl: facilitatorUrl,
        discoverable: true,
        description: toolSchema.function.description,
        inputSchema: toolSchema.function.parameters,
        outputSchema: {
          type: "object",
          properties: {
            result: {
              type: "object",
              description: "Tool execution result from Mesh API",
            },
          },
        },
      });

      // Register route with X402 middleware
      app.post(path, x402Middleware, handler);

      routes.push({
        agentId,
        toolName,
        path,
        priceUsd,
        author: agent.author_address,
      });

      logger.info(
        `✓ Registered route: POST ${path} (${priceUsd} USD → ${paymentConfig.maxAmountRequired} USDC)`
      );
    }
  }

  logger.info(`Successfully registered ${routes.length} X402 routes`);
  return routes;
}

function createToolHandler(
  agentId: string,
  agent: AgentMetadata,
  toolName: string
) {
  return async (req: Request, res: Response) => {
    logger.info(`Handling request for ${agentId}/${toolName}`);

    // Extract tool arguments from request body
    const toolArguments = req.body || {};

    logger.debug(`Tool arguments:`, toolArguments);

    // Call Mesh API
    const result = await callMeshTool(agentId, toolName, toolArguments);

    // Return result
    res.json({ result });
  };
}
