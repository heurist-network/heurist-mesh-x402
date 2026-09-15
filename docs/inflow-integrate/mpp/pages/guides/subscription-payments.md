<!-- source: https://mpp.dev/guides/subscription-payments -->
<!-- fetched: 2026-09-15 -->

# Create and manage subscriptions

Recurring access for paid APIs

## Choose a signing account

DirectPrivy

Create a server-only `wallet.ts` module, then import `account` wherever an example creates a local signing account.

wallet.ts

```
import { privateKeyToAccount } from 'viem/accounts'

export const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)
```

Build a subscription-gated API that charges $1 for access using `mppx` and Tempo subscriptions.

## Overview

Subscriptions separate access from billing. The client authorizes recurring access once, then keeps using the paid API without paying again on every request.

Your server stores the subscription after the first payment succeeds. Later requests prove the same payer signed the request, check the stored subscription, and return the protected response when access is active. Billing happens on its own schedule: the next request after a billing period ends can renew the subscription, or a background job can renew subscriptions before clients return. This keeps normal API requests simple while recurring payments happen asynchronously.

## Install `mppx`

## Create the subscription method

Create one `Mppx` instance and register `tempo.subscription()`.

mppx.server.ts

```
import { Mppx, Store, tempo } from 'mppx/server'

const store = Store.memory()

export const mppx = Mppx.create({
  methods: [
    tempo.subscription({
      amount: '1.00',
      currency: '0x20c0000000000000000000000000000000000000',
      periodCount: '1',
      periodUnit: 'week',
      recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      requireCredential: true,
      resolve: async ({ source }) => {
        if (!source) return null
        return { key: `payer:${source.chainId}:${source.address}:plan:pro` }
      },
      store,
      subscriptionExpires: new Date('2027-01-01T00:00:00.000Z'),
      testnet: true,
    }),
  ],
})
```

This setup bootstraps automatically. Before the payer is known, `resolve` returns `null` and the SDK generates an access key for the Challenge. After the client signs, the SDK verifies the payer and calls `resolve` again with `source` to bind the subscription to that payer. Keep `requireCredential: true` so later requests also prove the payer identity. No separate bootstrap endpoint or client-supplied user ID is needed.

Use a durable atomic store in production. `Store.memory()` loses subscription state when the process restarts.

## Gate the API route

Call `mppx.tempo.subscription({})` before returning paid data.

route.ts

```
export async function GET(request: Request) {
  const result = await mppx.tempo.subscription({})(request)

  if (result.status === 402) return result.challenge

  return result.withReceipt(
    Response.json({
      limits: { requests: 100_000 },
      plan: 'pro',
    }),
  )
}
```

The first unpaid request returns `402`. After the client activates the subscription, the same route returns `200` with a `Payment-Receipt` header.

## Configure the client

Register `tempo.subscription()` on the client. The SDK handles the `402` response, signs the key authorization, and retries the request.

## Advanced options

### Cancel a subscription

Cancellation is a server-side state change. Have the client call your cancellation endpoint, then mark the active subscription record with `canceledAt`; the next paid request returns `402` and requires a new subscription activation.

client.ts

```
await fetch('/api/subscription/cancel', {
  method: 'POST',
})
```

cancel.ts

```
import { Store } from 'mppx/server'
import { Subscription } from 'mppx/tempo'

const store = Store.memory()
const subscriptions = Subscription.fromStore(store)

export async function cancelSubscription(userId: string) {
  const subscription = await subscriptions.getByKey(`user:${userId}:plan:pro`)
  if (!subscription) return false

  await subscriptions.put({
    ...subscription,
    canceledAt: new Date().toISOString(),
  })

  return true
}
```

Keep the canceled record instead of deleting it. That preserves Receipts and prevents in-flight renewals from clearing the cancellation marker.

### Revoke the access key

On Tempo, clients can also revoke the authorized access key. Do this after server cancellation when you want a wallet-level backstop against future renewals.

revoke.ts

```
import { createClient, http } from 'viem'
import { tempo } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { Actions } from 'viem/tempo'

const client = createClient({
  account: privateKeyToAccount(
    '0x0000000000000000000000000000000000000000000000000000000000000001', // your account
  ),
  chain: tempo,
  transport: http(),
})

await Actions.accessKey.revokeSync(client, {
  accessKey: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
})
```

Revoking the access key doesn't cancel the merchant-side subscription record. If the client only revokes the key, the server can still reuse an already-paid period until it tries to renew.

### Renew in the background

Subscriptions renew when a request arrives after the next billing period starts. For proactive billing, run `tempo.renewSubscription()` from a background job.

renew.ts

```
import type { Store } from 'mppx/server'
import { tempo } from 'mppx/server'

declare const store: Store.AtomicStore<Record<string, unknown>>

const result = await tempo.renewSubscription({
  store,
  subscriptionId: 'sub_abc123',
})

if (result) console.log(result.receipt.status)
```

## Production checklist

- Store subscription records in a durable atomic store.
- Mark canceled subscriptions with `canceledAt` and keep their records for audit.
- Use authenticated user or organization IDs in `resolve`.
- Set `subscriptionExpires` to the maximum authorization lifetime you accept.
- Add webhook or cron coverage for background renewals if access must stay warm.
- Persist `subscriptionId` and `externalId` in your app database for support and reconciliation.

## Next steps

- Read the [Tempo subscription overview](https://mpp.dev/payment-methods/tempo/subscription).
- Review [`tempo.subscription` server API](https://mpp.dev/sdk/typescript/server/Method.tempo.subscription).
- Review [`tempo.subscription` client API](https://mpp.dev/sdk/typescript/client/Method.tempo.subscription).

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/guides/subscription-payments.mdx)

Copy page for AI
