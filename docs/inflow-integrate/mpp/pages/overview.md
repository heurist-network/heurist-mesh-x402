<!-- source: https://mpp.dev/overview -->
<!-- fetched: 2026-09-15 -->

# What is MPP?

Machine-to-machine payments over HTTP 402

The Machine Payments Protocol (MPP) lets any client—agents, apps, or humans—pay for any service in the same HTTP request. Developers use MPP to let their agents pay for services. Service operators use MPP to accept payments for their APIs.

MPP is built around a simple, extensible core and is neutral to the implementation of underlying payment flows and methods.

- **Open standard built for the internet**—Built on an open specification proposed to the IETF, not a proprietary API
- **Designed for payments**—Idempotency, security, and Receipts are first-class primitives
- **Works with stablecoins, cards, and bank transfers**—All payment methods can be supported through one protocol and flexible control flow
- **Any currency**—Transact in USD, EUR, BRL, USDC.e, BTC, or any other asset
- **Composable and designed for extension**—A flexible core allows advanced flows like disputes or additional primitives like identity to be gradually introduced

## Who is MPP for?

MPP involves three parties:

- **Developers** build apps and agents that consume paid services. You integrate an MPP client so your agent can discover, pay for, and use third-party APIs without manual signup or API keys.
- **Agents** are the entities that take action—calling APIs, generating images, querying data. They pay for services autonomously on behalf of your users.
- **Services** operate APIs that charge for access—LLM inference, image generation, web search, and more. You integrate an MPP server to accept payments with zero onboarding friction.

## The problem with payments on the internet

There is no shortage of ways to pay for things on the internet. Hundreds of payment methods give users ample space for personal preference, and optimized payment forms with one-click checkout ensure that the act of paying is low-friction and highly secure.

However, the very things that make these payment flows familiar and fast for human purchasers are structural headwinds for programmatic consumption. Many have tried, but it is a consistent uphill battle to fight browser automation pipelines, visual captchas, and ever changing payment forms—all of which reduce reliability, increase latency, and bear high costs.

This is not the fault of any individual payment method or Credential. This is a global problem which exists at the *interface* level: how buyer and seller negotiate cost, supported payment methods, and ultimately transact.

The Machine Payments Protocol addresses this gap by providing a payment interface built for programmatic access that strips away the complexity of rich checkout flows, while still providing robust security and reliability. By using MPP, you can accept payments from any client—agents, apps, or humans—and across any payment method, without complex checkout flows and integrations.

## Try it out

See the full payment flow in action. The terminal creates an ephemeral wallet, funds it with testnet USDC.e, and makes a paid request.

## Use cases

- **[Agentic payments](https://mpp.dev/use-cases/agentic-payments)**—Your agent calls LLM providers, search APIs, and image generators through MPP, paying per request without API keys or human intervention.
- **[API monetization](https://mpp.dev/use-cases/api-monetization)**—Accept payments from any client—agents, apps, or humans—without requiring signups, billing accounts, or API keys.
- **[Micropayments](https://mpp.dev/use-cases/micropayments)**—Charge sub-cent amounts per token, per query, or per request using off-chain payment sessions with on-chain settlement.

## Payment flow

When a client requests a paid resource, the server returns a `402` response with the payment options they support. The client chooses a payment method, fulfills the request and retries with a payment `Credential` which contains proof of payment. The server verifies the payment and returns the resource with a `Receipt` which contains proof of delivery.

1. **Client: Requests the resource**—`GET /resource`
2. **Server: Returns a payment challenge**—`402` Payment Required with `WWW-Authenticate: Payment` header
3. **Client: Fulfills the payment**—Sign a transaction, pay an invoice, or complete a card payment
4. **Client: Retries with a payment credential**— `GET /resource` with `Authorization: Payment` header
5. **Server: Verifies the payment and delivers the resource**—`200` OK with `Payment-Receipt` header

## Official SDKs

MPP comes with a suite of official SDKs maintained by [Tempo Labs](https://tempo.xyz) and [Wevm](https://wevm.dev). The SDKs offer high-level abstractions and low-level primitives to implement and extend the Machine Payments Protocol.

[TypeScript

Get started with `mppx`, the reference implementation of the MPP SDKs](https://mpp.dev/sdk/typescript)[Python

Get started with `pympp`, the official MPP SDK for Python](https://mpp.dev/sdk/python)[Rust

Get started with `mpp-rs`, the official MPP SDK for Rust](https://mpp.dev/sdk/rust)[Go

Get started with `mpp-go`, the official MPP SDK for Go](https://mpp.dev/sdk/go)

## Next steps

[MPP vs x402

Compare HTTP 402 payment protocols](https://mpp.dev/mpp-vs-x402)[Quickstart

Build a payment-enabled API](https://mpp.dev/quickstart)[Protocol concepts

Learn about MPP's core control flow](https://mpp.dev/protocol)[IETF Specification

Read the full specification](https://paymentauth.org)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/overview.mdx)

Copy page for AI
