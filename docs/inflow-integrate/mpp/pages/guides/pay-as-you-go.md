<!-- source: https://mpp.dev/guides/pay-as-you-go -->
<!-- fetched: 2026-09-15 -->

# Accept pay-as-you-go payments

Session-based billing with payment channels

## Choose a signing account

DirectPrivy

Create a server-only `wallet.ts` module, then import `account` wherever an example creates a local signing account.

wallet.ts

```
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
```

Build a payment-gated photo gallery API that charges $0.01 per photo using `mppx` sessions.
The server returns random photos from [Picsum](https://picsum.photos) behind a paywall,
but you could imagine generating images with an AI model instead like [OpenAI Image Generation](https://developers.openai.com/api/reference/resources/images).

Unlike [one-time payments](https://mpp.dev/guides/one-time-payments), sessions open a payment channel once and
use off-chain vouchers for each subsequent request—vouchers are **not bottlenecked by blockchain throughput**, they are processed in pure CPU-bound signature checks.

## Demo

Try the payment-gated photo gallery API. Click **Run demo** to create a wallet, fund it, and generate a gallery of paid photos.

## Prompt mode

Paste this into your coding agent to build the entire guide in one prompt:

```
Use https://mpp.dev/guides/pay-as-you-go.md as reference.
Add mppx to my app with a payment-gated gallery endpoint
that charges $0.01 per photo using the Tempo session payment method with
PathUSD. When payment is verified, fetch a random photo from
https://picsum.photos/200/200 and return the URL as JSON.
```

## Manual mode

Select your framework to follow a step-by-step guide. If your framework isn't listed, choose **Other** for a generic [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) approach compatible with most TypeScript server frameworks.

## Client setup

When using sessions from a client, set `maxDeposit` to enable automatic channel management. This is the maximum amount of tokens the client reserves in the payment channel. Any unspent deposit is refunded when the channel closes.

- **`maxDeposit: '1'`**: Reserves up to 1 pathUSD in the payment channel. At $0.01/photo, this covers up to 100 requests before the channel runs out.
- The client handles the full session lifecycle automatically: channel open, voucher signing, and retry after `402` responses.
- If the server sets `suggestedDeposit`, the client uses `min(suggestedDeposit, maxDeposit)`.

### Closing the channel

After you're done making requests, close the channel to settle on-chain and reclaim unspent deposit:

Channels remain open for reuse. Closing is not required between individual requests—only when you're done with the session entirely.

## Next steps

[Accept one-time payments

Charge per request with a payment-gated API](https://mpp.dev/guides/one-time-payments)[Server quickstart

Learn how to charge for resources](https://mpp.dev/quickstart/server)[Tempo Wallet CLI

Managed MPP client with built in spend controls and service discovery](https://wallet.tempo.xyz)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/guides/pay-as-you-go.mdx)

Copy page for AI
