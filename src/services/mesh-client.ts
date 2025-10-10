// Mesh API client - call tools directly

import axios from "axios";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";
import type { MeshRequest, MeshResponse } from "../types/mesh.js";

export async function callMeshTool(
  agentId: string,
  toolName: string,
  toolArguments: Record<string, any>
): Promise<MeshResponse> {
  const payload: MeshRequest = {
    agent_id: agentId,
    tool: toolName,
    tool_arguments: toolArguments,
    raw_data_only: true,
  };

  logger.info(`Calling Mesh tool: ${agentId}/${toolName}`);
  logger.debug("Tool arguments:", toolArguments);

  const url = `${config.meshApiUrl}/mesh_request`;

  // Simple retry: try once, if fails try one more time
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt > 1) {
      logger.info(`Retrying (attempt ${attempt}/2)...`);
    }

    const response = await axios.post<MeshResponse>(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": config.meshApiKey,
      },
      timeout: 120000, // 120 seconds
      validateStatus: () => true, // Don't throw on any status
    });

    logger.info(`Mesh API response status: ${response.status}`);

    // Success
    if (response.status >= 200 && response.status < 300) {
      logger.debug("Mesh response:", response.data);
      return response.data;
    }

    // Error response
    lastError = new Error(
      `Mesh API error ${response.status}: ${JSON.stringify(response.data)}`
    );

    // Don't retry on 4xx errors (client errors)
    if (response.status >= 400 && response.status < 500) {
      throw lastError;
    }

    // Retry on 5xx errors
    if (attempt < 2) {
      await sleep(1000); // Wait 1 second before retry
    }
  }

  // Both attempts failed
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
