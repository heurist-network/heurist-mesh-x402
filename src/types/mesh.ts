// Minimal types for Mesh API integration

export interface X402Config {
  enabled: boolean;
  default_price_usd: string;
  tool_prices?: Record<string, string>;
}

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface AgentMetadata {
  module: string;
  metadata?: {
    name: string;
    version: string;
    author: string;
    author_address: string;
    description: string;
    x402_config?: X402Config;
    credits?: number;
    hidden?: boolean;
  };
  tools?: ToolSchema[];
}

export interface MeshMetadata {
  agents: Record<string, AgentMetadata>;
}

export interface MeshRequest {
  agent_id: string;
  input: {
    tool: string;
    tool_arguments: Record<string, any>;
    raw_data_only: boolean;
  };
  api_key: string;
}

export interface MeshResponse {
  response?: string;
  data?: any;
  error?: string;
}
