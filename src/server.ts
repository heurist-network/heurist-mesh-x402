// Main Express server

import express from "express";
import type { Server } from "http";
import { config } from "./config/env.js";
import logger from "./utils/logger.js";
import { fetchMeshMetadata } from "./services/metadata.js";
import { generateRoutes } from "./services/route-generator.js";
import { errorHandler } from "./middleware/error-handler.js";
import type { RouteInfo } from "./types/x402.js";

const app = express();
const startTime = Date.now();
let server: Server;
let routes: RouteInfo[] = [];
let lastMetadataFetch = Date.now();

// Middleware
app.use(express.json());

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

// Discovery endpoint
app.get("/x402/agents", (_req, res) => {
  const agents = routes.reduce((acc, route) => {
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
      priceUsd: route.priceUsd,
    });
    return acc;
  }, {} as Record<string, any>);

  res.json({
    count: Object.keys(agents).length,
    agents: Object.values(agents),
  });
});

// Start server
async function start() {
  logger.info("Starting Heurist Mesh X402 Gateway...");

  // Fetch metadata and generate routes
  const metadata = await fetchMeshMetadata();
  routes = generateRoutes(app, metadata);
  lastMetadataFetch = Date.now();

  logger.info(`Generated ${routes.length} X402 routes`);

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
