<!-- source: https://mpp.dev/guides/monetize-mcp-server -->
<!-- fetched: 2026-09-15 -->

# Monetize your MCP server

Charge for tool calls with MPP

Add per-call payments to any [MCP](https://modelcontextprotocol.io) server. When an agent calls a paid tool, the server issues a Challenge, the agent pays, and the tool executes—all within the MCP protocol. No API keys or billing portals required.

## How it works

1. **Agent** calls a tool on the MCP server
2. **Server** responds with JSON-RPC error code `-32042` and a Challenge specifying the price
3. **Agent** creates a Credential (payment proof) from the Challenge
4. **Agent** retries the tool call with the Credential in `_meta`
5. **Server** verifies the Credential and settles the payment on-chain
6. **Network** confirms the payment
7. **Server** returns the tool result with a Receipt in `_meta`

This maps directly to the standard MPP Challenge → Credential → Receipt flow, encoded as JSON-RPC instead of HTTP headers. See the [MCP transport spec](https://mpp.dev/protocol/transports/mcp) for the full encoding.

This guide uses the MCP transport, so Challenge, Credential, and Receipt data travel as native JSON in `error.data` and `_meta`. The base64url-encoded `request` and `opaque` auth-params apply to the HTTP transport.

## Prompt mode

Paste this into your coding agent to build a paid MCP server in one prompt:

```
Use https://mpp.dev/guides/monetize-mcp-server.md as reference.
Build an MCP server with mppx that charges $0.01 per tool call
using the Tempo payment method. Use @modelcontextprotocol/sdk
for the MCP server and Transport.mcpSdk() for the payment transport.
```

## Manual mode

### Install dependencies

### Create the MCP server

Set up a standard MCP server with a tool. This tool is **currently free**.

server.ts

```
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'

const server = new McpServer({ name: 'my-service', version: '1.0.0' })

server.registerTool(
  'search',
  { description: 'Search the web' },
  async ({ query }) => ({
    content: [{ type: 'text', text: `Results for: ${query}` }],
  }),
)

const transport = new StdioServerTransport()
await server.connect(transport)
```

### Add `mppx` with the MCP transport

Create an `Mppx` instance with `Transport.mcpSdk()`. This tells `mppx` to encode Challenges and Receipts as JSON-RPC messages instead of HTTP headers.

server.ts

```
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { Mppx, tempo, Transport } from 'mppx/server'

const mppx = Mppx.create({
  methods: [tempo.charge({
    testnet: true,
    currency: '0x20c0000000000000000000000000000000000000',
    recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  })],
  transport: Transport.mcpSdk(),
})

const server = new McpServer({ name: 'my-service', version: '1.0.0' })

server.registerTool(
  'search',
  { description: 'Search the web' },
  async ({ query }) => ({
    content: [{ type: 'text', text: `Results for: ${query}` }],
  }),
)

const transport = new StdioServerTransport()
await server.connect(transport)
```

### Add `.charge` to the tool handler

Call `mppx.charge` inside the tool handler. If the agent hasn't paid, throw the Challenge. Otherwise, attach a Receipt to the result.

server.ts

```
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { Mppx, tempo, Transport } from 'mppx/server'

const mppx = Mppx.create({
  methods: [tempo.charge({
    testnet: true,
    currency: '0x20c0000000000000000000000000000000000000',
    recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  })],
  transport: Transport.mcpSdk(),
})

const server = new McpServer({ name: 'my-service', version: '1.0.0' })

server.registerTool(
  'search',
  { description: 'Search the web' },
  async ({ query }, extra) => {
    const result = await mppx.charge({
      amount: '0.01',
      description: 'Web search query',
    })(extra)

    if (result.status === 402) throw result.challenge

    return result.withReceipt({
      content: [{ type: 'text', text: `Results for: ${query}` }],
    })
  },
)

const mcpTransport = new StdioServerTransport()
await server.connect(mcpTransport)
```

Three lines turn a free tool into a paid one:

- **`mppx.charge()`** checks for a valid Credential in the tool call's `_meta`
- **`throw result.challenge`** sends a `-32042` error with the payment requirements
- **`result.withReceipt()`** attaches a Receipt to the tool result

### Test with the `mppx` CLI

terminal

```
# Create and fund a testnet account
$ npx mppx account create --network testnet
$ npx mppx account fund --network testnet

# Start the server and call the tool
$ echo '{"method":"tools/call","params":{"name":"search","arguments":{"query":"hello"}}}' | node server.ts
```

## Multiple payment offers

Use instance `compose()` when one MCP tool accepts multiple methods, currencies, or prices. The server returns every offer in one payment-required Challenge list. The client's Credential selects one offer, and `mppx` dispatches it to exactly one matching handler.

```
const result = await mppx.compose(
  [mppx.tempo.charge, { amount: '0.01', currency: pathUSD }],
  [mppx.tempo.charge, { amount: '0.01', currency: USDCe }],
)(extra)

if (result.status === 402) throw result.challenge
return result.withReceipt({
  content: [{ text: 'Paid result', type: 'text' }],
})
```

Pass configured handler references such as `mppx.tempo.charge` instead of string keys when they're available. Every composed method must use the configured MCP transport. HTTP-only `canOffer` and `selectOffers` policies don't run for MCP composition.

## Multiple tools with different prices

Set different prices per tool. Free tools don't need `mppx.charge` at all.

server.ts

```
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { Mppx, tempo, Transport } from 'mppx/server'

const mppx = Mppx.create({
  methods: [tempo.charge({
    testnet: true,
    currency: '0x20c0000000000000000000000000000000000000',
    recipient: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  })],
  transport: Transport.mcpSdk(),
})

const server = new McpServer({ name: 'my-service', version: '1.0.0' })

// Free tool — no payment required
server.registerTool(
  'status',
  { description: 'Check service status' },
  async () => ({
    content: [{ type: 'text', text: 'OK' }],
  }),
)

// $0.01 per call
server.registerTool(
  'search',
  { description: 'Search the web' },
  async ({ query }, extra) => {
    const result = await mppx.charge({ amount: '0.01' })(extra)
    if (result.status === 402) throw result.challenge
    return result.withReceipt({
      content: [{ type: 'text', text: `Results for: ${query}` }],
    })
  },
)

// $0.10 per call
server.registerTool(
  'generate-image',
  { description: 'Generate an image from a prompt' },
  async ({ prompt }, extra) => {
    const result = await mppx.charge({ amount: '0.10' })(extra)
    if (result.status === 402) throw result.challenge
    return result.withReceipt({
      content: [{ type: 'text', text: `Image generated for: ${prompt}` }],
    })
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
```

## What the agent sees

Under the hood, the MCP transport encodes MPP Challenges, Credentials, and Receipts as JSON-RPC fields:

| MPP concept | MCP encoding |
| --- | --- |
| Challenge | Error code `-32042` with Challenges in `error.data` |
| Credential | `_meta["org.paymentauth/credential"]` on the tool call |
| Receipt | `_meta["org.paymentauth/receipt"]` on the tool result |

A payment-aware MCP client like `McpClient.wrap` handles this automatically—the agent doesn't need to know the encoding details.

## Specification

[MCP Transport

JSON-RPC encoding for Challenges, Credentials, and Receipts](https://paymentauth.org/draft-payment-transport-mcp-00)[Charge Intent

One-time payment request schema](https://paymentauth.org/draft-payment-intent-charge-00)

## Next steps

[MCP transport

Read the full MCP transport encoding](https://mpp.dev/protocol/transports/mcp)[Accept one-time payments

Charge per request with a payment-gated API](https://mpp.dev/guides/one-time-payments)[Tempo Wallet CLI

Managed MPP client with built in spend controls and service discovery](https://wallet.tempo.xyz)

[Suggest changes to this page](https://github.com/tempoxyz/mpp/edit/main/src/pages/guides/monetize-mcp-server.mdx)

Copy page for AI
