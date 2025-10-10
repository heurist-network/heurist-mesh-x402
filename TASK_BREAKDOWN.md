# Heurist Mesh X402 Integration - Detailed Task Breakdown

## Project Overview
Create a Node.js payment middleware that exposes Heurist Mesh agent tools via X402-protected REST endpoints, enabling discovery and payments through Coinbase X402 Bazaar.

---

## Phase 1: Repository & Project Setup

### 1.1 Repository Initialization
- [x] Create ~/heurist-mesh-x402 directory
- [x] Initialize git repository
- [ ] Create .gitignore for Node.js/TypeScript
- [ ] Add LICENSE file (MIT or Apache-2.0)
- [ ] Create initial README.md with project description

### 1.2 Node.js/TypeScript Setup
- [ ] Initialize npm project (`npm init -y`)
- [ ] Install TypeScript and configure tsconfig.json
  - [ ] Set target: ES2022, module: NodeNext
  - [ ] Enable strict mode, esModuleInterop
  - [ ] Set outDir: ./dist, rootDir: ./src
- [ ] Install core dependencies:
  - [ ] `express` and `@types/express`
  - [ ] `dotenv`
  - [ ] `axios` for HTTP requests
  - [ ] `zod` for schema validation
  - [ ] `winston` for logging
- [ ] Install X402 dependencies:
  - [ ] `x402-express` (Coinbase X402 middleware)
  - [ ] `@coinbase/x402` (for production facilitator)
- [ ] Install dev dependencies:
  - [ ] `typescript`, `@types/node`
  - [ ] `tsx` for development
  - [ ] `nodemon` for auto-reload
  - [ ] `eslint`, `prettier` for code quality
- [ ] Create package.json scripts:
  - [ ] `dev`: `nodemon --exec tsx src/server.ts`
  - [ ] `build`: `tsc`
  - [ ] `start`: `node dist/server.js`
  - [ ] `lint`: `eslint src --ext .ts`
  - [ ] `format`: `prettier --write src/**/*.ts`

### 1.3 Project Structure
- [ ] Create directory structure:
  ```
  ~/heurist-mesh-x402/
  ├── src/
  │   ├── server.ts              # Main Express app
  │   ├── config/
  │   │   ├── env.ts             # Environment config
  │   │   └── x402.ts            # X402 config
  │   ├── services/
  │   │   ├── metadata.ts        # Fetch & parse mesh metadata
  │   │   ├── mesh-client.ts     # HTTP client for Mesh API
  │   │   └── route-generator.ts # Dynamic route creation
  │   ├── middleware/
  │   │   ├── payment.ts         # X402 payment middleware
  │   │   ├── validation.ts      # Input validation
  │   │   └── error-handler.ts   # Global error handler
  │   ├── types/
  │   │   ├── mesh.ts            # Mesh metadata types
  │   │   └── x402.ts            # X402 types
  │   └── utils/
  │       ├── logger.ts          # Winston logger setup
  │       └── price-converter.ts # USD to USDC conversion
  ├── .env.example               # Example environment variables
  ├── .env                       # Actual environment (gitignored)
  ├── tsconfig.json
  ├── package.json
  ├── ARCHITECTURE.md
  ├── TASK_BREAKDOWN.md
  └── README.md
  ```

### 1.4 Environment Configuration
- [ ] Create .env.example with all required variables
- [ ] Create .env for local development
- [ ] Document each environment variable:
  - [ ] MESH_API_URL
  - [ ] MESH_METADATA_URL
  - [ ] MESH_API_KEY
  - [ ] X402_NETWORK (base-sepolia | base)
  - [ ] DEFAULT_PRICE_USD
  - [ ] X402_USDC_ADDRESS_BASE
  - [ ] X402_USDC_ADDRESS_BASE_SEPOLIA
  - [ ] X402_FACILITATOR_URL (for testnet)
  - [ ] CDP_API_KEY_ID (for production)
  - [ ] CDP_API_KEY_SECRET (for production)
  - [ ] PORT
  - [ ] NODE_ENV

---

## Phase 2: Mesh Agent Configuration Updates

### 2.1 Define X402 Metadata Schema
- [ ] Document the new metadata fields in agent framework:
  ```python
  x402_config = {
      "enabled": bool,
      "default_price_usd": str,
      "tool_prices": dict[str, str]  # tool_name -> price_usd
  }
  ```
- [ ] Create example agent configuration snippet

### 2.2 Update Sample Agent (AIXBTProjectInfoAgent)
- [ ] Add x402_config to metadata in `/home/appuser/heurist-agent-framework/mesh/agents/aixbt_project_info_agent.py`
  - [ ] Set enabled: True
  - [ ] Set default_price_usd: "0.10"
  - [ ] Set tool_prices: {"search_projects": "0.05", "get_market_summary": "0.15"}
- [ ] Test agent still works with existing Mesh API

### 2.3 Fallback Strategy Implementation
- [ ] Decide on agent eligibility logic:
  - Option A: Use `credits > 0` as signal
  - Option B: Require explicit `x402_config.enabled: true`
  - **Recommendation:** Use credits > 0 as initial filter
- [ ] Document the eligibility criteria

### 2.4 Validate Metadata Changes
- [ ] Ensure metadata.json endpoint includes new fields
- [ ] Verify author_address is present for all x402-enabled agents
- [ ] Check tool schemas have proper descriptions and parameters

---

## Phase 3: Core Middleware Development

### 3.1 Type Definitions (src/types/)
- [ ] Create `mesh.ts` with TypeScript interfaces:
  - [ ] `MeshMetadata` - full metadata response
  - [ ] `AgentMetadata` - individual agent metadata
  - [ ] `ToolSchema` - OpenAI function calling schema
  - [ ] `X402Config` - agent-level X402 config
  - [ ] `MeshRequest` - request to /mesh_request
  - [ ] `MeshResponse` - response from /mesh_request
- [ ] Create `x402.ts` with X402-specific types:
  - [ ] `PaymentConfig` - payment metadata for routes
  - [ ] `PaymentProof` - settlement proof structure
  - [ ] `RouteMetadata` - discoverable route metadata

### 3.2 Configuration Module (src/config/)
- [ ] `env.ts`: Load and validate environment variables
  - [ ] Use zod for runtime validation
  - [ ] Throw clear errors for missing required vars
  - [ ] Export typed config object
- [ ] `x402.ts`: X402-specific configuration
  - [ ] USDC address lookup by network
  - [ ] Facilitator URL/config based on environment
  - [ ] Default payment timeouts

### 3.3 Logging Setup (src/utils/logger.ts)
- [ ] Configure Winston logger with:
  - [ ] Console transport for development
  - [ ] File transport for production (logs/app.log)
  - [ ] Structured JSON format
  - [ ] Log levels: error, warn, info, debug
- [ ] Create logger convenience methods:
  - [ ] `logPaymentAttempt()`
  - [ ] `logMeshRequest()`
  - [ ] `logRouteRegistration()`

### 3.4 Metadata Service (src/services/metadata.ts)
- [ ] Implement `fetchMeshMetadata()`:
  - [ ] HTTP GET to MESH_METADATA_URL
  - [ ] Parse and validate response
  - [ ] Cache metadata with TTL (5 minutes)
  - [ ] Handle fetch errors gracefully
- [ ] Implement `getEligibleAgents()`:
  - [ ] Filter agents where `x402_config.enabled === true` OR `credits > 0`
  - [ ] Validate required fields (author_address, tools)
  - [ ] Return array of eligible agents
- [ ] Implement `getToolConfig(agentId, toolName)`:
  - [ ] Lookup tool-specific price
  - [ ] Fallback to agent default price
  - [ ] Fallback to global default price
  - [ ] Return PaymentConfig object

### 3.5 Mesh Client Service (src/services/mesh-client.ts)
- [ ] Implement `callMeshTool()`:
  - [ ] Accept agentId, toolName, toolArguments
  - [ ] Construct MeshRequest payload
  - [ ] POST to MESH_API_URL/mesh_request
  - [ ] Include MESH_API_KEY in request
  - [ ] Set raw_data_only: true
  - [ ] Handle HTTP errors
  - [ ] Parse and return MeshResponse
- [ ] Add retry logic with exponential backoff
- [ ] Add request timeout (30 seconds default)
- [ ] Log all requests and responses

### 3.6 Price Converter Utility (src/utils/price-converter.ts)
- [ ] Implement `usdToUsdcSmallestUnit()`:
  - [ ] Convert USD string (e.g., "0.10") to USDC smallest unit (e.g., "100000")
  - [ ] USDC has 6 decimals
  - [ ] Handle decimal precision correctly
  - [ ] Return string for large number safety
- [ ] Add validation for price format
- [ ] Add tests for edge cases

---

## Phase 4: Route Generation & X402 Integration

### 4.1 Route Generator Service (src/services/route-generator.ts)
- [ ] Implement `generateRoutes(app: Express, metadata: MeshMetadata)`:
  - [ ] Iterate through eligible agents
  - [ ] For each agent:
    - [ ] Extract agentId, author_address, tools
    - [ ] For each tool:
      - [ ] Generate route path: `/x402/agents/{agentId}/{toolName}`
      - [ ] Determine HTTP method (POST for most, GET for readonly)
      - [ ] Create route handler
      - [ ] Apply X402 payment middleware
      - [ ] Register route with Express
  - [ ] Log all registered routes
  - [ ] Return route registry for health checks

### 4.2 Route Handler Factory (src/services/route-generator.ts)
- [ ] Implement `createToolHandler(agentId, toolName)`:
  - [ ] Extract tool arguments from request body
  - [ ] Validate against inputSchema (using zod)
  - [ ] Call mesh-client.callMeshTool()
  - [ ] Transform response if needed
  - [ ] Return JSON response
  - [ ] Handle errors (400, 500, 503)

### 4.3 X402 Payment Middleware (src/middleware/payment.ts)
- [ ] Implement X402 middleware using `x402-express`:
  - [ ] Configure facilitator based on environment:
    - Testnet: external URL (https://x402.org/facilitator)
    - Production: import from @coinbase/x402
  - [ ] Set payment metadata per route:
    - payTo: author_address
    - asset: USDC address for network
    - maxAmountRequired: price in smallest unit
    - maxTimeoutSeconds: 300
    - network: base or base-sepolia
  - [ ] Mark routes as discoverable: true
  - [ ] Add inputSchema from tool metadata
  - [ ] Add outputSchema (standard Mesh response format)
- [ ] Handle payment validation:
  - [ ] Verify payment proof
  - [ ] Check payment amount
  - [ ] Validate recipient address
  - [ ] Log payment events
- [ ] Return 402 Payment Required on unpaid requests

### 4.4 Input Validation Middleware (src/middleware/validation.ts)
- [ ] Implement schema-based validation:
  - [ ] Accept Zod schema per route
  - [ ] Validate request body
  - [ ] Return 400 with clear error messages
  - [ ] Support query params for GET requests
- [ ] Add content-type validation
- [ ] Add request size limits

### 4.5 Error Handler Middleware (src/middleware/error-handler.ts)
- [ ] Implement global error handler:
  - [ ] Catch all unhandled errors
  - [ ] Log with full stack trace
  - [ ] Return user-friendly error messages
  - [ ] Never expose internal details
  - [ ] Include request ID for tracking
- [ ] Handle specific error types:
  - [ ] Mesh API errors (forward status)
  - [ ] Payment errors (402 with metadata)
  - [ ] Validation errors (400)
  - [ ] Not found (404)
  - [ ] Internal errors (500)

---

## Phase 5: Server Implementation

### 5.1 Main Server File (src/server.ts)
- [ ] Import and configure Express app
- [ ] Load environment configuration
- [ ] Initialize logger
- [ ] Setup middleware stack:
  - [ ] CORS (allow X402 origins)
  - [ ] JSON body parser
  - [ ] Request logging
  - [ ] Request ID generation
- [ ] Fetch Mesh metadata on startup
- [ ] Generate and register dynamic routes
- [ ] Add health check endpoint:
  - [ ] GET /health
  - [ ] Return: status, uptime, routes_count, last_metadata_fetch
- [ ] Add metadata endpoint (for debugging):
  - [ ] GET /x402/agents (list all available agents/tools)
- [ ] Apply global error handler
- [ ] Start server on configured PORT
- [ ] Handle graceful shutdown (SIGTERM, SIGINT)

### 5.2 Health & Discovery Endpoints
- [ ] Implement GET /health:
  - [ ] Check Mesh API connectivity
  - [ ] Return registered route count
  - [ ] Return metadata freshness
- [ ] Implement GET /x402/agents:
  - [ ] Return list of all agents with x402_enabled
  - [ ] Include tool names and prices
  - [ ] Include author addresses
  - [ ] Format for easy browsing

### 5.3 Graceful Shutdown
- [ ] Listen for SIGTERM and SIGINT
- [ ] Stop accepting new connections
- [ ] Wait for in-flight requests (with timeout)
- [ ] Close HTTP server
- [ ] Cleanup resources
- [ ] Exit process

---

## Phase 6: Testing & Validation

### 6.1 Unit Tests
- [ ] Test metadata service:
  - [ ] Mock fetch responses
  - [ ] Test agent filtering logic
  - [ ] Test price lookup logic
- [ ] Test mesh client:
  - [ ] Mock Mesh API responses
  - [ ] Test retry logic
  - [ ] Test timeout handling
- [ ] Test price converter:
  - [ ] Test USD to USDC conversion
  - [ ] Test edge cases (large numbers, decimals)
- [ ] Test route generation:
  - [ ] Test route path creation
  - [ ] Test handler factory

### 6.2 Integration Tests
- [ ] Test full request flow (without payment):
  - [ ] Call tool endpoint
  - [ ] Verify 402 response
  - [ ] Verify payment metadata
- [ ] Test with mock payment proof:
  - [ ] Simulate successful payment
  - [ ] Verify tool execution
  - [ ] Verify response format
- [ ] Test error scenarios:
  - [ ] Invalid tool name (404)
  - [ ] Invalid arguments (400)
  - [ ] Mesh API failure (503)
  - [ ] Payment failure (402 retry)

### 6.3 End-to-End Testing on Testnet
- [ ] Deploy to test environment
- [ ] Use base-sepolia network
- [ ] Test with real X402 client:
  - [ ] Make unpaid request (get 402)
  - [ ] Complete payment flow
  - [ ] Retry with proof
  - [ ] Receive tool response
- [ ] Verify in X402 Bazaar:
  - [ ] Check tools appear in discovery
  - [ ] Verify metadata accuracy
  - [ ] Test from Bazaar UI

### 6.4 Load Testing
- [ ] Test concurrent requests
- [ ] Test rate limiting (if implemented)
- [ ] Measure response times
- [ ] Identify bottlenecks

---

## Phase 7: Documentation

### 7.1 README.md
- [ ] Project description and purpose
- [ ] Quick start guide
- [ ] Installation instructions
- [ ] Configuration guide
- [ ] Example requests and responses
- [ ] Deployment instructions
- [ ] Contributing guidelines

### 7.2 API Documentation
- [ ] Create OpenAPI/Swagger spec:
  - [ ] Document all endpoints
  - [ ] Include X402 payment flow
  - [ ] Add request/response examples
- [ ] Generate API docs site (Swagger UI)

### 7.3 Developer Guide
- [ ] How to add new agents
- [ ] How to configure pricing
- [ ] How to deploy updates
- [ ] Monitoring and debugging guide
- [ ] Common issues and solutions

### 7.4 Architecture Documentation
- [ ] Update ARCHITECTURE.md with final decisions
- [ ] Add sequence diagrams
- [ ] Document key design patterns
- [ ] Add security considerations

---

## Phase 8: Deployment & Operations

### 8.1 Deployment Preparation
- [ ] Create Dockerfile:
  - [ ] Multi-stage build (build, production)
  - [ ] Optimize image size
  - [ ] Use non-root user
- [ ] Create docker-compose.yml for local testing
- [ ] Create deployment scripts:
  - [ ] deploy.sh for production
  - [ ] deploy-testnet.sh for staging

### 8.2 Environment Setup
- [ ] Set up testnet environment:
  - [ ] Configure base-sepolia
  - [ ] Use test USDC
  - [ ] Point to Mesh staging (if available)
- [ ] Set up production environment:
  - [ ] Configure base mainnet
  - [ ] Use production USDC
  - [ ] Point to production Mesh API
  - [ ] Configure CDP facilitator

### 8.3 Monitoring & Logging
- [ ] Set up logging aggregation:
  - [ ] Ship logs to centralized service
  - [ ] Set up log retention
- [ ] Set up metrics:
  - [ ] Request count per agent/tool
  - [ ] Payment success rate
  - [ ] Response times (p50, p95, p99)
  - [ ] Error rates
- [ ] Set up alerting:
  - [ ] Alert on high error rates
  - [ ] Alert on Mesh API failures
  - [ ] Alert on payment failures

### 8.4 Security Hardening
- [ ] Implement rate limiting:
  - [ ] Per-IP rate limits
  - [ ] Per-agent rate limits
- [ ] Add request validation:
  - [ ] Maximum body size
  - [ ] Content-type enforcement
  - [ ] Input sanitization
- [ ] Secure API keys:
  - [ ] Use secrets manager
  - [ ] Rotate keys regularly
- [ ] Enable HTTPS:
  - [ ] SSL certificate setup
  - [ ] Force HTTPS redirect

### 8.5 X402 Bazaar Registration
- [ ] Submit for Bazaar indexing:
  - [ ] Ensure discoverable: true on all routes
  - [ ] Verify metadata is correct
  - [ ] Monitor Bazaar for updates
- [ ] Test discovery:
  - [ ] Verify tools appear in Bazaar API
  - [ ] Test from external X402 clients

---

## Phase 9: Monitoring & Iteration

### 9.1 Post-Launch Monitoring
- [ ] Monitor first week metrics:
  - [ ] Total requests
  - [ ] Payment success rate
  - [ ] Popular agents/tools
  - [ ] Error patterns
- [ ] Collect user feedback
- [ ] Identify improvement opportunities

### 9.2 Performance Optimization
- [ ] Optimize metadata caching
- [ ] Add response caching (if applicable)
- [ ] Optimize Mesh API client connection pooling
- [ ] Reduce cold start time

### 9.3 Feature Enhancements
- [ ] Add analytics dashboard
- [ ] Add revenue reporting per author_address
- [ ] Add webhook support for async tools
- [ ] Add batch request support
- [ ] Add query parameter support for GET endpoints

### 9.4 Agent Onboarding
- [ ] Create agent onboarding guide
- [ ] Help agents configure x402_config
- [ ] Test new agents before enabling
- [ ] Monitor new agent adoption

---

## Validation Checklist

### Critical Path Items (Must Have for MVP)
- [ ] Node.js project with TypeScript setup
- [ ] Environment configuration loading
- [ ] Fetch and parse Mesh metadata
- [ ] Generate dynamic routes for eligible tools
- [ ] X402 payment middleware integration
- [ ] Forward authenticated requests to Mesh API
- [ ] Handle payment flow (402 → pay → retry)
- [ ] Basic error handling
- [ ] Health check endpoint
- [ ] Deployed to testnet and verified in Bazaar

### Nice to Have (Post-MVP)
- [ ] Comprehensive test suite
- [ ] OpenAPI documentation
- [ ] Analytics dashboard
- [ ] Rate limiting
- [ ] Response caching
- [ ] Webhook support
- [ ] Batch requests

---

## Risk Mitigation

### Identified Risks

1. **Mesh API Availability**
   - Risk: Mesh API downtime affects all tools
   - Mitigation: Implement circuit breaker pattern, return graceful errors

2. **Payment Validation Complexity**
   - Risk: X402 payment proof validation fails
   - Mitigation: Extensive testing with x402-express examples, use official SDK

3. **Metadata Schema Changes**
   - Risk: Mesh metadata format changes break parsing
   - Mitigation: Strict schema validation, graceful degradation, version checking

4. **Pricing Calculation Errors**
   - Risk: Incorrect USD to USDC conversion causes payment issues
   - Mitigation: Thorough testing, add validation checks, monitor payment failures

5. **Route Name Collisions**
   - Risk: Agent/tool names conflict with existing routes
   - Mitigation: Use namespaced paths (/x402/agents/*), validate uniqueness

6. **Security Vulnerabilities**
   - Risk: API key exposure, injection attacks
   - Mitigation: Input validation, secret management, security audit

---

## Success Metrics

### Technical Success
- [ ] 99% uptime for middleware
- [ ] <500ms average response time (excluding Mesh API latency)
- [ ] >95% payment success rate
- [ ] Zero critical security incidents

### Business Success
- [ ] 10+ agents enabled for X402
- [ ] 100+ successful paid tool calls in first month
- [ ] Listed in X402 Bazaar discovery
- [ ] Positive developer feedback

### Developer Experience
- [ ] Clear documentation
- [ ] Easy agent onboarding (<1 hour)
- [ ] Reliable payment flow
- [ ] Useful error messages

---

## Timeline Estimate

### Sprint 1: Setup & Infrastructure (3-5 days)
- Phase 1: Repository & Project Setup
- Phase 2: Mesh Agent Configuration Updates

### Sprint 2: Core Development (5-7 days)
- Phase 3: Core Middleware Development
- Phase 4: Route Generation & X402 Integration

### Sprint 3: Integration & Testing (3-5 days)
- Phase 5: Server Implementation
- Phase 6: Testing & Validation

### Sprint 4: Documentation & Deployment (3-4 days)
- Phase 7: Documentation
- Phase 8: Deployment & Operations

### Sprint 5: Launch & Monitoring (2-3 days)
- Phase 9: Monitoring & Iteration

**Total Estimated Time:** 16-24 days (3-5 weeks)

---

## Next Immediate Steps

1. [ ] Review this task breakdown with the team
2. [ ] Validate architecture decisions (see ARCHITECTURE.md open questions)
3. [ ] Set up development environment (Node.js, TypeScript, dependencies)
4. [ ] Create .env.example and document all variables
5. [ ] Implement Phase 1.2 (Node.js/TypeScript setup)
6. [ ] Implement Phase 3.4 (Metadata service) to validate Mesh API integration
7. [ ] Build minimal viable route (one agent, one tool) for proof of concept
8. [ ] Test end-to-end with testnet

---

## Notes & Considerations

### Key Decisions Made
1. **Keep original agent/tool names** in URLs (no transformation to kebab-case)
2. **Use `credits > 0`** as initial eligibility signal with `x402_config` override
3. **Set `raw_data_only: true`** for X402 calls to minimize latency
4. **Use Express.js** with x402-express middleware (simpler than Next.js for pure API)
5. **Store prices in USD**, convert to USDC on-the-fly

### Assumptions
1. Mesh metadata endpoint remains stable and accessible
2. All X402-enabled agents have valid author_address
3. Agent tool schemas follow OpenAI function calling format
4. Mesh API accepts direct tool calls (bypassing LLM)
5. X402 facilitator handles payment settlement reliably

### Open Questions to Resolve
1. Should we support natural language queries via X402, or only direct tool calls?
   - **Recommendation:** Start with direct tool calls only (simpler, faster)
2. How to handle agents with very long-running tools (>5 minutes)?
   - **Recommendation:** Set max timeout at 5 minutes, return 408 timeout error
3. Should we cache Mesh responses?
   - **Recommendation:** No caching initially (tools may return real-time data)
4. How to handle revenue distribution to multiple contributors?
   - **Recommendation:** Single author_address per agent for MVP
5. What happens if author_address is invalid or can't receive payments?
   - **Recommendation:** Validate addresses at route registration, skip invalid agents
