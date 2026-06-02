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
  X402_XRPL_TREASURY_ADDRESS: "rMPwy3Ntx56Nyc2fKGNm7VRWdmpHSB92Z7",
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

describe("generateBaseSepoliaRoutes", () => {
  test("creates Base Sepolia routes for eligible tools plus a debug route", async () => {
    for (const [key, value] of Object.entries(BASE_ENV)) {
      process.env[key] = value;
    }

    const { generateBaseSepoliaRoutes } = await import("../src/services/base-sepolia-route-generator");
    const app = express();

    const routes = generateBaseSepoliaRoutes(app, metadata);

    expect(routes).toHaveLength(2);

    const toolRoute = routes.find((r) => r.agentId === "AIXBTProjectInfoAgent");
    expect(toolRoute?.path).toBe(
      "/x402/base-sepolia/agents/AIXBTProjectInfoAgent/search_projects"
    );
    expect(toolRoute?.network).toBe("base-sepolia");
    expect(toolRoute?.priceUsd).toBe("0.20");

    const debugRoute = routes.find((r) => r.agentId === "debug");
    expect(debugRoute?.path).toBe("/x402/base-sepolia/debug");
    expect(debugRoute?.network).toBe("base-sepolia");
    expect(debugRoute?.priceUsd).toBe("0.001");
  });
});
