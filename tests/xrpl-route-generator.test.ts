import { describe, expect, test } from "bun:test";
import express from "express";
import type { MeshMetadata } from "../src/types/mesh";

const BASE_ENV: Record<string, string> = {
  MESH_API_URL: "https://mesh.heurist.ai",
  MESH_METADATA_URL: "https://mesh.heurist.ai/metadata.json",
  MESH_API_KEY: "test-key",
  X402_NETWORK: "base",
  DEFAULT_PRICE_USD: "0.10",
  X402_USDC_ADDRESS_BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  X402_XRPL_TREASURY_ADDRESS: "ra9b6JX5aPVbdJhogDDddsRAcasWg7gzC3",
  X402_XRPL_FACILITATOR_URL: "https://xrpl-facilitator-mainnet.t54.ai",
  X402_XRPL_NETWORK: "xrpl:0",
  X402_XRPL_ASSET: "rlusd",
  X402_XRPL_ISSUER: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
};

const metadata: MeshMetadata = {
  agents: {
    AIXBTProjectInfoAgent: {
      module: "agents.aixbt",
      metadata: {
        name: "AIXBT Project Info Agent",
        version: "1.0.0",
        author: "Heurist",
        author_address: "0x123",
        description: "Agent",
        x402_config: {
          enabled: true,
          default_price_usd: "0.20",
        },
      },
      tools: [
        {
          type: "function",
          function: {
            name: "search_projects",
            description: "Searches projects",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
    },
  },
};

describe("generateXrplRoutes", () => {
  test("creates XRPL routes for eligible tools with configured treasury address", async () => {
    for (const [key, value] of Object.entries(BASE_ENV)) {
      process.env[key] = value;
    }

    const { generateXrplRoutes } = await import("../src/services/xrpl-route-generator");
    const app = express();

    const routes = generateXrplRoutes(app, metadata);

    expect(routes).toHaveLength(1);
    expect(routes[0]?.path).toBe(
      "/x402/xrpl/agents/AIXBTProjectInfoAgent/search_projects"
    );
    expect(routes[0]?.network).toBe("xrpl");
    expect(routes[0]?.author).toBe("ra9b6JX5aPVbdJhogDDddsRAcasWg7gzC3");
    expect(routes[0]?.priceUsd).toBe("0.20");
  });
});
