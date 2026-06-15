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

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.trim().toLowerCase() !== "false";
}

function parseCsv(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  const items = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : fallback;
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
      "rMPwy3Ntx56Nyc2fKGNm7VRWdmpHSB92Z7",
    facilitatorUrl:
      getEnv("X402_XRPL_FACILITATOR_URL", false) ||
      "https://xrpl-facilitator-mainnet.t54.ai",
    asset: getEnv("X402_XRPL_ASSET", false) || "rlusd",
    issuer:
      getEnv("X402_XRPL_ISSUER", false) ||
      "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
  },

  // MPP (optional)
  mpp: {
    enabled: parseBoolean(getEnv("MPP_ENABLED", false) || "true", true),
    secretKey: getEnv("MPP_SECRET_KEY", false) || "",
    tempo: {
      recipient: getEnv("MPP_TEMPO_RECIPIENT", false) || "",
      currency:
        getEnv("MPP_TEMPO_CURRENCY", false) ||
        "0x20c0000000000000000000000000000000000000",
      feePayer: parseBoolean(getEnv("MPP_TEMPO_FEE_PAYER", false), false),
    },
    stripe: {
      enabled: parseBoolean(getEnv("MPP_STRIPE_ENABLED", false), false),
      secretKey: getEnv("STRIPE_SECRET_KEY", false) || "",
      networkId: getEnv("MPP_STRIPE_NETWORK_ID", false) || "internal",
      paymentMethodTypes: parseCsv(
        getEnv("MPP_STRIPE_PAYMENT_METHOD_TYPES", false),
        ["card"]
      ),
    },
  },

  // AWS Marketplace Agent Pay (extended x402, KMS-signed quotes). productId and
  // kmsAliasArn come from the Marketplace listing + KMS; serviceUrl is the
  // registered endpoint (= quote iss).
  agentPay: {
    productId: getEnv("AGENTPAY_PRODUCT_ID", false) || "",
    serviceUrl:
      getEnv("AGENTPAY_SERVICE_URL", false) ||
      "https://mesh.heurist.xyz/x402/agentpay",
    kmsAliasArn: getEnv("AGENTPAY_KMS_ALIAS_ARN", false) || "",
    region:
      getEnv("AGENTPAY_REGION", false) ||
      getEnv("AWS_REGION", false) ||
      "us-east-1",
  },
};
