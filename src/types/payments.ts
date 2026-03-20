export type PaymentProtocol = "x402" | "mpp";

export type PaymentTransport = "http";

export type PaymentNetwork = "base" | "solana" | "xrpl";

export interface RouteInfo {
  agentId: string;
  toolName: string;
  description: string;
  path: string;
  priceUsd: string;
  author: string;
  protocol: PaymentProtocol;
  transport: PaymentTransport;
  network?: PaymentNetwork;
  methods?: string[];
}
