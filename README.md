# Heurist Mesh X402 Gateway

> Payment-enabled REST API gateway that exposes Heurist Mesh agent tools via Coinbase X402 protocol, enabling AI agents and developers to pay for API calls with USDC on Base.

**[Heurist Mesh](https://mesh.heurist.ai) solves the crypto knowledge gap in AI agents by providing curated tools for token data, blockchain analytics, trending news, and social media intelligence. Purpose-built for accurate crypto operations.**

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
pnpm install
cp .env.example .env
# Edit .env with your configuration
pnpm dev
```

### Configuration

Required environment variables in `.env`:

```bash
# Heurist Mesh Backend
MESH_API_URL=https://mesh.heurist.xyz
MESH_METADATA_URL=https://mesh.heurist.ai/metadata.json
MESH_API_KEY=your_mesh_api_key

# X402 Settings
X402_NETWORK=base  # or 'base-sepolia' for testnet
DEFAULT_PRICE_USD=0.10

# Server
PORT=3402
NODE_ENV=production
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

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode (auto-reload)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type check
pnpm tsc --noEmit
```

## Production Deployment with PM2

### Initial Setup

```bash
# Build the application
pnpm build

# Create PM2 ecosystem file (if not exists)
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'x402-gateway',
    script: './dist/server.js',
    cwd: '/home/appuser/heurist-mesh-x402',
    instances: 1,
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Install PM2 globally (if not installed)
pnpm add -g pm2

# Install PM2 log rotation module
pm2 install pm2-logrotate

# Configure log rotation (50MB max size, keep 10 files, compress)
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true

# Start the application
pm2 start ecosystem.config.cjs --env production

# Save PM2 process list
pm2 save

# Generate startup script (run once, follow the command it prints)
pm2 startup
```

### PM2 Management Commands

```bash
# View status of all processes
pm2 status

# View real-time logs
pm2 logs x402-gateway

# View last 100 log lines
pm2 logs x402-gateway --lines 100

# View only error logs
pm2 logs x402-gateway --err

# Restart application
pm2 restart x402-gateway

# Reload (zero-downtime restart)
pm2 reload x402-gateway

# Stop application
pm2 stop x402-gateway

# Delete from PM2 process list
pm2 delete x402-gateway

# Monitor CPU/Memory usage
pm2 monit

# View detailed process info
pm2 show x402-gateway

# Clear logs
pm2 flush x402-gateway

# Save current process list
pm2 save

# Resurrect saved processes after reboot
pm2 resurrect
```

### Deployment Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
pnpm install

# 3. Build application
pnpm build

# 4. Reload PM2 (zero-downtime)
pm2 reload x402-gateway

# 5. Check logs for errors
pm2 logs x402-gateway --lines 50
```

### Log Rotation Settings

Current configuration:
- **Max file size:** 50MB per log file
- **Retention:** Keep last 10 rotated files
- **Compression:** Gzip old logs to save space
- **Rotation schedule:** Daily at midnight + when size limit reached

View log rotation config:
```bash
pm2 conf pm2-logrotate
```

## Monitoring

### Health Check Endpoint

```bash
curl https://mesh.heurist.xyz/health
```

Response:
```json
{
  "status": "ok",
  "uptime": 3600,
  "env": "production",
  "routes_count": 84,
  "last_metadata_fetch": 120
}
```

### List Available Agents

```bash
curl https://mesh.heurist.xyz/x402/agents
```

Response:
```json
{
  "count": 15,
  "agents": [
    {
      "agentId": "AIXBTProjectInfoAgent",
      "author": "0x7d9d1821d15B9e0b8Ab98A058361233E255E405D",
      "tools": [
        {
          "name": "search_projects",
          "path": "/x402/agents/AIXBTProjectInfoAgent/search_projects",
          "priceUsd": "0.01"
        }
      ]
    }
  ]
}
```

## Example Usage

### From X402-Compatible Client

```typescript
import { X402Client } from '@coinbase/x402-client';

const client = new X402Client();

const result = await client.call({
  url: 'https://mesh.heurist.xyz/x402/agents/AIXBTProjectInfoAgent/search_projects',
  method: 'POST',
  body: { ticker: 'ETH', limit: 5 }
});

console.log(result.data.projects);
```

### Manual cURL (with payment)

```bash
# 1. Make initial request (will get 402)
curl -X POST https://mesh.heurist.xyz/x402/agents/AIXBTProjectInfoAgent/search_projects \
  -H "Content-Type: application/json" \
  -d '{"ticker": "ETH", "limit": 5}'

# Returns 402 with payment metadata
# {
#   "x402Version": 1,
#   "error": "X-PAYMENT header is required",
#   "accepts": [{
#     "payTo": "0x7d9d1821d15B9e0b8Ab98A058361233E255E405D",
#     "maxAmountRequired": "10000",  // 0.01 USDC (6 decimals)
#     "network": "base",
#     "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
#     "maxTimeoutSeconds": 120
#   }]
# }

# 2. Complete payment via X402 protocol (using SDK or wallet)
# 3. Retry with payment proof header
curl -X POST https://mesh.heurist.xyz/x402/agents/AIXBTProjectInfoAgent/search_projects \
  -H "Content-Type: application/json" \
  -H "X-Payment: <payment_proof>" \
  -d '{"ticker": "ETH", "limit": 5}'

# Returns 200 with tool result
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, configuration
- **[TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)** - Detailed implementation checklist
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Complete production deployment guide with HTTPS/SSL setup

## Security

- API keys stored in environment variables (never in code)
- Payment proofs validated before tool execution
- Input validated against tool schemas
- HTTPS required in production (TLS 1.2/1.3)
- Security headers (HSTS, XSS protection, etc.)
- SSL certificate auto-renewal via Let's Encrypt

## License

MIT

## Links

- **Production Gateway:** https://mesh.heurist.xyz
- **Heurist Mesh:** https://mesh.heurist.ai
- **X402 Protocol:** https://docs.cdp.coinbase.com/x402
- **X402 Bazaar:** https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources
- **Heurist Docs:** https://docs.heurist.ai

## Support

- GitHub Issues: https://github.com/heurist-network/heurist-mesh-x402/issues
- Discord: https://discord.gg/heurist
- Email: support@heurist.ai
