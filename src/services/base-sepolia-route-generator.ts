// ====================
// Base Sepolia Route Generator with X402 Payment Integration
// ====================
// Mirrors route-generator.ts (Base mainnet) but exposes the same Mesh tools on
// Base Sepolia testnet under /x402/base-sepolia/... using the public x402.org
// facilitator. Stacking a second paymentMiddleware is supported: each instance
// matches only its own routesConfig keys and next()s everything else.

import type { Express, Request, Response } from "express";
import { paymentMiddleware } from "x402-express";
import type { RoutesConfig } from "x402-express";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import { callMeshTool } from "./mesh-client.js";
import { jsonSchemaToBodyFields } from "./schema-utils.js";
import { collectToolRouteDefinitions, HEURIST_ATTRIBUTION_SUFFIX } from "./route-definitions.js";

const BASE_SEPOLIA_NETWORK = "base-sepolia" as const;

export function generateBaseSepoliaRoutes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];

  const HEURIST_PAY_TO = "0x7d9d1821d15B9e0b8Ab98A058361233E255E405D";

  const routesConfig: RoutesConfig = {};
  const handlers: Array<{ method: "POST"; path: string; handler: (req: Request, res: Response) => Promise<void> }> = [];

  const defs = collectToolRouteDefinitions(metadata, {
    protocol: "x402",
    network: BASE_SEPOLIA_NETWORK,
    pathFor: (agentId, toolName) => `/x402/base-sepolia/agents/${agentId}/${toolName}`,
  });

  logger.info(`Generating Base Sepolia routes for ${defs.length} tool definitions`);

  for (const def of defs) {
    const key = `POST ${def.path}`;

    routesConfig[key] = {
      price: `$${def.priceUsd}`,
      network: BASE_SEPOLIA_NETWORK,
      config: {
        discoverable: true,
        description: def.paymentDescription,
        mimeType: "application/json",
        inputSchema: {
          bodyType: "json",
          bodyFields: jsonSchemaToBodyFields(def.schemaWithDebug),
        },
        maxTimeoutSeconds: 120,
      },
    };

    handlers.push({
      method: "POST",
      path: def.path,
      handler: createToolHandler(def.agentId, def.toolName),
    });

    routes.push(def.routeInfo);

    logger.info(`✓ Configured Base Sepolia route: POST ${def.path}  ($${def.priceUsd} on ${BASE_SEPOLIA_NETWORK})`);
  }

  // Public testnet facilitator — no API keys required.
  const facilitatorToUse = {
    url: "https://x402.org/facilitator" as `${string}://${string}`,
  };
  logger.info(`Base Sepolia using testnet facilitator: ${facilitatorToUse.url}`);

  app.use(paymentMiddleware(HEURIST_PAY_TO, routesConfig, facilitatorToUse));

  for (const { path, handler } of handlers) {
    app.post(path, handler);
  }

  // Debug route (parity with /x402/debug on mainnet)
  app.post(
    "/x402/base-sepolia/debug",
    paymentMiddleware(HEURIST_PAY_TO, {
      "POST /x402/base-sepolia/debug": {
        price: "$0.001",
        network: BASE_SEPOLIA_NETWORK,
        config: {
          discoverable: true,
          description: "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time. " + HEURIST_ATTRIBUTION_SUFFIX,
          mimeType: "application/json",
          inputSchema: {
            bodyType: "json",
            bodyFields: {},
          },
          maxTimeoutSeconds: 120,
        },
      },
    }, facilitatorToUse),
    (_req: Request, res: Response) => {
      if (res.headersSent) {
        logger.warn('Base Sepolia debug route: Response already sent, skipping handler');
        return;
      }

      const sleepTime = Math.floor(Math.random() * 20) + 1;
      logger.info(`Base Sepolia debug call started. Sleeping for ${sleepTime} seconds...`);

      setTimeout(() => {
        if (!res.headersSent) {
          logger.info(`Base Sepolia debug call completed. Slept for ${sleepTime} seconds`);
          res.json({ message: `Debug mode is enabled. Slept for ${sleepTime} seconds` });
        } else {
          logger.warn(`Base Sepolia debug call completed but response already sent`);
        }
      }, sleepTime * 1000);
    }
  );

  routes.push({
    agentId: "debug",
    toolName: "debug",
    description: "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time.",
    path: "/x402/base-sepolia/debug",
    priceUsd: "0.001",
    protocol: "x402",
    transport: "http",
    network: BASE_SEPOLIA_NETWORK,
  });

  logger.info(`✓ Configured Base Sepolia debug route: POST /x402/base-sepolia/debug ($0.001 on ${BASE_SEPOLIA_NETWORK})`);
  logger.info(`Successfully registered ${routes.length} Base Sepolia X402 routes, payments to ${HEURIST_PAY_TO}`);
  return routes;
}

function createToolHandler(agentId: string, toolName: string) {
  return async (req: Request, res: Response) => {
    try {
      if (res.headersSent) {
        logger.warn(`Base Sepolia handler for ${agentId}/${toolName}: Response already sent, skipping`);
        return;
      }

      logger.info(`Handling Base Sepolia request for ${agentId}/${toolName}`);

      const toolArguments = req.body || {};
      const result = await callMeshTool(agentId, toolName, toolArguments);

      if (!res.headersSent) {
        res.json({ result });
      }
    } catch (error) {
      logger.error(`Error in Base Sepolia handler for ${agentId}/${toolName}:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
