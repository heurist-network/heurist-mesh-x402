# MPP Endpoint Test Handoff

This document is for the teammate validating the new HTTP MPP integration in this gateway.

As of March 20, 2026, the gateway exposes MPP beside `x402`, under a separate namespace.

## What Was Added

- `GET /mpp/agents`
- `POST /mpp/debug`
- `POST /mpp/agents/:agentId/:toolName`

Every MPP route advertises both payment methods on the same endpoint:

- `tempo.charge`
- `stripe.charge`

The existing `/x402/...` routes are unchanged.

If `MPP_STRIPE_ENABLED=false`, the gateway advertises only Tempo.

## Expected Wire Behavior

Unpaid request:

- response status: `402 Payment Required`
- response headers include one or more `WWW-Authenticate: Payment ...`
- for MPP routes in this repo, expect two payment challenges:
  - one for Tempo
  - one for Stripe

Paid request:

- response status: `200`
- response header includes `Payment-Receipt`
- JSON body is the same tool result body returned by the existing paid handler

Discovery:

- `GET /mpp/agents` lists the MPP resource URLs and advertises `methods: ["tempo", "stripe"]`

## Gateway Env Setup

Required MPP env in this repo:

```bash
MPP_ENABLED=true
MPP_SECRET_KEY=replace-with-a-long-random-secret
MPP_TEMPO_RECIPIENT=0x...
MPP_TEMPO_CURRENCY=0x20c0000000000000000000000000000000000000
MPP_TEMPO_FEE_PAYER=false
MPP_STRIPE_ENABLED=false
STRIPE_SECRET_KEY=sk_test_...
MPP_STRIPE_NETWORK_ID=internal
MPP_STRIPE_PAYMENT_METHOD_TYPES=card
```

Notes:

- `MPP_SECRET_KEY` is required by `mppx` to sign and verify challenges. Generate it yourself with a strong random value.
- `MPP_TEMPO_CURRENCY` defaults to pathUSD on Tempo in `.env.example`.
- if `MPP_TEMPO_FEE_PAYER=true`, the server sponsors Tempo gas fees
- if `MPP_STRIPE_ENABLED=false`, Stripe env can stay empty
- if `MPP_STRIPE_ENABLED=true`, `STRIPE_SECRET_KEY` should be a Stripe test key for smoke testing
- if `MPP_STRIPE_ENABLED=true`, `MPP_STRIPE_NETWORK_ID` must match the seller network/profile that Stripe expects for machine payments

## Basic Manual Checks

1. Start the gateway with your normal local process.
2. Fetch discovery:

```bash
curl -s http://localhost:3402/mpp/agents | jq
```

3. Probe the debug endpoint without paying:

```bash
curl -i -X POST http://localhost:3402/mpp/debug \
  -H 'content-type: application/json' \
  -d '{}'
```

Expected result:

- HTTP `402`
- one or more `WWW-Authenticate` headers
- at least one challenge mentioning `method="tempo"`
- if `MPP_STRIPE_ENABLED=true`, also expect a Stripe challenge

4. Probe one real paid tool route from discovery:

```bash
curl -s http://localhost:3402/mpp/agents | jq '.agents[0].tools[0].resourceUrl'
```

## Recommended Test Order

1. Verify unpaid `402` behavior on `/mpp/debug`
2. Verify a Tempo-paid request on `/mpp/debug`
3. If Stripe is enabled, verify a Stripe-paid request on `/mpp/debug`
4. Repeat the enabled method or methods against one real tool route
5. Re-check one `/x402/...` route to confirm no regression

Use `/mpp/debug` first because it isolates payment wiring from Mesh tool execution.

## Tempo Client Smoke Test

This is the fastest end-to-end MPP client test.

Install in a scratch client app:

```bash
npm install mppx viem
```

Example script:

```ts
import { Mppx, tempo } from "mppx/client";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(process.env.MPP_TEMPO_PRIVATE_KEY as `0x${string}`);

const mppx = Mppx.create({
  polyfill: false,
  methods: [tempo.charge({ account })],
});

const response = await mppx.fetch("http://localhost:3402/mpp/debug", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({}),
});

console.log("status", response.status);
console.log("payment-receipt", response.headers.get("payment-receipt"));
console.log(await response.json());
```

Tempo client requirements:

- the account must hold the token configured in `MPP_TEMPO_CURRENCY`
- if `MPP_TEMPO_FEE_PAYER=false`, the account also needs gas
- for deterministic testing, register only the Tempo client method at first

## Stripe Client Smoke Test

Use this to validate the same MPP endpoint via `stripe.charge`.

Install in a scratch client app:

```bash
npm install mppx
```

Example Node-side smoke test:

```ts
import { Mppx, stripe } from "mppx/client";

const mppx = Mppx.create({
  polyfill: false,
  methods: [
    stripe.charge({
      paymentMethod: "pm_card_visa",
      createToken: async ({ amount, currency, expiresAt, networkId, paymentMethod }) => {
        const body = new URLSearchParams({
          payment_method: paymentMethod ?? "pm_card_visa",
          "usage_limits[currency]": currency,
          "usage_limits[max_amount]": amount,
          "usage_limits[expires_at]": String(expiresAt),
          "seller_details[network_id]": networkId ?? "internal",
          "seller_details[external_id]": `heurist-mpp-${Date.now()}`,
        });

        const response = await fetch(
          "https://api.stripe.com/v1/test_helpers/shared_payment/granted_tokens",
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(`${process.env.STRIPE_SECRET_KEY}:`).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to create SPT: ${response.status} ${await response.text()}`);
        }

        const json = await response.json() as { id: string };
        return json.id;
      },
    }),
  ],
});

const response = await mppx.fetch("http://localhost:3402/mpp/debug", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({}),
});

console.log("status", response.status);
console.log("payment-receipt", response.headers.get("payment-receipt"));
console.log(await response.json());
```

Important Stripe notes:

- the example above is for local smoke testing only
- it uses Stripe test helpers directly from a trusted developer environment
- do not expose `STRIPE_SECRET_KEY` in a browser app
- for real client-side use, move SPT creation behind your own backend endpoint

## Real Client-Side Stripe Setup

For a browser client, keep `createToken` on the client but proxy the secret-key work through your app backend.

Client example:

```ts
import { Mppx, stripe } from "mppx/client";

const mppx = Mppx.create({
  polyfill: false,
  methods: [
    stripe.charge({
      paymentMethod: "pm_card_visa",
      createToken: async (params) => {
        const response = await fetch("/api/create-spt", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`SPT helper failed: ${response.status}`);
        }

        const json = await response.json() as { spt: string };
        return json.spt;
      },
    }),
  ],
});
```

Backend helper example:

```ts
export async function createSpt(parameters: {
  amount: string;
  currency: string;
  expiresAt: number;
  networkId?: string;
  paymentMethod?: string;
}) {
  const body = new URLSearchParams({
    payment_method: parameters.paymentMethod ?? "pm_card_visa",
    "usage_limits[currency]": parameters.currency,
    "usage_limits[max_amount]": parameters.amount,
    "usage_limits[expires_at]": String(parameters.expiresAt),
    "seller_details[network_id]": parameters.networkId ?? process.env.MPP_STRIPE_NETWORK_ID ?? "internal",
    "seller_details[external_id]": `heurist-mpp-${Date.now()}`,
  });

  const response = await fetch("https://api.stripe.com/v1/test_helpers/shared_payment/granted_tokens", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.STRIPE_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Stripe SPT creation failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json() as { id: string };
  return { spt: json.id };
}
```

Replace the test-helper endpoint with your production SPT grant flow when you move beyond sandbox testing.

## Combined Client

Once the single-method checks pass, you can test both methods from one client instance:

```ts
const mppx = Mppx.create({
  polyfill: false,
  methods: [
    tempo.charge({ account }),
    stripe.charge({ createToken, paymentMethod: "pm_card_visa" }),
  ],
});
```

For deterministic debugging, prefer one method at a time first.

## What To Record In Test Notes

- gateway commit SHA or branch
- exact env used for MPP
- discovery payload for one agent
- unpaid `402` response headers
- one successful Tempo response with `Payment-Receipt`
- one successful Stripe response with `Payment-Receipt`
- whether `/x402/...` continued to work unchanged

## Official References

- Stripe MPP guide: https://docs.stripe.com/payments/machine/mpp
- Stripe Shared Payment Tokens: https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
- MPP quickstart server: https://mpp.dev/quickstart/server
- MPP quickstart client: https://mpp.dev/quickstart/client
- MPP multiple methods guide: https://mpp.dev/guides/multiple-payment-methods
- MPP Express/server SDK docs: https://mpp.dev/sdk/typescript/middlewares/express
