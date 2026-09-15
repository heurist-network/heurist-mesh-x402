<!-- source: https://mpp.dev/payment-methods -->
<!-- fetched: 2026-09-15 -->

# Payment methods

Available methods and how to choose one

Payment methods define how clients pay for resources protected by the Machine Payments Protocol. Each method specifies its payment rails, Credential format, and verification logic.

## Overview

When a server responds with `402` Payment Required, the `WWW-Authenticate` header includes a `method` parameter indicating which payment method to use. If supported, the client can then use the corresponding payment method to generate a Credential and retry the request.

## Available methods

[Tempo

Web scale payments with TIP-20 stablecoins on Tempo with sub second settlement](https://mpp.dev/payment-methods/tempo)[EVM

Stablecoin payments on EVM chains with inline x402 exact compatibility](https://mpp.dev/payment-methods/evm)[Stripe

Traditional payment methods through Stripe](https://mpp.dev/payment-methods/stripe)[Card

Card payments via encrypted network tokens](https://mpp.dev/payment-methods/card)[Lightning

Bitcoin payments over the Lightning Network](https://mpp.dev/payment-methods/lightning)[Solana

Native SOL and SPL token payments on Solana](https://mpp.dev/payment-methods/solana)[Stellar

Smart contract payments on Stellar](https://mpp.dev/payment-methods/stellar)[XRPL

Payments in XRP and tokens, Payment Channels in XRP](https://mpp.dev/payment-methods/xrpl)[Monad

ERC-20 token payments on Monad](https://mpp.dev/payment-methods/monad)[NEAR Intents

Cross-chain payments settled by NEAR Intents](https://mpp.dev/payment-methods/nearintents)[RedotPay

Payments with RedotPay balance and stablecoin rails](https://mpp.dev/payment-methods/redotpay)[Custom

Build your own method or extend existing methods with the SDK.](https://mpp.dev/payment-methods/custom)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/payment-methods/index.mdx)

Copy page for AI
