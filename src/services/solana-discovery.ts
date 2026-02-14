import type { JsonSchema } from "./schema-utils.js";

function getPlaceholderValue(type: string | undefined): unknown {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
}

function buildDiscoveryInputExample(inputSchema: JsonSchema): Record<string, unknown> {
  const example: Record<string, unknown> = {};
  const properties = inputSchema.properties ?? {};
  const required = new Set(inputSchema.required ?? []);

  for (const [name, definition] of Object.entries<any>(properties)) {
    if (definition?.default !== undefined) {
      example[name] = definition.default;
      continue;
    }

    if (required.has(name)) {
      example[name] = getPlaceholderValue(definition?.type);
    }
  }

  return example;
}

export function buildBazaarDiscoveryExtension(inputSchema: JsonSchema): Record<string, unknown> {
  return {
    bazaar: {
      info: {
        input: {
          type: "http",
          method: "POST",
          bodyType: "json",
          body: buildDiscoveryInputExample(inputSchema),
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
  };
}
