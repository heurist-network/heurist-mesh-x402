// ====================
// Builder-code (ERC-8021) extension — gateway/resource-server side
// ====================
// Declares our application builder code in x402 v2 402 responses and reads any
// code echoed back by the client. The actual on-chain suffix is appended by the
// facilitator at settlement; here we only declare/echo per the x402 builder-code
// extension spec:
//   https://github.com/x402-foundation/x402/blob/main/specs/extensions/builder_code.md

export const BUILDER_CODE_EXTENSION = "builder-code";

// Our application code. Must match what is registered on Base's CodesRegistry
// to be credited. Overridable via env; defaults to "heurist".
export const BUILDER_CODE_APP = (process.env.BUILDER_CODE_APP || "heurist").trim();

const CODE_PATTERN = "^[a-z0-9_]{1,32}$";

// The JSON Schema clients validate their builder-code payload against.
const BUILDER_CODE_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    a: { type: "string", pattern: CODE_PATTERN, description: "App builder code" },
    w: { type: "string", pattern: CODE_PATTERN, description: "Wallet builder code" },
    s: {
      type: "array",
      items: { type: "string", pattern: CODE_PATTERN },
      description: "Service builder codes",
    },
  },
  additionalProperties: false,
} as const;

// Build the `extensions` entry a resource server includes in its 402 response so
// clients know which app code to echo. Returns null when no app code configured.
export function buildBuilderCodeDeclaration():
  | Record<string, unknown>
  | null {
  if (!BUILDER_CODE_APP) return null;
  return {
    [BUILDER_CODE_EXTENSION]: {
      info: { a: BUILDER_CODE_APP },
      schema: BUILDER_CODE_SCHEMA,
    },
  };
}

// Read the builder code echoed by the client from a decoded PaymentPayload.
// Tolerant of both the `{ info: { a, s } }` and flat `{ a, s }` shapes, and of
// `s` being a string or array.
export function extractEchoedBuilderCode(
  paymentPayload: unknown,
): { a?: string; s?: string[] } {
  try {
    const ext = (paymentPayload as any)?.extensions?.[BUILDER_CODE_EXTENSION];
    if (!ext || typeof ext !== "object") return {};
    const info = ext.info && typeof ext.info === "object" ? ext.info : ext;
    const a = typeof info.a === "string" ? info.a : undefined;
    let s: string[] | undefined;
    if (Array.isArray(info.s)) s = info.s.filter((x: unknown) => typeof x === "string");
    else if (typeof info.s === "string") s = [info.s];
    return { a, s };
  } catch {
    return {};
  }
}
