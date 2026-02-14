import { describe, expect, test } from "bun:test";
import { buildBazaarDiscoveryExtension } from "../src/services/solana-discovery";

describe("buildBazaarDiscoveryExtension", () => {
  test("builds v2 Bazaar discovery metadata for Solana POST input schema", () => {
    const inputSchema = {
      type: "object",
      properties: {
        lookback_days: {
          type: "integer",
          description: "Number of days of market summaries to retrieve (1-3 days).",
          default: 1,
        },
        debug: {
          type: "boolean",
          description: "Debug mode flag. ALWAYS use false.",
          default: false,
        },
      },
      required: ["lookback_days"],
    };

    const extension = buildBazaarDiscoveryExtension(inputSchema);

    expect(extension).toEqual({
      bazaar: {
        info: {
          input: {
            type: "http",
            method: "POST",
            bodyType: "json",
            body: {
              lookback_days: 1,
              debug: false,
            },
          },
          output: {
            type: "json",
            example: {
              result: {},
            },
          },
        },
        schema: {
          $schema: "https://json-schema.org/draft/2020-12/schema",
          type: "object",
          properties: {
            input: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  const: "http",
                },
                method: {
                  type: "string",
                  enum: ["POST"],
                },
                bodyType: {
                  type: "string",
                  enum: ["json"],
                },
                body: inputSchema,
              },
              required: ["type", "method", "bodyType", "body"],
              additionalProperties: false,
            },
            output: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                },
                example: {
                  type: "object",
                  properties: {
                    result: {
                      type: "object",
                      additionalProperties: true,
                    },
                  },
                },
              },
              required: ["type"],
            },
          },
          required: ["input"],
        },
      },
    });
  });
});
