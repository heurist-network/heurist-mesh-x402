# Heurist Mesh X402 Gateway

> Payment-enabled REST API gateway that exposes Heurist Mesh agent tools via Coinbase X402 protocol, enabling AI agents and developers to pay for API calls with USDC on Base.

## Overview

This middleware sits between **X402-compatible clients** and the **Heurist Mesh agent framework**, automatically generating payable REST endpoints for each agent tool and handling payment settlement via the X402 protocol.

```
AI Agent/User → X402 Gateway → Payment Validation → Heurist Mesh → Tool Execution → Response
              ↓
         USDC Payment (Base)
              ↓
         Author Wallet
```

## Key Features

- **Dynamic Route Generation:** Automatically creates REST endpoints for every Heurist Mesh agent tool
- **X402 Payment Integration:** Uses Coinbase's HTTP 402 payment protocol for gasless USDC payments
- **Discoverable in Bazaar:** All tools are indexed in X402 Bazaar for AI agent discovery
- **Per-Tool Pricing:** Flexible pricing at agent and tool level
- **Author Revenue:** Payments go directly to agent author's wallet address
- **Zero Code Changes:** No modifications to existing Heurist Mesh server logic

## Quick Start

### Prerequisites

- Node.js 18+
- Access to Heurist Mesh API (https://mesh.heurist.ai)
- USDC on Base (mainnet) or Base Sepolia (testnet)

### Installation

```bash
cd ~/heurist-mesh-x402
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Configuration

Required environment variables in `.env`:

```bash
# Heurist Mesh Backend
MESH_API_URL=https://mesh.heurist.ai
MESH_METADATA_URL=https://mesh.heurist.ai/metadata.json
MESH_API_KEY=your_mesh_api_key

# X402 Settings
X402_NETWORK=base-sepolia  # or 'base' for production
DEFAULT_PRICE_USD=0.10

# Server
PORT=3402
```

See `.env.example` for full configuration options.

## Architecture

### Route Structure

For each enabled Mesh agent tool, a REST endpoint is automatically generated:

```
POST /x402/agents/{AgentId}/{toolName}
```

**Example Routes:**
```
POST /x402/agents/AIXBTProjectInfoAgent/search_projects
POST /x402/agents/AIXBTProjectInfoAgent/get_market_summary
GET  /x402/agents/AaveAgent/get_aave_reserves
POST /x402/agents/DexScreenerTokenInfoAgent/get_token_info
```

### Payment Flow

1. **Discovery:** Client finds tool in X402 Bazaar
2. **Initial Request:** Client calls endpoint without payment → `402 Payment Required`
3. **Payment:** Client pays USDC to author's wallet (gasless via X402)
4. **Retry:** Client retries with payment proof
5. **Execution:** Gateway validates payment, calls Mesh tool, returns result

### Request/Response Format

**Request:**
```bash
POST /x402/agents/AIXBTProjectInfoAgent/search_projects
Content-Type: application/json

{
  "limit": 10,
  "ticker": "BTC"
}
```

**Response (after payment):**
```json
{
  "response": "",
  "data": {
    "projects": [
      {
        "name": "Bitcoin",
        "ticker": "BTC",
        "description": "...",
        "price_change_24h": 2.5
      }
    ]
  }
}
```

## Enabling Agents for X402

To make a Heurist Mesh agent available via X402, add configuration to the agent's metadata:

```python
# In mesh/agents/your_agent.py
self.metadata.update({
    "author_address": "0xYourWalletAddress",  # Where payments are sent
    "credits": 5,  # Signal X402 eligibility (or use x402_config.enabled)
    "x402_config": {
        "enabled": True,
        "default_price_usd": "0.10",
        "tool_prices": {
            "search_projects": "0.05",
            "get_market_summary": "0.15"
        }
    }
})
```

The middleware will automatically:
1. Detect the agent in metadata
2. Generate routes for each tool
3. Apply X402 payment protection
4. Index in X402 Bazaar for discovery

## Project Structure

```
heurist-mesh-x402/
├── src/
│   ├── server.ts              # Main Express app entry point
│   ├── config/                # Configuration management
│   │   ├── env.ts             # Environment variables
│   │   └── x402.ts            # X402 settings
│   ├── services/              # Core business logic
│   │   ├── metadata.ts        # Fetch & parse Mesh metadata
│   │   ├── mesh-client.ts     # HTTP client for Mesh API
│   │   └── route-generator.ts # Dynamic route creation
│   ├── middleware/            # Express middleware
│   │   ├── payment.ts         # X402 payment handling
│   │   ├── validation.ts      # Input validation
│   │   └── error-handler.ts   # Global error handling
│   ├── types/                 # TypeScript type definitions
│   │   ├── mesh.ts
│   │   └── x402.ts
│   └── utils/                 # Utility functions
│       ├── logger.ts
│       └── price-converter.ts
├── ARCHITECTURE.md            # Detailed architecture design
├── TASK_BREAKDOWN.md          # Implementation task checklist
└── README.md                  # This file
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## Deployment

### Testnet (Base Sepolia)

```bash
export X402_NETWORK=base-sepolia
export X402_FACILITATOR_URL=https://x402.org/facilitator
npm run build && npm start
```

### Production (Base Mainnet)

```bash
export X402_NETWORK=base
export CDP_API_KEY_ID=your_key
export CDP_API_KEY_SECRET=your_secret
npm run build && npm start
```

See `TASK_BREAKDOWN.md` Phase 8 for detailed deployment instructions.

## Monitoring

Health check endpoint:
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "uptime_seconds": 3600,
  "routes_registered": 84,
  "last_metadata_fetch": "2025-10-10T08:00:00Z",
  "mesh_api_status": "connected"
}
```

List all available agents/tools:
```bash
GET /x402/agents
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, configuration
- **[TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)** - Detailed implementation checklist with 100+ tasks
- **API Documentation** - Auto-generated OpenAPI spec at `/docs` (coming soon)

## Example Usage

### From X402-Compatible Client

```typescript
import { X402Client } from '@coinbase/x402-client';

const client = new X402Client();

const result = await client.call({
  url: 'https://mesh-x402.heurist.ai/x402/agents/AIXBTProjectInfoAgent/search_projects',
  method: 'POST',
  body: { ticker: 'ETH', limit: 5 }
});

console.log(result.data.projects);
```

### Manual cURL (with payment)

```bash
# 1. Make initial request (will get 402)
curl -X POST https://mesh-x402.heurist.ai/x402/agents/AIXBTProjectInfoAgent/search_projects \
  -H "Content-Type: application/json" \
  -d '{"ticker": "ETH", "limit": 5}'

# Returns 402 with payment metadata
# {
#   "payTo": "0x7d9d1821d15B9e0b8Ab98A058361233E255E405D",
#   "amount": "50000",  // 0.05 USDC
#   "network": "base",
#   "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
# }

# 2. Complete payment via X402 protocol (using SDK or wallet)
# 3. Retry with payment proof header
curl -X POST https://mesh-x402.heurist.ai/x402/agents/AIXBTProjectInfoAgent/search_projects \
  -H "Content-Type: application/json" \
  -H "X-Payment-Proof: <settlement_proof>" \
  -d '{"ticker": "ETH", "limit": 5}'

# Returns 200 with tool result
```

## Contributing

Contributions are welcome! Please see `TASK_BREAKDOWN.md` for open tasks.

### Adding a New Agent

1. Create agent in Heurist Mesh framework
2. Add `author_address` and `x402_config` to metadata
3. Deploy metadata update
4. Middleware will auto-discover and expose the agent

## Security

- API keys stored in environment variables (never in code)
- Payment proofs validated before tool execution
- Input validated against tool schemas
- Rate limiting enabled (coming soon)
- HTTPS required in production

## License

MIT

## Links

- **Heurist Mesh:** https://mesh.heurist.ai
- **X402 Protocol:** https://docs.cdp.coinbase.com/x402
- **X402 Bazaar:** https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources
- **Heurist Docs:** https://docs.heurist.ai

## Support

- GitHub Issues: https://github.com/heurist-network/heurist-mesh-x402/issues
- Discord: https://discord.gg/heurist
- Email: support@heurist.ai
