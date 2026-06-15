// Main Express server

import express from "express";
import type { Server } from "http";
import { config } from "./config/env.js";
import logger from "./utils/logger.js";
import { fetchMeshMetadata } from "./services/metadata.js";
import { generateRoutes } from "./services/route-generator.js";
import { generateBaseSepoliaRoutes } from "./services/base-sepolia-route-generator.js";
import { generateSolanaRoutes } from "./services/solana-route-generator.js";
import { generateXrplRoutes } from "./services/xrpl-route-generator.js";
import { generateMppRoutes } from "./services/mpp-route-generator.js";
import { errorHandler } from "./middleware/error-handler.js";
import type { RouteInfo } from "./types/payments.js";
import { Buffer } from "buffer";

const app = express();
const startTime = Date.now();
let server: Server;
let routes: RouteInfo[] = [];
let baseRoutes: RouteInfo[] = [];
let baseSepoliaRoutes: RouteInfo[] = [];
let solanaRoutes: RouteInfo[] = [];
let xrplRoutes: RouteInfo[] = [];
let mppRoutes: RouteInfo[] = [];
let agentPayRoutes: RouteInfo[] = [];
let lastMetadataFetch = Date.now();

// --- NEW: trust proxy so redirects build correct absolute URLs behind proxies
app.enable("trust proxy");

// Middleware
app.use(express.json());

let cachedFavicon: Buffer | null = null;
let cachedType: string | null = null;
let lastFetched = 0;
// Serve favicon locally but copy it from mcp.heurist.ai
app.get("/favicon.ico", async (_req, res) => {
  try {
    // Cache for 1 hour
    const cacheDuration = 60 * 60 * 1000;
    const now = Date.now();
    if (!cachedFavicon || now - lastFetched > cacheDuration) {
      const remoteUrl = "https://mcp.heurist.ai/favicon.ico";
      const response = await fetch(remoteUrl);
      if (!response.ok) throw new Error(`Failed to fetch favicon: ${response.status}`);
      const buf = Buffer.from(await response.arrayBuffer());
      cachedFavicon = buf;
      cachedType = response.headers.get("content-type") || "image/x-icon";
      lastFetched = now;
    }

    res.setHeader("Content-Type", cachedType || "image/x-icon");
    res.setHeader("Cache-Control", "public, max-age=3600"); // 1h
    res.end(cachedFavicon);
  } catch (err) {
    console.error("Error fetching favicon:", err);
    res.status(404).end();
  }
});

// --- NEW: redirect/pass-through gate
const VERCEL_HOST = "mcp.heurist.ai";
const keepLocal = (p: string) =>
  p === "/health" ||
  p === "/mesh_request" ||
  p === "/.well-known/zauthx-verify" ||
  p.startsWith("/x402/") ||
  p.startsWith("/mpp/");

// This must be before your routes; it will "next()" only for the whitelisted paths
app.use((req, res, next) => {
  if (keepLocal(req.path)) return next();

  // Everything else → redirect to the Vercel site, preserving the path/query.
  // Use 308 for GET/HEAD (permanent, preserves method), 307 for others (temporary, preserves method).
  const status = (req.method === "GET" || req.method === "HEAD") ? 308 : 307;
  const target = new URL(req.originalUrl, `https://${VERCEL_HOST}`);
  return res.redirect(status, target.toString());
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    env: config.nodeEnv,
    routes_count: routes.length,
    last_metadata_fetch: Math.floor((Date.now() - lastMetadataFetch) / 1000),
  });
});

// ZAuthX verification endpoint
app.get("/.well-known/zauthx-verify", (_req, res) => {
  res.type("text/plain");
  res.send("zauthx_verify_cddef78c53cbc92b160e19c1851d6933");
});

// Discovery endpoint (local)
const buildAgentIndex = (
  routeList: RouteInfo[],
  options?: { details?: boolean },
) => {
  const agents = routeList.reduce((acc, route) => {
    if (!acc[route.agentId]) {
      acc[route.agentId] = {
        agentId: route.agentId,
        tools: [],
      };
    }
    const tool: Record<string, any> = {
      name: route.toolName,
      description: route.description,
      resourceUrl: `${config.baseUrl}${route.path}`,
      priceUsd: route.priceUsd,
      network: route.network,
    };
    if (options?.details && route.parameters) {
      tool.parameters = route.parameters;
    }
    acc[route.agentId].tools.push(tool);
    return acc;
  }, {} as Record<string, any>);

  return {
    count: Object.keys(agents).length,
    agents: Object.values(agents),
  };
};

const buildMppAgentIndex = (routeList: RouteInfo[]) => {
  const agents = routeList.reduce((acc, route) => {
    if (!acc[route.agentId]) {
      acc[route.agentId] = {
        agentId: route.agentId,
        tools: [],
      };
    }
    acc[route.agentId].tools.push({
      name: route.toolName,
      description: route.description,
      resourceUrl: `${config.baseUrl}${route.path}`,
      priceUsd: route.priceUsd,
      tempo: {
        currency: config.mpp.tempo.currency,
        recipient: config.mpp.tempo.recipient,
        feePayer: config.mpp.tempo.feePayer,
      },
      stripe: {
        networkId: config.mpp.stripe.networkId,
        paymentMethodTypes: config.mpp.stripe.paymentMethodTypes,
      },
    });
    return acc;
  }, {} as Record<string, any>);

  return {
    count: Object.keys(agents).length,
    agents: Object.values(agents),
  };
};

app.get("/x402/agents", (req, res) => {
  const details = req.query.details === "true";
  res.json(buildAgentIndex(baseRoutes, { details }));
});

app.get("/x402/base-sepolia/agents", (req, res) => {
  const details = req.query.details === "true";
  res.json(buildAgentIndex(baseSepoliaRoutes, { details }));
});

app.get("/x402/solana/agents", (req, res) => {
  const details = req.query.details === "true";
  res.json(buildAgentIndex(solanaRoutes, { details }));
});

app.get("/x402/xrpl/agents", (_req, res) => {
  res.json(buildAgentIndex(xrplRoutes));
});

app.get("/mpp/agents", (_req, res) => {
  res.json(buildMppAgentIndex(mppRoutes));
});

app.get("/x402/agentpay/agents", (req, res) => {
  const details = req.query.details === "true";
  res.json(buildAgentIndex(agentPayRoutes, { details }));
});

// Start server
async function start() {
  logger.info("Starting Heurist Mesh X402 Gateway...");

  // Fetch metadata and generate routes
  const metadata = await fetchMeshMetadata();
  baseRoutes = generateRoutes(app, metadata);
  baseSepoliaRoutes = generateBaseSepoliaRoutes(app, metadata);
  solanaRoutes = generateSolanaRoutes(app, metadata);
  xrplRoutes = generateXrplRoutes(app, metadata);
  mppRoutes = generateMppRoutes(app, metadata);

  // Agent Pay loads dynamically (its SDK is a separately distributed package);
  // failures are isolated so the rest of the gateway always comes up.
  try {
    const { generateAgentPayRoutes } = await import(
      "./services/agentpay-route-generator.js"
    );
    agentPayRoutes = await generateAgentPayRoutes(app, metadata);
  } catch (err) {
    logger.error("Agent Pay routes failed to load:", err);
  }

  routes = [...baseRoutes, ...baseSepoliaRoutes, ...solanaRoutes, ...xrplRoutes, ...mppRoutes, ...agentPayRoutes];
  lastMetadataFetch = Date.now();

  logger.info(
    `Generated ${baseRoutes.length} Base routes, ${baseSepoliaRoutes.length} Base Sepolia routes, ${solanaRoutes.length} Solana routes, ${xrplRoutes.length} XRPL routes, ${mppRoutes.length} MPP routes, and ${agentPayRoutes.length} Agent Pay routes (total ${routes.length})`
  );

  // Error handler (must be last)
  app.use(errorHandler);

  // Start listening
  server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
    logger.info(`Network: ${config.x402Network}`);
    logger.info(`Ready to accept requests!`);
  });
}

// Graceful shutdown
function shutdown() {
  logger.info("Shutdown signal received, closing server...");

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
