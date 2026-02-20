// Simple env config - fail fast if required vars missing

import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value || "";
}

export const config = {
  // Mesh API
  meshApiUrl: getEnv("MESH_API_URL"),
  meshMetadataUrl: getEnv("MESH_METADATA_URL"),
  meshApiKey: getEnv("MESH_API_KEY"),

  // X402 Payment (Base mainnet only)
  x402Network: (() => {
    const value = getEnv("X402_NETWORK", false) || "base";
    if (value !== "base") {
      throw new Error("X402_NETWORK must be 'base'");
    }
    return "base" as const;
  })(),
  defaultPriceUsd: getEnv("DEFAULT_PRICE_USD"),
  usdcAddressBase: getEnv("X402_USDC_ADDRESS_BASE"),

  // CDP API (for production facilitator)
  cdpApiKeyId: getEnv("CDP_API_KEY_ID", false),
  cdpApiKeySecret: getEnv("CDP_API_KEY_SECRET", false),

  // Server
  port: parseInt(getEnv("PORT", false) || "3000"),
  nodeEnv: getEnv("NODE_ENV", false) || "development",
  baseUrl: getEnv("BASE_URL", false) || "https://mesh.heurist.xyz",

  // Solana X402 (optional)
  solana: {
    network: "solana" as const,
    treasuryAddress: getEnv("X402_SOLANA_TREASURY_ADDRESS", false) || "",
    facilitatorUrl:
      getEnv("X402_SOLANA_FACILITATOR_URL", false) ||
      "https://facilitator.payai.network",
    rpcUrl: getEnv("X402_SOLANA_RPC_URL", false) || "",
  },

  // XRPL X402 (enabled by default)
  xrpl: {
    enabled:
      (getEnv("X402_XRPL_ENABLED", false) || "true").trim().toLowerCase() !==
      "false",
    network: (() => {
      const value = getEnv("X402_XRPL_NETWORK", false) || "xrpl:0";
      if (value !== "xrpl:0" && value !== "xrpl:1") {
        throw new Error("X402_XRPL_NETWORK must be one of: 'xrpl:0', 'xrpl:1'");
      }
      return value as "xrpl:0" | "xrpl:1";
    })(),
    treasuryAddress:
      getEnv("X402_XRPL_TREASURY_ADDRESS", false) ||
      "ra9b6JX5aPVbdJhogDDddsRAcasWg7gzC3",
    facilitatorUrl:
      getEnv("X402_XRPL_FACILITATOR_URL", false) ||
      "https://xrpl-facilitator-mainnet.t54.ai",
    asset: getEnv("X402_XRPL_ASSET", false) || "rlusd",
    issuer:
      getEnv("X402_XRPL_ISSUER", false) ||
      "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
  },
};
