// ====================
// Shared Schema Utilities
// ====================
// Common types and functions for converting OpenAI JSON schemas to X402 format
// Shared between route-generator.ts and solana-route-generator.ts

export type JsonSchema = {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  [k: string]: any;
};

export type BodyField = {
  type: "string" | "number" | "integer" | "boolean" | "object" | "array";
  description?: string;
  required?: boolean;
  enum?: any[];
  default?: any;
};

// ====================
// Schema Converter: OpenAI JSON Schema → X402 bodyFields
// ====================
// X402 expects a specific "bodyFields" format for API documentation.
// This function converts OpenAI function calling schemas to that format.
//
// Example transformation:
// Input:  { type: "object", properties: { name: { type: "string", required: true } } }
// Output: { name: { type: "string", required: true } }
export function jsonSchemaToBodyFields(schema: JsonSchema | undefined): Record<string, BodyField> {
  const props = schema?.properties ?? {};
  const required = new Set(schema?.required ?? []);
  const out: Record<string, BodyField> = {};
  for (const [name, def] of Object.entries<any>(props)) {
    const t = (def?.type ?? "string") as BodyField["type"];
    out[name] = {
      type: (["string","number","integer","boolean","object","array"].includes(t) ? t : "string") as BodyField["type"],
      description: def?.description,
      required: required.has(name) || undefined,
      enum: def?.enum,
      default: def?.default,
    };
  }
  return out;
}
