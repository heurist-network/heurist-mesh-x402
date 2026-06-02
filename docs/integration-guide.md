# Heurist Mesh x402 Integration Guide

This guide walks partners through integrating with Heurist Mesh agents over a paywalled HTTP API. Every Heurist Mesh agent tool is exposed as a REST endpoint that requires a small payment (typically $0.001–$0.10 per call, paid in stablecoins). The gateway supports three chains today:

| Chain  | Protocol  | Asset                  | Client package           |
| ------ | --------- | ---------------------- | ------------------------ |
| Base   | x402 v1   | USDC (Base mainnet)    | `x402-axios` + `viem`    |
| Solana | x402 v2   | USDC (Solana mainnet)  | `x402-solana` + `@solana/web3.js` |
| Tempo  | MPP       | pathUSD (TIP-20)       | `mppx` + `viem`          |

The gateway base URL is **`https://mesh.heurist.xyz`**.

---

## Step 1 — Discover available agents and tools

Before calling anything, list the agents and tools that are live for your chain. Each chain has its own discovery endpoint. Add `?details=true` (where supported) to include each tool's JSON-Schema parameters.

| Chain  | Discovery endpoint                                         |
| ------ | ---------------------------------------------------------- |
| Base   | `GET https://mesh.heurist.xyz/x402/agents?details=true`    |
| Solana | `GET https://mesh.heurist.xyz/x402/solana/agents?details=true` |
| Tempo  | `GET https://mesh.heurist.xyz/mpp/agents`                  |

### Example — Base discovery

```bash
curl -s 'https://mesh.heurist.xyz/x402/agents?details=true'
```

Each entry contains everything you need to make the paid call:

```json
{
  "count": 28,
  "agents": [
    {
      "agentId": "AIXBTProjectInfoAgent",
      "tools": [
        {
          "name": "search_projects",
          "description": "Search for cryptocurrency projects ...",
          "resourceUrl": "https://mesh.heurist.xyz/x402/agents/AIXBTProjectInfoAgent/search_projects",
          "priceUsd": "0.001",
          "network": "base",
          "parameters": {
            "type": "object",
            "properties": {
              "limit":  { "type": "integer", "default": 10 },
              "ticker": { "type": "string" },
              "name":   { "type": "string" },
              "chain":  { "type": "string" }
            },
            "required": []
          }
        }
      ]
    }
  ]
}
```

Important fields:

- `resourceUrl` — the exact endpoint to `POST` to.
- `priceUsd` — the amount that will be charged when you pay.
- `network` — chain hint (`base`, `solana`, or omitted for MPP).
- `parameters` — JSON Schema for the request body. Send fields that match this schema as JSON in the `POST` body.

For Tempo (MPP), the discovery payload also includes `tempo.currency`, `tempo.recipient`, and (if enabled) a `stripe` block. You don't need to copy these into your request — the `mppx` client reads the `WWW-Authenticate: Payment` challenge from the `402` response and pays accordingly.

The endpoint is just `POST <resourceUrl>` with a JSON body that matches `parameters`. The payment client below handles the `402 → pay → retry` dance for you.

---

## Step 2 — Call a paid tool

All examples assume you've picked one tool from discovery, e.g. `AIXBTProjectInfoAgent/search_projects`, and have a wallet funded with the right asset on the right chain.

### Base — x402 v1

Install:

```bash
npm install x402-axios axios viem
```

> The Heurist gateway implements **x402 protocol v1** on Base. Use a v1-compatible client such as `x402-axios` ≥ `0.6.x`. The `withPaymentInterceptor` interceptor automatically signs and submits the `X-PAYMENT` header on `402` responses and retries the request.

```ts
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Wallet must hold a small amount of USDC on Base mainnet (and a tiny ETH for gas if you ever sweep).
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});

const api = withPaymentInterceptor(axios.create(), walletClient);

const resp = await api.post(
  "https://mesh.heurist.xyz/x402/agents/AIXBTProjectInfoAgent/search_projects",
  { ticker: "ETH", limit: 5 },
  { headers: { "content-type": "application/json" } }
);

console.log(resp.status);                 // 200
console.log(resp.data.result);            // tool output
console.log(resp.headers["x-payment-response"]); // settlement receipt (base64-encoded)
```

What the interceptor does on your behalf:

1. Sends the initial `POST` with no payment header.
2. Receives `402 Payment Required` with the `accepts` array (asset, amount, payTo, network).
3. Builds and signs the EIP-3009 `transferWithAuthorization` payload, encodes it into the `X-PAYMENT` header.
4. Retries the request with `X-PAYMENT` set; the gateway verifies via the facilitator and returns `200` with the tool result.

### Solana — x402 v2

Install:

```bash
npm install x402-solana @solana/web3.js bs58
```

> The Solana endpoints use **x402 protocol v2** (CAIP-2 networks, `PAYMENT-SIGNATURE` header, on-chain SPL transfer). Use `x402-solana` ≥ `2.0`.

```ts
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import type { WalletAdapter } from "x402-solana/types";
import { createX402Client } from "x402-solana/client";

// Server-side wallet from a base58 secret key (Phantom export format, 64 bytes).
// Wallet must hold USDC (mint EPjFWdd5...v) on Solana mainnet, plus a small SOL balance for fees.
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_SECRET_KEY!));

const wallet: WalletAdapter = {
  publicKey: keypair.publicKey,
  address: keypair.publicKey.toBase58(),
  signTransaction: async (tx: VersionedTransaction) => {
    tx.sign([keypair]);
    return tx;
  },
};

const client = createX402Client({
  wallet,
  network: "solana",                 // mainnet; use "solana-devnet" for devnet
  amount: BigInt(10_000_000),        // optional safety cap — max 10 USDC per call (6 decimals)
});

const response = await client.fetch(
  "https://mesh.heurist.xyz/x402/solana/agents/AIXBTProjectInfoAgent/search_projects",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ticker: "SOL", limit: 5 }),
  }
);

console.log(response.status);                          // 200
console.log(await response.json());                    // { result: ... }

// Settlement metadata (base64-encoded JSON). Header casing varies — check both.
const receipt =
  response.headers.get("payment-response") ||
  response.headers.get("x-payment-response");
if (receipt) {
  const settlement = JSON.parse(Buffer.from(receipt, "base64").toString("utf8"));
  console.log("Tx hash:", settlement.transaction);
}
```

For browser apps, replace the `Keypair` signer with a wallet adapter (Phantom, Solflare, Backpack, Privy). See the [x402-solana README](https://www.npmjs.com/package/x402-solana) for the wallet-adapter and Privy variants.

### Tempo — MPP

Install:

```bash
npm install mppx viem
```

> Tempo uses the **Machine Payments Protocol (MPP)**, not x402. The wire format uses `WWW-Authenticate: Payment` on `402` and `Authorization: Payment` on the retry. The `mppx` client wraps `fetch` so the flow looks identical to a normal call.

```ts
import { Mppx, tempo } from "mppx/client";
import { privateKeyToAccount } from "viem/accounts";

// Wallet must hold the TIP-20 token configured in MPP_TEMPO_CURRENCY (default: pathUSD on Tempo).
// If the gateway sponsors gas (feePayer=true in discovery), no native gas is required.
const account = privateKeyToAccount(process.env.TEMPO_PRIVATE_KEY as `0x${string}`);

const mppx = Mppx.create({
  polyfill: false,
  methods: [tempo.charge({ account })],
});

const response = await mppx.fetch(
  "https://mesh.heurist.xyz/mpp/agents/AIXBTProjectInfoAgent/search_projects",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ticker: "ETH", limit: 5 }),
  }
);

console.log(response.status);                                // 200
console.log(response.headers.get("payment-receipt"));        // MPP receipt
console.log(await response.json());                          // { result: ... }
```

If the gateway also advertises `stripe` in discovery, you can register `stripe.charge(...)` in `methods` to pay with a Shared Payment Token instead — the same endpoint accepts either method on a single `402` challenge.

---

## Notes for partners

- **Idempotency / retries** — every paid call costs money. Implement client-side idempotency (cache results by request hash) so a transient network retry does not double-pay.
- **Pricing** — `priceUsd` from discovery is authoritative; do not hardcode.
- **Schemas** — pull `parameters` from `?details=true` rather than hardcoding fields. They change as Heurist Mesh evolves.
- **CORS / browser** — Solana and Tempo flows work in the browser if you use a wallet adapter. If you hit CORS on a third-party endpoint, `x402-solana` accepts a `customFetch` for proxying (see the README).
- **Settlement receipts** — keep the response header (`X-Payment-Response` for x402, `Payment-Receipt` for MPP) for your accounting / audit logs.
- **Refunds** — paid Base responses include `Link` headers pointing to `team@heurist.xyz` and the [x402refunds.com](https://x402refunds.com) request endpoint.

## Reference

- Production gateway: `https://mesh.heurist.xyz`
- Health check: `GET /health`
- Discovery (Base): `GET /x402/agents?details=true`
- Discovery (Solana): `GET /x402/solana/agents?details=true`
- Discovery (Tempo / MPP): `GET /mpp/agents`
- Heurist Mesh: <https://mesh.heurist.ai>
- x402 protocol: <https://docs.cdp.coinbase.com/x402>
- MPP protocol: <https://mpp.dev>
- Support: `team@heurist.xyz` · <https://discord.gg/heurist>
