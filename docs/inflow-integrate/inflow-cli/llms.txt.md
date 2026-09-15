<!-- source: https://inflowcli.ai/llms.txt -->
<!-- fetched: 2026-09-15 -->

# InFlow CLI

> Offering discovery, Agent Enrollment Protocol access, and MPP / x402 payments from your machine.
> Agent setup: https://inflowcli.ai/skill.md
> Discovery playbook: https://inflowcli.ai/skills/agentic-discovery.md
> Enrollment playbook: https://inflowcli.ai/skills/agentic-enrollment.md
> Payments playbook: https://inflowcli.ai/skills/agentic-payments.md
> Source: https://github.com/inflowpayai/inflow-cli

# inflow

InFlow - agentic discovery, onboarding, and payments from your machine.

| Command | Description |
|---------|-------------|
| `inflow aep enroll <serviceReference>` | Enroll with an AEP Service. |
| `inflow aep fetch <resourceUrl>` | Fetch a resource with AEP authentication when challenged. |
| `inflow aep grant <serviceReference>` | Request and store a Service credential. |
| `inflow aep inspect <serviceReference>` | Inspect an AEP Service without authentication. |
| `inflow aep revoke <serviceReference>` | Revoke Service credentials. |
| `inflow aep status <serviceReference>` | Get AEP Service lifecycle status. |
| `inflow auth login` | Authenticate with InFlow |
| `inflow auth logout` | Log out from InFlow |
| `inflow auth status` | Check authentication status |
| `inflow balances list` | List the authenticated user's balances |
| `inflow deposit-addresses list` | List the authenticated user's configured deposit addresses |
| `inflow inspect <url>` | Inspect a URL for agent discovery, enrollment, and payment capabilities |
| `inflow mpp cancel <approvalId>` | Best-effort cancel of an MPP approval. |
| `inflow mpp decode <value>` | Decode a raw WWW-Authenticate: Payment header, or a base64url credential / receipt. |
| `inflow mpp fetch <transactionId> <resourceUrl>` | Complete a ready or pending MPP payment and fetch the seller resource. |
| `inflow mpp inspect <url>` | Show the seller's MPP challenge(s) for a URL. Read-only probe - no auth, no payment. |
| `inflow mpp pay <url>` | Pay an MPP-protected resource and return the seller response. |
| `inflow mpp status <transactionId>` | Poll the buyer-side state of an in-flight MPP transaction. |
| `inflow mpp subscribe <url>` | Subscribe to an MPP-protected resource. Review and approve the recurring terms, then settle the first period. |
| `inflow mpp supported` | List the methods the buyer can pay with - by intent, settlement rail, and currency. |
| `inflow odp actions resolve <service> <offeringId> <actionId>` | Resolve an offering's action into an executable request without invoking it. |
| `inflow odp collections get <service> <id>` | Get full collection details. |
| `inflow odp collections list <service>` | List collections from a service. |
| `inflow odp collections search <service> [query]` | Search collections from a service. |
| `inflow odp directory search [query]` | Search the directory for services. |
| `inflow odp directory suggest <prefix>` | Suggest directory keywords. |
| `inflow odp inspect <service>` | Inspect a service's capabilities. |
| `inflow odp offerings capabilities <service>` | Resolve offering search filters and sorts. |
| `inflow odp offerings discover [query]` | Find offerings across services selected from the directory. |
| `inflow odp offerings get <service> <id>` | Get full offering details. |
| `inflow odp offerings list <service>` | List offerings from a service. |
| `inflow odp offerings search <service> [query]` | Search offerings from a service. |
| `inflow subscriptions cancel <subscriptionId>` | Cancel your subscription immediately. |
| `inflow subscriptions fetch <subscriptionId> <resourceUrl>` | Fetch a resource using your active subscription. |
| `inflow subscriptions get <subscriptionId>` | View your subscription details. |
| `inflow subscriptions list` | List your subscriptions. |
| `inflow vault change-passphrase` | Change the local vault PIN or passphrase. |
| `inflow vault lock` | Lock the local vault. |
| `inflow vault policy` | Show the local vault lock policy. |
| `inflow vault reset` | Remove the local vault database, sidecar, and runtime files. |
| `inflow vault set-policy` | Update the local vault lock policy. |
| `inflow vault status` | Show local vault status. |
| `inflow vault unlock` | Unlock or initialize the local vault. |
| `inflow x402 cancel <approvalId>` | Best-effort cancel of an x402 approval. |
| `inflow x402 decode <header>` | Decode a raw PAYMENT-REQUIRED header value. |
| `inflow x402 fetch <transactionId> <resourceUrl>` | Fetch an x402-protected resource for a signed or pending payment transaction. |
| `inflow x402 inspect <url>` | Show the seller's PAYMENT-REQUIRED accepts for a URL. Read-only probe - no auth, no payment. |
| `inflow x402 pay <url>` | Pay an x402-protected resource and return the seller response. |
| `inflow x402 status <transactionId>` | Poll the signing state of an in-flight x402 transaction. |
| `inflow x402 supported` | List the buyer-side capability cache (scheme x network). |

Run `inflow --llms-full` for full manifest. Run `inflow <command> --schema` for argument details.
