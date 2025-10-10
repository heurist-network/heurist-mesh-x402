// X402-specific configuration

import { config } from "./env.js";

export const x402Config = {
  // USDC address by network
  getUsdcAddress: (): string => {
    return config.x402Network === "base"
      ? config.usdcAddressBase
      : config.usdcAddressBaseSepolia;
  },

  // Facilitator config
  getFacilitatorUrl: (): string | undefined => {
    // Testnet: use external facilitator
    if (config.x402Network === "base-sepolia") {
      return config.facilitatorUrl || "https://x402.org/facilitator";
    }
    // Production: will use @coinbase/x402 facilitator (imported in middleware)
    return undefined;
  },

  // Payment timeout
  paymentTimeoutSeconds: 300,
};
