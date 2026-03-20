// X402 payment types

export interface PaymentConfig {
  payTo: string;
  asset: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  network: "base" | "solana";
}

export interface RouteInfo {
  agentId: string;
  toolName: string;
  description: string;
  path: string;
  priceUsd: string;
  author: string;
  network: "base" | "solana" | "xrpl";
}
