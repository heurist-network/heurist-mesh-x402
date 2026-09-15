<!-- source: https://mpp.dev/guides/one-time-payments -->
<!-- fetched: 2026-09-15 -->

# Accept one-time payments

Charge per request with a payment-gated API

Build a payment-gated image generation API that charges $0.01 per request using `mppx`.
The server returns a random photo from [Picsum](https://picsum.photos) behind a paywall,
but you could swap in an AI model like [OpenAI Image Generation](https://developers.openai.com/api/reference/resources/images) instead.

## Demo

Try the payment-gated image generation API. Click **Run demo** to create a wallet, fund it, and make a paid request.

## Prompt mode

Paste this into your coding agent to build the entire guide in one prompt:

```
Use https://mpp.dev/guides/one-time-payments.md as reference.
Add mppx to my app with a payment-gated photo endpoint
that charges $0.01 per request using the Tempo payment method with
PathUSD. When payment is verified, fetch a random photo from
https://picsum.photos/1024/1024 and return the URL as JSON.
```

## Manual mode

Select your framework to follow a step-by-step guide. If your framework isn't listed, choose **Other** for a generic [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) approach compatible with most TypeScript server frameworks.

## With Stripe

Accept MPP payments through Stripe for refunds, reporting, and multi-currency payouts. Read the [Stripe documentation](https://docs.stripe.com/payments/machine/mpp) for the full integration walkthrough.

## Next steps

[Accept pay-as-you-go payments

Session-based billing with payment channels](https://mpp.dev/guides/pay-as-you-go)[Server quickstart

Learn how to charge for resources](https://mpp.dev/quickstart/server)[Tempo Wallet CLI

Managed MPP client with built in spend controls and service discovery](https://wallet.tempo.xyz)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/guides/one-time-payments.mdx)

Copy page for AI
