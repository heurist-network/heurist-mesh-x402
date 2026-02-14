import type { JsonSchema } from "./schema-utils.js";
import { buildBazaarDiscoveryExtension } from "./solana-discovery.js";

type JsonObject = Record<string, unknown>;

export function buildSolanaUnpaidResponse(
  baseResponseBody: JsonObject,
  inputSchema: JsonSchema
): { responseBody: JsonObject; paymentRequiredHeader: string } {
  const bazaarExtension = buildBazaarDiscoveryExtension(inputSchema);
  const responseBody: JsonObject = {
    ...baseResponseBody,
    extensions: {
      ...((baseResponseBody.extensions as JsonObject | undefined) ?? {}),
      ...bazaarExtension,
    },
  };

  // Keep header compact for proxy limits while body carries full discovery metadata.
  const paymentRequiredHeader = Buffer.from(
    JSON.stringify(baseResponseBody)
  ).toString("base64");

  return { responseBody, paymentRequiredHeader };
}
