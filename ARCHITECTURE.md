# Heurist Mesh X402 Integration Architecture

## Overview

This project creates a Node.js payment middleware that wraps Heurist Mesh agents and exposes their tools via X402-protected REST endpoints, making them discoverable and payable through the Coinbase X402 Bazaar.

## Architecture Diagram

```
User/AI Agent (with USDC)
         ↓
    X402 Bazaar Discovery
         ↓
/x402/agents/{agentId}/{tool} (Node.js Middleware)
         ↓
    X402 Payment Flow (402 → pay → retry with proof)
         ↓
  Heurist Mesh /mesh_request (Python FastAPI)
         ↓
    MeshAgent Tool Execution
         ↓
    JSON Response
```

## Key Components

### 1. Heurist Mesh Agent Framework (Existing - Python)

**Location:** `/home/appuser/heurist-agent-framework/mesh/`

**Files:**
- `mesh_api.py` - FastAPI server exposing `/mesh_request` endpoint
- `mesh_agent.py` - Base class for all agents with metadata, tool schemas
- `agents/*.py` - 42 concrete agent implementations

**Key Patterns:**
- Each agent has `metadata` dict with author_address, description, inputs/outputs
- Each agent has `get_tool_schemas()` returning OpenAI function calling format
- Direct tool call mode: `{"agent_id": "...", "input": {"tool": "...", "tool_arguments": {...}}}`
- Natural language mode: `{"agent_id": "...", "input": {"query": "..."}}`

**Metadata URL:** `https://mesh.heurist.ai/metadata.json`

### 2. X402 Payment Middleware (New - Node.js/TypeScript)

**Location:** `/home/appuser/heurist-mesh-x402/`

**Purpose:**
- Programmatically generate REST routes for each Mesh tool
- Handle X402 payment flow (402 Payment Required → settlement → forward request)
- Forward authenticated requests to Heurist Mesh backend
- Make tools discoverable in X402 Bazaar

**Technology Stack:**
- Runtime: Node.js (TypeScript)
- Framework: Express.js (using `x402-express` from Coinbase)
- Payment:
  - Testnet: `https://x402.org/facilitator`
  - Production: `@coinbase/x402` package
- Discovery: Routes marked `discoverable: true`

### 3. X402 Configuration in Mesh Agents

**New Field in Agent Metadata:**
```python
self.metadata.update({
    # ... existing fields ...
    "x402_enabled": True,  # NEW: Flag to enable X402 discovery
    "x402_config": {        # NEW: Per-agent X402 settings
        "default_price_usd": "0.10",
        "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",  # USDC on Base
        "network": "base",  # or "base-sepolia" for testnet
        "tool_prices": {    # Per-tool price overrides
            "search_projects": "0.05",
            "get_market_summary": "0.15"
        }
    }
})
```

**No Logic Changes to Mesh Server:** Only metadata additions for configuration.

## Route Structure

### Dynamic Route Generation

For each Mesh agent with `x402_enabled: true`, generate routes for each tool:

**Pattern:** `/x402/agents/{agentId}/{toolName}`

**Example Routes:**
```
POST /x402/agents/AIXBTProjectInfoAgent/search_projects
POST /x402/agents/AIXBTProjectInfoAgent/get_market_summary
GET  /x402/agents/AaveAgent/get_aave_reserves
POST /x402/agents/ArkhamIntelligenceAgent/get_address_intelligence
POST /x402/agents/ArkhamIntelligenceAgent/get_contract_metadata
... (one route per tool per agent)
```

### Route Metadata for X402 Discovery

Each route includes:
```typescript
{
  discoverable: true,
  description: "<tool.function.description from metadata>",
  inputSchema: <tool.function.parameters from metadata>,
  outputSchema: {
    type: "object",
    properties: {
      response: { type: "string", description: "LLM explanation" },
      data: { type: "object", description: "Structured tool result" }
    }
  },
  payment: {
    payTo: "<metadata.author_address>",
    asset: "<x402_config.asset>",
    network: "<x402_config.network>",
    maxAmountRequired: "<tool_price_in_smallest_units>",
    maxTimeoutSeconds: 300
  }
}
```

## Request Flow

### 1. Discovery Phase

```
AI Agent/User → GET https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources
             ← Returns all X402-enabled Mesh tools with schemas
```

### 2. Tool Call with Payment

```
Client → POST /x402/agents/AIXBTProjectInfoAgent/search_projects
         Body: { "limit": 10, "ticker": "BTC" }
         No payment header

Middleware ← HTTP 402 Payment Required
           { payTo: "0x7d9d...", amount: "50000", network: "base" }

Client pays via X402 protocol (USDC on Base, gasless)

Client → POST /x402/agents/AIXBTProjectInfoAgent/search_projects (retry)
         Body: { "limit": 10, "ticker": "BTC" }
         Header: X-Payment-Proof: <settlement_proof>

Middleware validates payment
         ↓
Middleware → POST https://mesh.heurist.ai/mesh_request
            Body: {
              "agent_id": "AIXBTProjectInfoAgent",
              "input": {
                "tool": "search_projects",
                "tool_arguments": { "limit": 10, "ticker": "BTC" },
                "raw_data_only": true
              },
              "api_key": "<mesh_api_key>"
            }

Mesh Server executes tool
         ↓
Middleware ← { "response": "", "data": { "projects": [...] } }
         ↓
Client ← 200 OK { "response": "", "data": { "projects": [...] } }
```

## Tool Naming Strategy

### Option 1: Kebab-case (Recommended)
- **Route:** `/x402/agents/aixbt-project-info/search-projects`
- **Pros:** URL-friendly, common REST convention
- **Cons:** Need mapping back to camelCase for Mesh API

### Option 2: Keep Original (camelCase)
- **Route:** `/x402/agents/AIXBTProjectInfoAgent/search_projects`
- **Pros:** Direct 1:1 mapping to Mesh metadata
- **Cons:** Less conventional for URLs

### Decision: **Option 2 (Keep Original)**
- Simplest implementation (no name transformation)
- Clear traceability to Mesh agent names
- X402 Bazaar examples show mixed conventions

## Data Flow Details

### Metadata Loading
```
Startup:
1. Fetch https://mesh.heurist.ai/metadata.json
2. Filter agents where x402_enabled === true (or credits > 0 as fallback)
3. For each enabled agent:
   a. Extract agent_id, author_address, description
   b. For each tool in tools array:
      - Create Express route handler
      - Register with X402 middleware
      - Add inputSchema/outputSchema from tool.function.parameters
      - Set payment config from x402_config
```

### Request Transformation
```
X402 Route Request:
  POST /x402/agents/AIXBTProjectInfoAgent/search_projects
  Body: { "limit": 10, "ticker": "BTC" }

Transformed to Mesh Request:
  POST https://mesh.heurist.ai/mesh_request
  Body: {
    "agent_id": "AIXBTProjectInfoAgent",
    "input": {
      "tool": "search_projects",
      "tool_arguments": { "limit": 10, "ticker": "BTC" },
      "raw_data_only": true  // Skip LLM explanation for API calls
    },
    "api_key": "<from_env>"
  }
```

### Response Passthrough
```
Mesh Response:
  { "response": "", "data": { "projects": [...] } }

X402 Response (same):
  { "response": "", "data": { "projects": [...] } }
```

## Configuration

### Environment Variables (.env)

```bash
# Heurist Mesh Backend
MESH_API_URL=https://mesh.heurist.ai
MESH_METADATA_URL=https://mesh.heurist.ai/metadata.json
MESH_API_KEY=your_mesh_api_key_here

# X402 Payment Settings
X402_NETWORK=base-sepolia  # or 'base' for production
DEFAULT_PRICE_USD=0.10
X402_USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
X402_USDC_ADDRESS_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# X402 Facilitator
# Testnet: use external facilitator
X402_FACILITATOR_URL=https://x402.org/facilitator
# Production: use @coinbase/x402 built-in facilitator
CDP_API_KEY_ID=your_cdp_key
CDP_API_KEY_SECRET=your_cdp_secret

# Server
PORT=3402
NODE_ENV=development
```

### Agent-Level Configuration

Each Mesh agent can opt-in via metadata:

```python
# In agents/aixbt_project_info_agent.py
self.metadata.update({
    "credits": 5,  # Existing field, can signal X402 eligibility
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

**Fallback Logic:** If `x402_config` not present, check if `credits > 0` to determine eligibility.

## Error Handling

### Payment Failures
- Return 402 with proper payment metadata
- Log payment attempts for analytics

### Mesh Backend Errors
- Forward error status codes (500, 503, etc.)
- Transform error messages to user-friendly format
- Include original error in logs

### Invalid Tool/Agent
- Return 404 Not Found with helpful message
- Suggest similar agents/tools

## Monitoring & Analytics

### Metrics to Track
- Requests per agent/tool
- Payment success rate
- Average response time per tool
- Revenue per agent (for author_address)
- Error rates

### Logging
- All payment attempts (success/failure)
- Mesh API calls (latency, status)
- Route registrations at startup

## Security Considerations

1. **API Key Management:** Store MESH_API_KEY securely, never expose in responses
2. **Payment Validation:** Always verify payment proofs before forwarding to Mesh
3. **Rate Limiting:** Implement per-IP rate limits to prevent abuse
4. **Input Validation:** Validate tool_arguments against inputSchema
5. **CORS:** Restrict to X402-compatible origins

## Deployment Strategy

### Development
1. Use `base-sepolia` testnet
2. Point to staging Mesh API if available
3. Use external facilitator at x402.org

### Production
1. Switch to `base` mainnet
2. Use production Mesh API
3. Import facilitator from @coinbase/x402
4. Enable comprehensive monitoring
5. Set up revenue distribution to author_addresses

## Migration Path

### Phase 1: Metadata Addition
- Add `x402_config` to select agents
- Deploy metadata changes to Mesh
- No middleware needed yet

### Phase 2: Middleware Development
- Build Node.js middleware per this architecture
- Test with 1-2 agents initially
- Validate payment flow end-to-end

### Phase 3: Full Rollout
- Enable X402 for all eligible agents
- Register with X402 Bazaar
- Monitor adoption and iterate

## Open Questions & Decisions Needed

1. **Credits vs X402 Config:** Use existing `credits` field or new `x402_config.enabled`?
   - **Recommendation:** Use `credits > 0` as initial signal, allow `x402_config` override

2. **Price Currency:** Fixed USD or dynamic USDC amount?
   - **Recommendation:** Store USD in config, convert to USDC on-the-fly based on current rate

3. **Revenue Split:** How to handle payments to multiple author_addresses?
   - **Recommendation:** Single payTo per tool (author_address from agent metadata)

4. **Mesh API Auth:** Bearer token vs API key in body?
   - **Current:** API key in body, continue this pattern

5. **Tool Response Format:** Return raw data or include LLM explanation?
   - **Recommendation:** Use `raw_data_only: true` for X402 calls (faster, cheaper)
