// X402-specific configuration

import { config } from "./env.js";

export const x402Config = {
  // USDC address by network
  getUsdcAddress: (): string => {
    return config.usdcAddressBase;
  },

  // Payment timeout
  paymentTimeoutSeconds: 300,
};
