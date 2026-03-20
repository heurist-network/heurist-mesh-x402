# MPP Integration Scope For This Repo

This file maps the official MPP docs onto the current `heurist-mesh-x402` codebase.

## Current shape of the codebase

Today the gateway exposes paid Mesh tools through three `x402`-style stacks:

- Base routes in [src/services/route-generator.ts](/home/appuser/heurist-mesh-x402/src/services/route-generator.ts)
- Solana routes in [src/services/solana-route-generator.ts](/home/appuser/heurist-mesh-x402/src/services/solana-route-generator.ts)
- XRPL routes in [src/services/xrpl-route-generator.ts](/home/appuser/heurist-mesh-x402/src/services/xrpl-route-generator.ts)

The server indexes those routes in [src/server.ts](/home/appuser/heurist-mesh-x402/src/server.ts).

The current implementation assumes:

- protocol-specific route namespaces under `/x402/...`
- protocol-specific request and response headers
- `RouteInfo.network` as the main protocol/rail label
- middleware-first verification before Mesh tool execution

## High-confidence MPP fit

MPP fits the existing product model well:

- the server issues `402` challenges
- the client retries with proof of payment
- the server executes the protected call only after verification
- the response carries a receipt

That means the existing route-generation pattern can be reused.

## High-confidence MPP differences

MPP is not just `x402` with a new facilitator. The official docs introduce meaningful differences:

- HTTP header contract is different:
  `WWW-Authenticate`, `Authorization`, `Payment-Receipt`
- MCP transport is first-class:
  JSON-RPC `-32042` plus `_meta.org.paymentauth/*`
- multiple payment methods can be advertised on one endpoint
- Stripe-backed flows can rely on Shared Payment Tokens and `PaymentIntent`
- Tempo-backed flows are not modeled like the current Solana or XRPL integrations

Because of that, we should not force MPP into the existing `x402` route handlers or header names.

## Recommended implementation shape

### 1. Add a separate MPP route generator

Add a new generator, likely `src/services/mpp-route-generator.ts`, with route paths under a new namespace such as:

- `/mpp/agents/:agentId/:toolName`

Reason:

- avoids mixing incompatible header semantics with `/x402/...`
- keeps discovery and client expectations clean
- makes it possible to support both protocols on the same tool

### 2. Add protocol-aware route metadata

The existing [src/types/x402.ts](/home/appuser/heurist-mesh-x402/src/types/x402.ts) is too `x402`-named and too narrow for MPP growth.

Expected follow-up:

- split protocol-neutral route metadata into a new type file
- add a protocol field like `protocol: "x402" | "mpp"`
- keep network or method detail separate from protocol

Reason:

- MPP can expose multiple methods on one route
- Stripe MPP is not naturally represented by the current `"base" | "solana" | "xrpl"` network union

### 3. Add a dedicated MPP discovery endpoint

The current discovery endpoints are:

- `/x402/agents`
- `/x402/solana/agents`
- `/x402/xrpl/agents`

MPP should get its own index, for example:

- `/mpp/agents`

That index should describe:

- route URL
- price
- supported MPP methods
- protocol

Potentially also:

- `transport: "http"`
- future `transport: "mcp"`

### 4. Start with HTTP transport, not MCP

MPP’s MCP transport is strategically important, but the fastest path in this repo is HTTP first.

Reason:

- the repo is already an Express HTTP gateway
- current discovery is HTTP endpoint oriented
- HTTP integration will let us prove pricing, challenge, credential, and receipt handling first

After HTTP works, we can decide whether to expose paid MCP tools directly or keep MCP behind a separate adapter.

### 5. Start with one MPP method, then expand

For first implementation, choose one:

- Stripe charge via SPT
- Tempo charge via stablecoin

Recommendation:

- start with `tempo.charge` if the goal is the fastest machine-native crypto path
- start with `stripe.charge` if the goal is broader payment method coverage and closer Stripe alignment

The official MPP docs make it clear that adding multiple methods later is additive, not a redesign.

### 6. Use the official `mppx` Express middleware or direct server SDK

The MPP docs provide:

- `mppx/express`
- `mppx/server`

This repo already uses Express middleware heavily, so the lowest-friction path is to evaluate `mppx/express` first.

Expected integration shape:

- initialize one `Mppx.create(...)` instance
- register one or more payment methods
- attach `mppx.charge(...)` to generated MPP routes
- execute Mesh tool only after middleware passes

## Likely code changes

### New files

- `src/services/mpp-route-generator.ts`
- `src/types/payments.ts` or equivalent protocol-neutral type file
- `docs/mpp/*` already added in this pass

### Existing files likely to change

- [src/server.ts](/home/appuser/heurist-mesh-x402/src/server.ts)
  Add MPP route generation and MPP discovery endpoint.
- [src/config/env.ts](/home/appuser/heurist-mesh-x402/src/config/env.ts)
  Add MPP environment variables.
- [package.json](/home/appuser/heurist-mesh-x402/package.json)
  Add `mppx` and possibly `stripe`.

### Likely environment additions

If we implement Stripe-backed MPP:

- `STRIPE_SECRET_KEY`
- MPP-specific enable flag
- Stripe business network/profile identifier
- optional payment method types

If we implement Tempo-backed MPP:

- MPP recipient address
- default currency contract/token address
- optional testnet/mainnet selector

## Design decisions to make before coding

1. Whether MPP routes should mirror every existing paid tool route or only a subset.
2. Whether we want one MPP payment method first or multi-method from day one.
3. Whether the public discovery response should be protocol-neutral or split by protocol.
4. Whether MPP receipts need to be surfaced in response headers only, or also copied into JSON for easier browser clients.
5. Whether we want future paid MCP support from this same service boundary.

## Proposed first milestone

The smallest useful MPP milestone in this repo is:

1. Add `/mpp/agents` discovery.
2. Add `/mpp/agents/:agentId/:toolName` protected HTTP routes.
3. Support exactly one MPP method.
4. Keep current `/x402/...` routes unchanged.
5. Return official MPP challenge and receipt headers.

That gives us a clean side-by-side protocol rollout without destabilizing current `x402` traffic.

## Official sources used

- Stripe launch post, published March 18, 2026:
  https://stripe.com/blog/machine-payments-protocol
- Stripe MPP guide:
  https://docs.stripe.com/payments/machine/mpp
- Stripe Shared Payment Tokens:
  https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
- MPP protocol site:
  https://mpp.dev
- MPP server quickstart:
  https://mpp.dev/quickstart/server
- MPP HTTP 402:
  https://mpp.dev/protocol/http-402
- MPP HTTP transport:
  https://mpp.dev/protocol/transports/http
- MPP MCP transport:
  https://mpp.dev/protocol/transports/mcp
- MPP Stripe charge:
  https://mpp.dev/payment-methods/stripe/charge
- MPP Tempo charge:
  https://mpp.dev/payment-methods/tempo/charge
- MPP multiple methods guide:
  https://mpp.dev/guides/multiple-payment-methods
- MPP Express middleware:
  https://mpp.dev/sdk/typescript/middlewares/express
