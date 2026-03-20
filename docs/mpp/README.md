# MPP Essential Docs Copy

This is a local integration packet for the Machine Payments Protocol (MPP) built by Stripe and Tempo.

It is not a verbatim mirror of the upstream docs. It is a compressed internal copy of the essential implementation details, with source links back to the official material.

## What MPP is

MPP is an HTTP- and MCP-friendly payment protocol for machine-to-machine payments. A protected resource returns a payment challenge, the client retries with a payment credential, and the server returns the protected response with a receipt.

The official protocol site describes MPP as supporting:

- HTTP `402 Payment Required`
- HTTP header transport
- MCP / JSON-RPC transport
- multiple payment methods on one endpoint
- Stripe-backed payment methods
- Tempo-backed stablecoin payment methods

For this repo, that makes MPP directly relevant as a second paywall protocol next to `x402`, especially for:

- HTTP paywalled endpoints
- MCP-style tool calls
- agent-facing payment options beyond facilitator-specific `x402` flows

## Core wire model

### HTTP transport

Official MPP HTTP transport uses these headers:

- `WWW-Authenticate: Payment ...`
  Used by the server to return a challenge on `402`.
- `Authorization: Payment ...`
  Used by the client to submit a credential.
- `Payment-Receipt: ...`
  Used by the server to acknowledge successful payment.

This differs from the current `x402` implementation in this repo, which relies on headers like `X-PAYMENT`, `PAYMENT-SIGNATURE`, `PAYMENT-REQUIRED`, and `PAYMENT-RESPONSE` depending on rail.

### MCP transport

Official MPP MCP transport maps payment flow into JSON-RPC:

- challenge: JSON-RPC error code `-32042`
- credential: `_meta.org.paymentauth/credential`
- receipt: `_meta.org.paymentauth/receipt`

That transport is important if we want Mesh tools to be consumable as paid MCP tools later, not only as paid REST endpoints.

## Payment methods relevant to us

### Stripe charge

MPP supports Stripe-backed one-time payments using Shared Payment Tokens (SPTs).

The server can require payment with `stripe.charge(...)`, and the MPP SDK handles:

- challenge generation
- credential verification
- Stripe `PaymentIntent` creation
- receipt generation

Server parameters called out in the official docs:

- `client` or `secretKey`
- `networkId`
- `paymentMethodTypes`
- optional `metadata`

### Tempo charge

MPP also supports Tempo one-time payments for stablecoin transfers.

The official server-side `tempo.charge(...)` flow handles:

- challenge generation
- credential verification
- transaction broadcast
- receipt generation

The documented examples use a TIP-20 token currency plus a recipient address. Tempo is the most direct stablecoin-native option if we want an MPP rail that feels closest to crypto-native `x402`.

### Multiple payment methods on one endpoint

MPP explicitly supports returning multiple `WWW-Authenticate: Payment ...` challenges on a single `402` response. A client can choose whichever payment method it supports, and the route handler does not change.

That is a useful design target for this repo because it aligns with the existing multi-rail pattern:

- Base `x402`
- Solana `x402`
- XRPL `x402`
- future `mpp` with one or more MPP methods

## Stripe-specific operational notes

Stripe’s MPP docs currently state:

- machine payments require account enablement
- access is obtained through `machine-payments@stripe.com`
- stablecoin acceptance is available to customers globally, but only US businesses can accept stablecoin payments
- the crypto `PaymentIntent` flow currently requires Stripe API version `2026-03-04.preview`

Stripe’s March 18, 2026 launch post also says Stripe users can accept MPP payments using PaymentIntents and Shared Payment Tokens.

## Shared Payment Tokens

For Stripe-backed MPP payments, Shared Payment Tokens are the key seller-side primitive.

The official Stripe SPT docs describe this flow:

1. An agent obtains or grants an SPT.
2. The seller receives the granted token.
3. The seller creates a Stripe `PaymentIntent` with `shared_payment_granted_token`.
4. Stripe clones the underlying payment method and processes the charge.

The docs also call out these seller-facing webhook events:

- `shared_payment.granted_token.used`
- `shared_payment.granted_token.deactivated`

Those matter if we later want stronger auditability or asynchronous reconciliation for MPP payments.

## Recommended read order

1. Stripe launch context:
   https://stripe.com/blog/machine-payments-protocol
2. Stripe MPP integration guide:
   https://docs.stripe.com/payments/machine/mpp
3. Stripe Shared Payment Tokens:
   https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens
4. MPP server quickstart:
   https://mpp.dev/quickstart/server
5. MPP HTTP transport:
   https://mpp.dev/protocol/transports/http
6. MPP MCP transport:
   https://mpp.dev/protocol/transports/mcp
7. MPP Stripe method:
   https://mpp.dev/payment-methods/stripe/charge
8. MPP Tempo method:
   https://mpp.dev/payment-methods/tempo/charge
9. MPP multi-method guide:
   https://mpp.dev/guides/multiple-payment-methods
10. MPP Express middleware:
   https://mpp.dev/sdk/typescript/middlewares/express

## Repo-specific implication

MPP is close enough to `x402` at the high level that we can share product concepts:

- payment-gated tool endpoints
- `402`-first access flow
- per-route pricing
- discovery
- receipts

But it is different enough at the wire level that it should be treated as a separate protocol adapter, not a small extension of the existing `x402` middleware.

See [integration-scope.md](/home/appuser/heurist-mesh-x402/docs/mpp/integration-scope.md) for the concrete implementation impact on this codebase.

For endpoint validation and a client-side MPP test setup, see [testing-handoff.md](/home/appuser/heurist-mesh-x402/docs/mpp/testing-handoff.md).
