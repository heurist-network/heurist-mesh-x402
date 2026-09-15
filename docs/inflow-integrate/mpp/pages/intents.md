<!-- source: https://mpp.dev/intents -->
<!-- fetched: 2026-09-15 -->

# Intents

Payment patterns for MPP

Intents define what kind of payment a server requests. Each intent specifies the shared request fields, Credential requirements, and settlement semantics that payment methods implement.

## Overview

When a server responds with `402` Payment Required, the `WWW-Authenticate` header includes an `intent` parameter. The intent tells the client whether the request is a one-time payment, recurring authorization, or another payment pattern.

```
HTTP/1.1 402 Payment Required
WWW-Authenticate: Payment method="tempo", intent="charge", ...
```

Payment methods implement intents on top of a payment rail. For example, Tempo supports `charge`, `session`, and `subscription`, while Stripe currently supports `charge`.

## Available intents

[Charge

Collect a fixed one-time payment before returning the resource](https://mpp.dev/intents/charge)[Session

Meter high-frequency usage with reusable payment state](https://mpp.dev/intents/session)[Subscription

Collect recurring fixed payments across billing periods](https://mpp.dev/intents/subscription)

## Choose an intent

| Intent | Best for | Example methods |
| --- | --- | --- |
| `charge` | One request, one payment, known price | [Tempo charge](https://mpp.dev/payment-methods/tempo/charge), [Stripe charge](https://mpp.dev/payment-methods/stripe/charge), [Lightning charge](https://mpp.dev/payment-methods/lightning/charge) |
| `session` | High-frequency metered usage with costs calculated over time | [Tempo session](https://mpp.dev/payment-methods/tempo/session), [Lightning session](https://mpp.dev/payment-methods/lightning/session) |
| `subscription` | Fixed recurring access by billing period | [Tempo subscription](https://mpp.dev/payment-methods/tempo/subscription) |

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/intents/index.mdx)

Copy page for AI
