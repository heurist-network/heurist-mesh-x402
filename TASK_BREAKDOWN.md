# Heurist Mesh X402 Integration - Detailed Task Breakdown

## Project Overview
Create a Node.js payment middleware that exposes Heurist Mesh agent tools via X402-protected REST endpoints, enabling discovery and payments through Coinbase X402 Bazaar.

---

## Phase 4: Route Generation & X402 Integration

### 4.1-4.2 Route Generator ✅
Created `src/services/route-generator.ts` with:
- `generateRoutes()` - Iterates eligible agents, creates X402-protected routes
- `createToolHandler()` - Handles tool execution, calls Mesh API
- X402 middleware integration:
  - Configured with facilitatorUrl (testnet vs production)
  - Payment metadata: payTo, asset, maxAmountRequired, network, timeout
  - discoverable: true for Bazaar indexing
  - inputSchema from tool metadata
  - outputSchema for API response
- Routes: POST /x402/agents/{agentId}/{toolName}
- Returns RouteInfo[] for health checks

### 4.3 X402 Payment Middleware ✅
Integrated via x402-express in route-generator.ts:
- Uses x402() from x402-express package
- Facilitator: testnet URL or CDP (based on X402_NETWORK)
- Payment validation handled by x402-express
- 402 Payment Required auto-returned on unpaid requests

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
