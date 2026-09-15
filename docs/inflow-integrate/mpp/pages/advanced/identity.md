<!-- source: https://mpp.dev/advanced/identity -->
<!-- fetched: 2026-09-15 -->

# Identity

Verify agents and clients

Use request attestations to verify which automated client sent a request, then use MPP Credentials to verify the identity that authorized a payment.

## Overview

`mppx` supports two complementary identity layers:

| Layer | Verifies | Use it for |
| --- | --- | --- |
| [**Request attestation**](https://mpp.dev/advanced/identity#request-attestation) | The automated client or agent provider that signed an HTTP request | Bot recognition, allowlists, rate limits, and agent-specific policy |
| [**MPP Credential**](https://mpp.dev/advanced/identity#mpp-credential-identity) | The key in the Credential's `source` field | Payment authorization, ownership, and identity-only MPP flows |

An attestation doesn't authorize a payment or prove the end user's identity. Apply your own policy after verifying the agent, and verify the MPP Credential separately when the request requires payment.

## Request attestation

Request attestation uses [RFC 9421 HTTP Message Signatures](https://www.rfc-editor.org/rfc/rfc9421) to bind an agent identity to an HTTP request. `mppx` supports Ed25519 and RSA-PSS SHA-512 signatures through two profiles:

| Profile | Trust source | Signed request data | Recommended use |
| --- | --- | --- | --- |
| [**Web Bot Auth**](https://mpp.dev/advanced/identity#use-web-bot-auth) | Public key associated with a trusted HTTPS directory | Authority and `Signature-Agent` | General bot and agent identification |
| [**Trusted Agent Protocol**](https://mpp.dev/advanced/identity#use-trusted-agent-protocol) | Public key provisioned by a trusted agent provider | Authority and path | Commerce agents with explicit browse or payment intent |

The client attests the initial request and every automatic MPP retry. Each attempt gets a fresh nonce and timestamp. The server verifies the attestation before it issues a Challenge or accepts a Credential.

### Use Web Bot Auth

[Web Bot Auth](https://datatracker.ietf.org/doc/html/draft-meunier-web-bot-auth-architecture) identifies automated HTTP clients through a signed `Signature-Agent` header. Use the HTTPS-directory profile when the agent publishes its keys through a directory origin that your server trusts.

Configure the signer on the MPP client. `keyId` must be the RFC 7638 SHA-256 thumbprint of the public key registered for the bot.

client.ts

```
import * as WebBotAuth from 'mppx/attestation/web-bot-auth'
import { Mppx, tempo } from 'mppx/client'
import type { Account } from 'viem'

declare const account: Account
declare const botPrivateKey: CryptoKey

const botIdentity = {
  keyId: 'poqkLGiymh_W0uP6PZFw-dvez3QJT5SolqXBCW38r0U',
  signatureAgent: 'https://bot.example',
} as const

const client = Mppx.create({
  attestation: {
    webBotAuth: WebBotAuth.Client.signer({
      key: botPrivateKey,
      keyId: botIdentity.keyId,
      signatureAgent: botIdentity.signatureAgent,
    }),
  },
  methods: [tempo({ account })],
  polyfill: false,
})

const response = await client.fetch('https://api.example.com/resource')
console.log(response.status)

200
```

Configure the verifier on the MPP server. The resolver receives the signed directory origin and key ID. Apply your trust policy before you return a key.

server.ts

```
import * as WebBotAuth from 'mppx/attestation/web-bot-auth'
import { Mppx, Store, tempo } from 'mppx/server'

declare const botPublicKey: CryptoKey

const botIdentity = {
  keyId: 'poqkLGiymh_W0uP6PZFw-dvez3QJT5SolqXBCW38r0U',
  signatureAgent: 'https://bot.example',
} as const

const payment = Mppx.create({
  attestation: {
    webBotAuth: WebBotAuth.Server.verifier({
      keyResolver({ keyId, signatureAgent }) {
        if (
          keyId !== botIdentity.keyId ||
          signatureAgent !== botIdentity.signatureAgent
        ) return undefined
        return botPublicKey
      },
      maxAge: 60,
      nonceStore: Store.memory(),
    }),
  },
  methods: [tempo.charge()],
})

export const handler = payment.charge({ amount: '0.05' })
```

**Trust the directory before fetching**

The verifier doesn't fetch the caller-provided `Signature-Agent` URL. Allowlist the origin before a directory lookup, prevent redirects to untrusted origins, and return an extractable public key so `mppx` can verify its JWK thumbprint.

### Use Trusted Agent Protocol

[Trusted Agent Protocol](https://developer.visa.com/capabilities/trusted-agent-protocol/trusted-agent-protocol-specifications/) (TAP) identifies an agent that a merchant or payment network trusts. TAP signatures include an intent: `browse` for discovery and `payment` for payment-related requests.

Use `payment` for an MPP client that accesses paid routes. The signer uses an eight-minute lifetime by default, which is TAP's maximum.

client.ts

```
import * as Tap from 'mppx/attestation/tap'
import { Mppx, tempo } from 'mppx/client'
import type { Account } from 'viem'

declare const account: Account
declare const agentPrivateKey: CryptoKey

const client = Mppx.create({
  attestation: {
    tap: Tap.Client.signer({
      intent: 'payment',
      key: agentPrivateKey,
      keyId: 'agent-provider-key-1',
    }),
  },
  methods: [tempo({ account })],
  polyfill: false,
})

const response = await client.fetch('https://merchant.example/checkout')
console.log(response.status)

200
```

On the server, resolve `keyId` only from agent providers you trust. The verifier checks the signature, request authority and path, lifetime, intent tag, and nonce.

server.ts

```
import * as Tap from 'mppx/attestation/tap'
import { Mppx, Store, tempo } from 'mppx/server'

declare const trustedAgentKeys: ReadonlyMap<string, CryptoKey>

const payment = Mppx.create({
  attestation: {
    tap: Tap.Server.verifier({
      keyResolver({ keyId }) {
        return trustedAgentKeys.get(keyId)
      },
      nonceStore: Store.memory(),
    }),
  },
  methods: [tempo.charge()],
})

export const handler = payment.charge({ amount: '12.50' })
```

`Mppx.create` treats an invalid attestation as `401`, and treats an absent attestation or unresolved key as `403`. Every verifier in the server's `attestation` map must return `verified`. Configure both Web Bot Auth and TAP only when each request must carry both signatures.

### Use the framework directly

Outside `Mppx.create`, combine signers with one shared signing context and wrap any Fetch implementation. Each call to the wrapped Fetch creates a new context.

client.ts

```
import * as Attestation from 'mppx/attestation'

declare const tapSigner: Attestation.Signer<'tap'>
declare const webBotAuthSigner: Attestation.Signer<'web-bot-auth'>

const signer = Attestation.Client.composeSigners(
  tapSigner,
  webBotAuthSigner,
)
const fetch = Attestation.Client.wrapFetch(globalThis.fetch, signer)

await fetch('https://api.example.com/resource')
```

Use the lower-level framework when application policy needs the verified key ID, TAP intent, or Web Bot Auth directory. Each verifier returns `absent`, `invalid`, `unverified`, or `verified`.

server.ts

```
import * as Attestation from 'mppx/attestation'
import * as Tap from 'mppx/attestation/tap'
import { Mppx, tempo } from 'mppx/server'

declare const trustedAgentKeys: ReadonlyMap<string, CryptoKey>

const nonceStore = Attestation.Store.memory()
const tap = Tap.Server.verifier({
  keyResolver({ keyId }) {
    return trustedAgentKeys.get(keyId)
  },
  nonceStore,
})
const payment = Mppx.create({ methods: [tempo.charge()] })
const charge = payment.charge({ amount: '12.50' })

export async function handler(request: Request) {
  const result = await Attestation.Server.verify(request, { tap })
  const verification = result.tap

  if (verification.status !== 'verified') {
    return new Response('Trusted agent required', { status: 403 })
  }

  console.log(verification.value.intent)
payment
  const paymentResult = await charge(request)
  if (paymentResult.status === 402) return paymentResult.challenge
  return paymentResult.withReceipt(new Response('Accepted'))
}
```

Don't pass the same verifier to `Mppx.create` in this pattern. Verification consumes the nonce, so verifying the same request twice correctly reports a replay.

### Store nonces

Attestation verifiers accept the core `Store.AtomicStore`. `Store.memory()` is limited to one long-lived server process. In a multi-instance deployment, provide a shared atomic store so every instance claims nonces through their expiration time.

nonce-store.ts

```
import type { Store } from 'mppx'

declare const nonceDatabase: {
  insertIfAbsent(value: { expires: number; key: string }): Promise<boolean>
}
declare const sharedStore: Store.AtomicStore

export const nonceStore = {
  ...sharedStore,
  async tryClaim(key: string, expires: number) {
    return nonceDatabase.insertIfAbsent({ expires, key })
  },
} satisfies Store.AtomicStore
```

Adapt `tryClaim` to your storage client's atomic insert-if-absent operation. It returns `true` when it records a new claim and `false` when an unexpired claim already exists. If your `AtomicStore` omits this optimized method, `mppx` falls back to its atomic `update` operation. See `Store.tryClaim`.

## MPP Credential identity

The Credential proves the client controls a specific public key. Its `source` field remains the same regardless of the payment amount, so you can associate paid and identity-only requests with one key.

Extract the client's identity from any verified request using `Credential.fromRequest`:

server.ts

```
import { Credential } from 'mppx'

const credential = Credential.fromRequest(request)
const clientIdentity = credential.source

"did:pkh:eip155:4217:0x1234..."
```

Backends key workloads, sessions, and access control on this public key. Payment and request attestation remain separate from Credential identity.

## Zero-dollar auth

Zero-dollar auth uses the standard Challenge → Credential flow with the amount set to `0`. The client signs the Challenge to prove key ownership. No funds move on-chain, and no additional protocol extensions are required.

For Tempo charge, zero-dollar auth now uses a `proof` Credential payload instead of a real transaction. The client signs a proof message over the Challenge ID, and the server verifies that signature against the `source` DID.

**Replay protection**

By default, a valid zero-dollar proof remains reusable until the Challenge expires. Pass a `store` to `tempo.charge()` when you want single-use proof auth. In a multi-instance deployment, use a shared store so every instance sees consumed proofs.

The Credential contains the client's public key and a valid signature, giving the server a verified identity to associate with the request.

For Tempo, the server rejects `transaction` and `hash` payloads for zero-amount Challenges and requires `proof`.

### Case study: long-running jobs

A service accepts a paid request to start work, then lets the client poll for results using zero-dollar auth. The server keys workloads on the client's public key.

### Client submits a job (paid)

The client sends a request with payment to create a new job. The Credential includes both payment proof and the client's public key.

client.ts

```
const response = await fetch('https://api.example.com/v1/jobs')
const { jobId } = await response.json()

{ jobId: "abc123" }
```

The server records the job and associates it with the client's public key from the Credential.

### Server stores the public key

After the payment middleware verifies the Credential, extract the client's identity from the request:

server.ts

```
import { Credential } from 'mppx'

export async function handler(request: Request) {
  const result = await mppx.charge({ amount: '1.00' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  const pubkey = credential.source
  const jobId = createJob({ owner: pubkey })

  return result.withReceipt(Response.json({ jobId }))
}
```

### Client polls for status (zero-dollar auth)

The client polls the job endpoint. The server issues a zero-dollar Challenge—the client signs it to prove they own the same key.

server.ts

```
export async function statusHandler(request: Request) {
  const result = await mppx.charge({ amount: '0' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  const job = getJob(jobIdFromUrl(request))

  if (job.owner !== credential.source) {
    return Response.json({ error: 'Not your job' }, { status: 403 })
  }

  return result.withReceipt(Response.json({ result: job.result, status: job.status }))
}
```

### Case study: paid unlock with free access

A service charges once to unlock a resource, then grants repeated free access tied to the client's identity. This replaces API keys with cryptographic ownership.

### Client pays to unlock

The client pays once to gain access. The server records the public key as an authorized user.

server.ts

```
export async function unlockHandler(request: Request) {
  const result = await mppx.charge({ amount: '50.00' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  grantAccess({ dataset: 'premium', owner: credential.source })

  return result.withReceipt(Response.json({ status: 'unlocked' }))
}
```

### Client accesses the resource (zero-dollar auth)

Subsequent requests use zero-dollar auth. The server checks the client's identity against the access list.

server.ts

```
export async function accessHandler(request: Request) {
  const result = await mppx.charge({ amount: '0' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  if (!hasAccess({ dataset: 'premium', owner: credential.source })) {
    return Response.json({ error: 'Not unlocked' }, { status: 403 })
  }

  return result.withReceipt(Response.json({ data: getDataset('premium') }))
}
```

### Case study: multi-step agent workflow

An agent orchestrates a pipeline where one paid step kicks off several follow-up steps that only need identity. Each step verifies the same public key to maintain continuity across the workflow.

### Agent starts the pipeline (paid)

The agent pays to kick off generation. The server returns a pipeline ID tied to the agent's public key.

server.ts

```
export async function createPipelineHandler(request: Request) {
  const result = await mppx.charge({ amount: '5.00' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  const pipelineId = createPipeline({ owner: credential.source })

  return result.withReceipt(Response.json({ pipelineId }))
}
```

### Agent retrieves intermediate results (zero-dollar auth)

The agent polls each stage of the pipeline. Every request proves the same identity without additional payment.

server.ts

```
export async function stageHandler(request: Request) {
  const result = await mppx.charge({ amount: '0' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  const pipeline = getPipeline(pipelineIdFromUrl(request))

  if (pipeline.owner !== credential.source) {
    return Response.json({ error: 'Not your pipeline' }, { status: 403 })
  }

  const stage = pipeline.stages[stageFromUrl(request)]
  return result.withReceipt(Response.json({ output: stage.output, status: stage.status }))
}
```

### Agent downloads the final artifact (zero-dollar auth)

The final download also uses zero-dollar auth—the server already collected payment at the start.

server.ts

```
export async function resultHandler(request: Request) {
  const result = await mppx.charge({ amount: '0' })(request)
  if (result.status === 402) return result.challenge

  const credential = Credential.fromRequest(request)
  const pipeline = getPipeline(pipelineIdFromUrl(request))

  if (pipeline.owner !== credential.source) {
    return Response.json({ error: 'Not your pipeline' }, { status: 403 })
  }

  return result.withReceipt(Response.json({ result: pipeline.finalResult }))
}
```

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/advanced/identity.mdx)

Copy page for AI
