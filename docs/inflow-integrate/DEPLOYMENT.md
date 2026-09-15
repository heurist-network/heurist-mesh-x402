# Heurist Mesh seller integration

Canonical origin: `https://mesh.heurist.xyz`. PM2 process: `x402-gateway`.

## Current behavior

Production seller configuration is active. Live verification on 2026-09-15 checked all 76 InFlow tool challenges against the seller SDK: prices, recipients, assets, and networks match. Base USDC, Solana USDC/USDT/PYUSD, and InFlow balance options are advertised. Malformed and forged payment proofs both return 402 without a settlement receipt.

One authorized production Base purchase succeeded on 2026-09-15: 0.001 USDC from `0x35bBF9A17BBaD2c21d0cAB6881f2DBB49826c909` to `0xa112c9c8bf655c678c768b6fd42a1c6fbfed7d60`. The market-summary endpoint returned HTTP 200 with JSON and a successful InFlow settlement receipt. The Base transaction receipt independently confirms the exact buyer-to-seller USDC transfer: [0xdc4125debf501f32456ab6048ad9aec54307edb471dd3e763ad93480cbab4162](https://basescan.org/tx/0xdc4125debf501f32456ab6048ad9aec54307edb471dd3e763ad93480cbab4162). The tool returned an empty summary list in a subsequent direct backend check. Solana and InFlow balance settlement have not been paid-tested.

- `/.well-known/odp`: public ODP catalog with required list/get operations.
- `/odp/offerings`: paginated Mesh tool offerings, using the existing prices.
- `/odp/offerings/{agentId}--{toolName}`: full offering with a POST invocation action and request schema.
- `/.well-known/aep`, `/aep/enroll`, `/aep/status`: signed did:web enrollment. Enrollment is optional for catalog and payment access. No session grants are advertised or needed.
- `/x402/inflow/agents/{agentId}/{toolName}`: InFlow x402 seller routes, enabled only after successful seller configuration. Missing configuration returns 503; it never executes a tool for free.
- `/x402/inflow/agents`: lists enabled InFlow routes.

Without an InFlow seller key, ODP advertises Base and points to existing `/x402/base/agents/...` routes. After successful InFlow configuration, it advertises InFlow and points to `/x402/inflow/agents/...`. Catalog listing does not execute or charge for a tool.

## Activate seller payments

1. Register a **Seller** account at <https://sandbox.inflowpay.ai> (test) or <https://app.inflowpay.ai/register/seller/> (live). Account terms, payout settings, and receiving wallets must be chosen by the owner.
2. Set these in the gateway's `.env`, never in git or chat:

   ```dotenv
   INFLOW_API_KEY=your_seller_key
   INFLOW_ENVIRONMENT=sandbox
   ```

   Use `production` only for a production seller key. The SDK derives the API endpoint; there is no custom facilitator URL. Payment recipients and accepted assets come from the seller account configuration. Both fixed-price `exact` and `balance` schemes are supported.

3. Run `npm run build` and `npm run test:inflow`, then `pm2 restart x402-gateway`. `.env` is loaded on startup. If PM2 itself already defines these variables, update those too: process environment takes precedence over `.env`.
4. Check `/x402/inflow/agents` is nonempty. POST an empty JSON object to a listed tool URL **without a payment signature** and verify a 402 with `PAYMENT-REQUIRED`.
5. Decode the challenge and verify network, asset, amount, and recipient against the seller dashboard. A production Base payment has passed the settlement test recorded above. Additional paid tests require their own authorization.
6. Validate at <https://directory.inflowpay.ai/validate/>. The browser form requires CAPTCHA. After live payment verification and readiness to publish, submit the origin at <https://directory.inflowpay.ai/publish/> or via `POST https://directory.inflowpay.ai/v1/services` with `{"origin":"https://mesh.heurist.xyz"}`. This deployment has not submitted a directory listing.

## Enrollment persistence and security

SQLite defaults to `data/aep.sqlite`; override with `AEP_DATABASE_PATH`. Keep this directory persistent and private. Back it up with SQLite's backup facility or stop the process before copying the database and WAL files. Enrollment records survive restart; assertion replay records expire with their assertions; command idempotency lasts 24 hours. Interrupted commands remain reserved until expiration to avoid duplicate execution.

Agent signatures use the official AEP verifier. DID fetches require public HTTPS on port 443, pin resolved addresses, reject private/special networks and redirects, disable environment proxies, and bound response size and timeout. Enrollment has a concurrency cap and a conservative per-socket rate limit. Behind nginx, that rate bucket is shared by callers; adjust it with a trusted client-IP policy if enrollment traffic grows.

The implementation uses native SQLite under Bun (PM2) and Node 22.18+ (`npm start`). Tests exercise both runtimes.

## nginx change on this machine

`/etc/nginx/sites-available/mesh`, catch-all gateway location:

```nginx
proxy_pass http://127.0.0.1:3402;
proxy_buffer_size 64k;
proxy_buffers 8 64k;
proxy_busy_buffers_size 128k;
```

The previous `localhost` upstream attempted IPv6 despite the IPv4-only listener. Default response-header buffers also rejected larger x402 challenges. Both caused public 502s. Configuration was checked with `nginx -t` and reloaded. Backup: `/etc/nginx/sites-available/mesh.pre-inflow-20260915`.

## Verification

`npm run test:inflow` covers ODP pagination and full representations, schema references, media negotiation, missing-resource errors, unsigned enrollment rejection, signed enrollment, durable assertion replay prevention and command idempotency, and rejection of private-network DID URLs. `bun test ./scripts/test-inflow.ts` runs the same tests on the PM2 runtime.

The automated unit tests do not spend money. The separate authorized production payment test and its on-chain evidence are recorded above.

`bun scripts/verify-inflow.ts` repeats the public production checks without signing or settling any payment. `bun scripts/test-inflow-payment.ts` inspects a proposed 0.001 USDC Base purchase using `TEST_PRIVATE_KEY`. Adding `--pay` executes one real purchase and checks its receipt and on-chain USDC transfer; use only after authorization. It does not automatically retry paid requests.
