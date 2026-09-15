<!-- source: https://mpp.dev/intents/charge -->
<!-- fetched: 2026-09-15 -->

# Charge

Immediate one-time payments

The `charge` intent requests an immediate one-time payment. The client pays a fixed amount and the server settles the transaction before returning the response. This is the simplest MPP payment pattern—one request, one payment, one Receipt.

## How it works

1. **Client:** requests a paid resource
2. **Server:** responds with `402` and a Challenge specifying the payment requirements—`amount`, `currency`, and `recipient`
3. **Client:** fulfills the payment using the method specified in the Challenge
4. **Client:** retries the request with the payment proof as a Credential
5. **Server:** verifies the Credential and settles the payment on the underlying network
6. **Network:** confirms the payment
7. **Server:** returns the resource with a Receipt

## When to use charge

Charge is the best intent when each request maps to a single payment with a known cost:

- **Paid API endpoints**—Charge per request for data, compute, or content
- **Content access**—Pay-per-article, pay-per-query, or pay-per-download
- **Tool calls**—MCP tool invocations where each call has a fixed price
- **Simple integrations**—No channel setup, no state management, no storage backend

For metered billing, high volume flows such as scraping, or usage-based billing where the total cost isn't known upfront, use the session intent instead.

## Request schema

The charge intent defines the following request fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | string | Required | Payment amount in base units |
| `currency` | string | Required | Currency identifier (token address, currency code) |
| `description` | string | Optional | Human-readable description of the payment |
| `externalId` | string | Optional | Server-defined idempotency key |
| `recipient` | string | Optional | Recipient identifier (address, account ID) |

Payment methods extend this schema with method-specific fields through `methodDetails`. For example, Tempo adds `chainId` and `feePayer`.

Set Challenge expiry with the `expires` auth-param in `WWW-Authenticate`. Don't include it in the request object.

## Method integrations

Each payment method defines how charge is fulfilled, verified, and settled on its underlying network.

[Tempo charge

Immediate one-time payments settled on-chain](https://mpp.dev/payment-methods/tempo/charge)[Stripe

Traditional payment methods through Stripe](https://mpp.dev/payment-methods/stripe)[Lightning

Bitcoin payments over the Lightning Network](https://mpp.dev/payment-methods/lightning)[Solana charge

One-time payments with signed transactions or confirmed signatures](https://mpp.dev/payment-methods/solana/charge)[Monad charge

Immediate one-time payments settled on Monad](https://mpp.dev/payment-methods/monad/charge)[RedotPay charge

One-time payments with RedotPay payment proofs](https://mpp.dev/payment-methods/redotpay/charge)[Card

Card payments via encrypted network tokens](https://mpp.dev/payment-methods/card)

## Specification

[IETF Specification

Read the full specification](https://paymentauth.org/draft-payment-intent-charge-00)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/intents/charge.mdx)

Copy page for AI
