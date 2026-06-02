export type PaymentProtocol = "x402" | "mpp";

export type PaymentTransport = "http";

export type PaymentNetwork = "base" | "base-sepolia" | "solana" | "xrpl";

export interface RouteInfo {
  agentId: string;
  toolName: string;
  description: string;
  path: string;
  priceUsd: string;
  protocol: PaymentProtocol;
  transport: PaymentTransport;
  network?: PaymentNetwork;
  methods?: string[];
  parameters?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
