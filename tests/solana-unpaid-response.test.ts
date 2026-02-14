import { describe, expect, test } from "bun:test";
import { buildSolanaUnpaidResponse } from "../src/services/solana-unpaid-response";

describe("buildSolanaUnpaidResponse", () => {
  test("keeps bazaar extension in JSON body but excludes it from PAYMENT-REQUIRED header", () => {
    const baseResponseBody = {
      x402Version: 2,
      error: "Payment Required",
      accepts: [
        {
          scheme: "exact",
          network: "solana",
          maxAmountRequired: "10000",
          resource: "https://mesh.heurist.xyz/x402/solana/agents/TestAgent/test_tool",
          description: "Tool payment",
          mimeType: "application/json",
          payTo: "TreasuryAddress111111111111111111111111111111",
          maxTimeoutSeconds: 120,
          asset: {
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            decimals: 6,
            eip712: undefined,
          },
          extra: {
            description: "Tool payment",
            resource: "https://mesh.heurist.xyz/x402/solana/agents/TestAgent/test_tool",
          },
        },
      ],
    };

    const inputSchema = {
      type: "object",
      properties: {
        lookback_days: {
          type: "integer",
          description: "Number of days to look back.",
          default: 1,
        },
        include_sentiment: {
          type: "boolean",
          description: "Whether to include sentiment analysis.",
          default: false,
        },
      },
      required: ["lookback_days"],
    };

    const { responseBody, paymentRequiredHeader } = buildSolanaUnpaidResponse(
      baseResponseBody,
      inputSchema
    );

    expect(responseBody.extensions).toBeDefined();
    expect(responseBody.extensions).toHaveProperty("bazaar");

    const decodedHeader = JSON.parse(
      Buffer.from(paymentRequiredHeader, "base64").toString("utf8")
    );

    expect(decodedHeader).toEqual(baseResponseBody);
    expect(decodedHeader.extensions).toBeUndefined();

    const buggyHeader = Buffer.from(JSON.stringify(responseBody)).toString("base64");
    expect(paymentRequiredHeader.length).toBeLessThan(buggyHeader.length);
  });
});
