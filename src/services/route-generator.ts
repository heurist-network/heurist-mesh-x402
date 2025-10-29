// ====================
// Dynamic Route Generator with X402 Payment Integration
// ====================
// This module dynamically generates Express routes from Heurist Mesh metadata,
// automatically applying X402 payment protection to each route.
//
// Key concepts:
// 1. Routes are generated at runtime based on agent metadata from Mesh API
// 2. Each route requires payment before execution (enforced by x402-express middleware)
// 3. Payment verification is handled by Coinbase CDP facilitator (mainnet) or testnet facilitator
// 4. All payments go to a single Heurist address (can be customized per-agent if needed)
//
// Flow: Client → 402 Payment Required → Client Pays → Middleware Verifies → Tool Executes

import type { Express, Request, Response } from "express";
import { paymentMiddleware } from "x402-express";  // X402 payment middleware
import type { RoutesConfig } from "x402-express";
import logger from "../utils/logger.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/x402.js";
import { getEligibleAgents, getPaymentConfig, getToolPrice } from "./metadata.js";
import { callMeshTool } from "./mesh-client.js";
import { config } from "../config/env.js";

// CDP facilitator config for production payment verification
import { createFacilitatorConfig } from "@coinbase/x402";

type JsonSchema = {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [k: string]: any;
};

type BodyField = {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  enum?: any[];
  default?: any;
};

// ====================
// Schema Converter: OpenAI JSON Schema → X402 bodyFields
// ====================
// X402 expects a specific "bodyFields" format for API documentation.
// This function converts OpenAI function calling schemas to that format.
//
// Example transformation:
// Input:  { type: "object", properties: { name: { type: "string", required: true } } }
// Output: { name: { type: "string", required: true } }
export function jsonSchemaToBodyFields(schema: JsonSchema | undefined): Record<string, BodyField> {
  const props = schema?.properties ?? {};
  const required = new Set(schema?.required ?? []);
  const out: Record<string, BodyField> = {};
  for (const [name, def] of Object.entries<any>(props)) {
    const t = (def?.type ?? "string") as BodyField["type"];
    out[name] = {
      type: (["string","number","integer","boolean","object","array"].includes(t) ? t : "string") as BodyField["type"],
      description: def?.description,
      required: required.has(name) || undefined,
      enum: def?.enum,
      default: def?.default,
    };
  }
  return out;
}

// ====================
// Main Route Generator Function
// ====================
// Called once at server startup to:
// 1. Fetch all eligible agents from Mesh metadata
// 2. Generate Express routes for each tool
// 3. Configure X402 payment middleware
// 4. Register route handlers
export function generateRoutes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];

  // ====================
  // Payment Configuration
  // ====================
  // All payments are sent to this single Heurist address.
  // Alternative: Use agent.metadata.author_address for per-agent payments.
  const HEURIST_PAY_TO = "0x7d9d1821d15B9e0b8Ab98A058361233E255E405D";

  // RoutesConfig: Maps route keys (e.g., "POST /x402/agents/AgentName/toolName")
  // to their payment configuration (price, network, schema, etc.)
  const routesConfig: RoutesConfig = {};

  // Handlers: Array of Express route handlers to be registered AFTER middleware
  const handlers: Array<{ method: "POST"; path: string; handler: (req: Request, res: Response) => Promise<void> }> = [];

  const eligibleAgents = getEligibleAgents(metadata);
  logger.info(`Generating routes for ${eligibleAgents.length} eligible agents`);

  // ====================
  // Step 1: Iterate through all eligible agents and their tools
  // ====================
  for (const [agentId, agent] of eligibleAgents) {
    if (!agent.tools) continue;

    for (const toolSchema of agent.tools) {
      const toolName = toolSchema.function.name;

      // Route path format: /x402/agents/{AgentId}/{toolName}
      // Example: /x402/agents/AIXBTProjectInfoAgent/search_projects
      const path = `/x402/agents/${agentId}/${toolName}`;
      const key = `POST ${path}`;

      // Get pricing for this specific tool (can be tool-specific or agent default)
      const priceUsd = getToolPrice(agent, toolName);
      const paymentCfg = getPaymentConfig(agent, toolName);

      // Extract the tool's input schema from OpenAI function format
      const bodySchema = toolSchema.function.parameters as JsonSchema;

      // ====================
      // Configure X402 route metadata
      // ====================
      // This configuration tells x402-express:
      // - How much to charge (price)
      // - Which blockchain network (network)
      // - What the API expects as input (inputSchema)
      // - What it returns as output (outputSchema)
      // - Whether it should be discoverable in X402 Bazaar (discoverable: true)
      routesConfig[key] = {
        price: `$${priceUsd}`,
        network: paymentCfg.network,                 // e.g. "base"
        config: {
          // ***** Bazaar metadata *****
          discoverable: true,                        // for Bazaar indexing
          description: toolSchema.function.description,
          mimeType: "application/json",
          // The middleware derives the resource/path; include HTTP shape + body JSON Schema
          inputSchema: {
            bodyType: "json",
            bodyFields: jsonSchemaToBodyFields(bodySchema),
          },
          maxTimeoutSeconds: 120,
        },
      };

      // ====================
      // Register route handler
      // ====================
      // The handler is called AFTER payment verification succeeds.
      // Order matters: middleware must be applied before handlers.
      handlers.push({
        method: "POST",
        path,
        handler: createToolHandler(agentId, toolName),
      });

      // Track route info for internal use (health checks, discovery endpoint)
      routes.push({
        agentId,
        toolName,
        path,
        priceUsd,
        author: HEURIST_PAY_TO,
        network: paymentCfg.network,
      });

      logger.info(`✓ Configured route: POST ${path}  ($${priceUsd} on ${paymentCfg.network})`);
    }
  }

  // ====================
  // Step 2: Apply X402 Payment Middleware
  // ====================
  // IMPORTANT: The payment middleware MUST be applied BEFORE route handlers.
  // This ensures every request is intercepted for payment verification first.

  // ====================
  // Facilitator Configuration
  // ====================
  // The facilitator verifies payment proofs from clients. Two options:

  // Option A: Production (Base Mainnet) - Use CDP API credentials
  // This is the recommended approach for mainnet. The CDP facilitator
  // handles payment verification and settlement through Coinbase's infrastructure.
  const facilitator = createFacilitatorConfig(
    config.cdpApiKeyId,      // Your CDP API Key ID from Coinbase Developer Platform
    config.cdpApiKeySecret   // Your CDP API Key Secret (keep this secure!)
  );
  logger.info(`Using CDP facilitator with API key: ${config.cdpApiKeyId?.substring(0, 8)}...`);

  // Option B: Testnet (Base Sepolia) - Use public testnet facilitator
  // Uncomment below for testnet development. No API keys required.
  // const facilitatorUrl = "https://x402.org/facilitator";
  // const facilitator = facilitatorUrl ? { url: facilitatorUrl as `${string}://${string}` } : undefined;
  // logger.info(`Using testnet facilitator: ${facilitatorUrl}`);

  // ====================
  // Apply the payment middleware globally
  // ====================
  // This single middleware instance protects ALL routes defined in routesConfig.
  // When a request comes in:
  // 1. Middleware checks if it matches a protected route
  // 2. If no X-PAYMENT header → return 402 with payment metadata
  // 3. If X-PAYMENT present → verify with facilitator
  // 4. If valid → call next() to continue to route handler
  // 5. If invalid → return 402 or error
  app.use(paymentMiddleware(HEURIST_PAY_TO, routesConfig, facilitator));

  // ====================
  // Step 3: Register Route Handlers
  // ====================
  // NOW we attach the actual route handlers. Since middleware was applied first,
  // these handlers will only execute AFTER payment verification succeeds.
  for (const { path, handler } of handlers) {
    app.post(path, handler);
  }

  logger.info(`Successfully registered ${routes.length} X402 routes, payments to ${HEURIST_PAY_TO}`);
  return routes;
}

// ====================
// Route Handler Factory
// ====================
// Creates an Express handler that forwards the request to the Mesh API.
// This is only called AFTER payment has been verified by the middleware.
//
// Flow: Payment Verified → Handler Called → Mesh API Request → Response
function createToolHandler(agentId: string, toolName: string) {
  return async (req: Request, res: Response) => {
    logger.info(`Handling request for ${agentId}/${toolName}`);

    // Extract tool arguments from request body
    const toolArguments = req.body || {};

    // Call the Mesh API to execute the tool
    const result = await callMeshTool(agentId, toolName, toolArguments);

    // Return the result to the client
    res.json({ result });
  };
}
