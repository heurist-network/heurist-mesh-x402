// Main Express server

import express from "express";
import type { Server } from "http";
import { config } from "./config/env.js";
import logger from "./utils/logger.js";
import { fetchMeshMetadata } from "./services/metadata.js";
import { generateRoutes } from "./services/route-generator.js";
import { generateSolanaRoutes } from "./services/solana-route-generator.js";
import { generateXrplRoutes } from "./services/xrpl-route-generator.js";
import { errorHandler } from "./middleware/error-handler.js";
import type { RouteInfo } from "./types/x402.js";
import { Buffer } from "buffer";

const app = express();
const startTime = Date.now();
let server: Server;
let routes: RouteInfo[] = [];
let baseRoutes: RouteInfo[] = [];
let solanaRoutes: RouteInfo[] = [];
let xrplRoutes: RouteInfo[] = [];
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
  p.startsWith("/x402/");

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
const buildAgentIndex = (routeList: RouteInfo[]) => {
  const agents = routeList.reduce((acc, route) => {
    if (!acc[route.agentId]) {
      acc[route.agentId] = {
        agentId: route.agentId,
        author: route.author,
        tools: [],
      };
    }
    acc[route.agentId].tools.push({
      name: route.toolName,
      path: route.path,
      resourceUrl: `${config.baseUrl}${route.path}`,
      priceUsd: route.priceUsd,
      network: route.network,
    });
    return acc;
  }, {} as Record<string, any>);

  return {
    count: Object.keys(agents).length,
    agents: Object.values(agents),
  };
};

app.get("/x402/agents", (_req, res) => {
  res.json(buildAgentIndex(baseRoutes));
});

app.get("/x402/solana/agents", (_req, res) => {
  res.json(buildAgentIndex(solanaRoutes));
});

app.get("/x402/xrpl/agents", (_req, res) => {
  res.json(buildAgentIndex(xrplRoutes));
});

// Start server
async function start() {
  logger.info("Starting Heurist Mesh X402 Gateway...");

  // Fetch metadata and generate routes
  const metadata = await fetchMeshMetadata();
  baseRoutes = generateRoutes(app, metadata);
  solanaRoutes = generateSolanaRoutes(app, metadata);
  xrplRoutes = generateXrplRoutes(app, metadata);
  routes = [...baseRoutes, ...solanaRoutes, ...xrplRoutes];
  lastMetadataFetch = Date.now();

  logger.info(
    `Generated ${baseRoutes.length} Base routes, ${solanaRoutes.length} Solana routes, and ${xrplRoutes.length} XRPL routes (total ${routes.length})`
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
