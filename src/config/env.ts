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

  // X402 Payment
  x402Network: getEnv("X402_NETWORK") as "base" | "base-sepolia",
  defaultPriceUsd: getEnv("DEFAULT_PRICE_USD"),
  usdcAddressBase: getEnv("X402_USDC_ADDRESS_BASE"),
  usdcAddressBaseSepolia: getEnv("X402_USDC_ADDRESS_BASE_SEPOLIA"),
  facilitatorUrl: getEnv("X402_FACILITATOR_URL", false),

  // CDP API (for production facilitator)
  cdpApiKeyId: getEnv("CDP_API_KEY_ID", false),
  cdpApiKeySecret: getEnv("CDP_API_KEY_SECRET", false),

  // Server
  port: parseInt(getEnv("PORT", false) || "3000"),
  nodeEnv: getEnv("NODE_ENV", false) || "development",
  baseUrl: getEnv("BASE_URL", false) || "https://mesh.heurist.xyz",
};
