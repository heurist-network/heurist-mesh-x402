// X402 payment types

export interface PaymentConfig {
  payTo: string;
  asset: string;
  maxAmountRequired: string;
  maxTimeoutSeconds: number;
  network: "base" | "solana";
}
