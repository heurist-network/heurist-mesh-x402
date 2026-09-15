<!-- source: https://inflowcli.ai/llms-full.txt -->
<!-- fetched: 2026-09-15 -->

# InFlow CLI

> Offering discovery, Agent Enrollment Protocol access, and MPP / x402 payments from your machine.
> Agent setup: https://inflowcli.ai/skill.md
> Discovery playbook: https://inflowcli.ai/skills/agentic-discovery.md
> Enrollment playbook: https://inflowcli.ai/skills/agentic-enrollment.md
> Payments playbook: https://inflowcli.ai/skills/agentic-payments.md
> Source: https://github.com/inflowpayai/inflow-cli

# inflow

## inflow aep

Agent Enrollment Protocol service commands

### inflow aep enroll

Enroll with an AEP Service.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `serviceReference` | `string` | yes | AEP Service URL, host, protected resource URL, or did:web Service reference. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--approvalId` | `string` |  | Continue an enrollment approval returned by a previous enroll call. |
| `--interval` | `number` |  | Approval polling cadence in seconds. Must be positive when supplied. |
| `--maxAttempts` | `number` | `0` | Maximum approval poll attempts. 0 means unlimited. |
| `--timeout` | `number` | `900` | Approval polling deadline in seconds. Maximum 900 seconds. |

### inflow aep fetch

Fetch a resource with AEP authentication when challenged.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `resourceUrl` | `string` | yes | The AEP-protected resource URL to fetch. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--credentialId` | `string` |  | Use this stored credential identifier. |
| `--grantType` | `string` |  | Use or request this advertised session credential type. |
| `--method` | `string` | `GET` | HTTP method for the resource request. |
| `--data` | `string` |  | Replayable JSON or text request body. |
| `--header` | `array` |  | Repeatable request header in "Name: Value" format. |
| `--interval` | `number` |  | Approval polling cadence in seconds. |
| `--timeout` | `number` | `900` | Total request and approval deadline in seconds. |
| `--maxRedirects` | `number` | `5` | Maximum redirect count. |
| `--maxResponseBytes` | `number` | `16777216` | Maximum response body size in bytes. |
| `--showBody` | `boolean` | `true` | Include a text or base64 response body in structured output. |
| `--outputFile` | `string` |  | Write response bytes to this path instead of returning them inline. |

### inflow aep grant

Request and store a Service credential.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `serviceReference` | `string` | yes | AEP Service URL, host, protected resource URL, or did:web Service reference. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--approvalId` | `string` |  | Continue a grant approval returned by a previous grant call. |
| `--grantType` | `string` |  | Session credential type. Defaults to the first advertised type shown in Inspect output. |
| `--scope` | `array` |  | Repeatable requested scope. |
| `--interval` | `number` |  | Approval polling cadence in seconds. Must be positive when supplied. |
| `--timeout` | `number` | `900` | Approval polling deadline in seconds. Maximum 900 seconds. |

### inflow aep inspect

Inspect an AEP Service without authentication.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `serviceReference` | `string` | yes | AEP Service URL, host, protected resource URL, or did:web Service reference. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--method` | `string` | `GET` | HTTP method for the exact resource probe. |
| `--data` | `string` |  | Replayable JSON or text body for the exact resource probe. |
| `--header` | `array` |  | Repeatable probe header in "Name: Value" format. |
| `--timeout` | `number` | `30` | Total Inspect deadline in seconds. Maximum 300 seconds. |

### inflow aep revoke

Revoke Service credentials.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `serviceReference` | `string` | yes | AEP Service URL, host, protected resource URL, or did:web Service reference. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--credentialId` | `string` |  | Revoke one credential by identifier. |
| `--grantType` | `string` |  | Revoke credentials for one advertised grant type. |

> Confirm with the user before executing this destructive command.

### inflow aep status

Get AEP Service lifecycle status.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `serviceReference` | `string` | yes | AEP Service URL, host, protected resource URL, or did:web Service reference. |

## inflow auth

Authentication commands

### inflow auth login

Authenticate with InFlow

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--clientName` | `string` | `InFlow` | Agent or app name shown to the user during device authorization. |
| `--interval` | `number` | `0` | Inline poll cadence in seconds. 0 returns immediately with the verification URL and a follow-up command hint; positive values poll until the device flow terminates. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts. 0 means unlimited (bounded only by --timeout). |
| `--timeout` | `number` | `300` | Polling deadline in seconds. |

### inflow auth logout

Log out from InFlow

> Confirm with the user before executing this destructive command.

### inflow auth status

Check authentication status

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--interval` | `number` | `0` | Poll cadence in seconds. 0 returns the current snapshot; positive values yield on every change until terminal. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts. 0 means unlimited (bounded only by --timeout). |
| `--timeout` | `number` | `300` | Polling deadline in seconds. |
| `--probe` | `boolean` | `false` | Validate the local access token by calling GET /v1/users/self. |

## inflow balances

Balance commands

### inflow balances list

List the authenticated user's balances

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


## inflow deposit-addresses

Deposit-address commands

### inflow deposit-addresses list

List the authenticated user's configured deposit addresses

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


## inflow inspect

### inflow inspect

Inspect a URL for agent discovery, enrollment, and payment capabilities

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The resource URL to inspect for ODP, AEP, MPP, and x402. No enrollment or payment is performed. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--method` | `string` | `GET` | HTTP method for the probe request. |
| `--data` | `string` |  | Request body for the probe. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |

#### Examples

```sh
# Probe a URL and show its ODP, AEP, MPP, and x402 capabilities and requirements.
inflow inspect https://api.foo.dev/dataset.csv

# Probe a POST-only paywalled endpoint.
inflow inspect https://api.foo.dev/widgets --method POST --data {"sku":"widget-1"}
```

## inflow mpp

Machine Payments Protocol payment commands

### inflow mpp cancel

Best-effort cancel of an MPP approval.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `approvalId` | `string` | yes | The approval id returned by `mpp pay` (on the pending frame). |

> Confirm with the user before executing this destructive command.

### inflow mpp decode

Decode a raw WWW-Authenticate: Payment header, or a base64url credential / receipt.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | yes | A raw `WWW-Authenticate: Payment` header value, or a base64url `Authorization: Payment` credential / `Payment-Receipt`. The kind is auto-detected. |

### inflow mpp fetch

Complete a ready or pending MPP payment and fetch the seller resource.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionId` | `string` | yes | The transaction id returned by `mpp pay` or a pending `mpp subscribe` operation. |
| `resourceUrl` | `string` | yes | The MPP-protected resource URL to fetch. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Poll cadence in seconds while waiting for the transaction to become ready. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Pass --no-show-body to suppress inline body output. |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path. When set, the result frame includes `output_saved_to` instead of `body` / `body_base64`. |

### inflow mpp inspect

Show the seller's MPP challenge(s) for a URL. Read-only probe - no auth, no payment.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The MPP-protected resource URL to probe. No payment is made. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--paymentMethod` | `string` |  | Only show challenges with this payment method (e.g. "inflow"). |
| `--intent` | `string` |  | Only show challenges with this intent (e.g. "charge"). |
| `--currency` | `string` |  | Only show challenges in this currency (e.g. "USDC"). |
| `--rail` | `string` |  | Only show challenges on this settlement rail (e.g. "balance", "instrument"). |
| `--method` | `string` | `GET` | HTTP method for the probe request. |
| `--data` | `string` |  | Request body for the probe. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |

### inflow mpp pay

Pay an MPP-protected resource and return the seller response.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The MPP-protected resource URL to pay for. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--paymentMethod` | `string` |  | Only consider challenges with this payment method (e.g. "inflow"). |
| `--intent` | `string` |  | Only consider challenges with this intent (e.g. "charge"). |
| `--currency` | `string` |  | Only consider challenges in this currency (e.g. "USDC"). |
| `--rail` | `string` |  | Only consider challenges on this settlement rail (e.g. "balance", "instrument"). |
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Inline poll cadence in seconds while a transaction is pending. 0 returns the transaction id and a follow-up command hint without blocking. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. Default 900s (matches the server-side approval expiry). |
| `--instrumentId` | `string` |  | Funding instrument id (UUID) for an instrument-rail challenge. The buyer does not choose the rail - it is derived from the seller challenge; this is the only buyer-supplied payment option. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Default true so AI assistants paying for content receive the deliverable. Pass --no-show-body to suppress (e.g. for binary downloads paired with --output-file). |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path (overwrites silently). When set, the result frame includes `output_saved_to: <absolute_path>` instead of `body` / `body_base64`. Natural choice for binary content (PDFs, images, downloads). |
| `--credentialFile` | `string` |  | Write the base64url `Authorization: Payment` credential to this file path (mode 0o600, overwrites silently). When set, the result frame includes `credential_saved_to: <absolute_path>` instead of `credential`. |

> Confirm with the user before executing this destructive command.

### inflow mpp status

Poll the buyer-side state of an in-flight MPP transaction.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionId` | `string` | yes | The transaction id returned by `mpp pay`. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--interval` | `number` | `0` | Poll cadence in seconds. 0 returns the current snapshot; positive values yield on every change until ready or terminal. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. |
| `--credentialFile` | `string` |  | Write the base64url `Authorization: Payment` credential to this file path (mode 0o600, overwrites silently). When set, the ready frame includes `credential_saved_to: <absolute_path>` instead of `credential`. |

### inflow mpp subscribe

Subscribe to an MPP-protected resource. Review and approve the recurring terms, then settle the first period.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The MPP-protected resource URL to subscribe to. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--optionId` | `string` |  | Subscription option ID or full fingerprint from `mpp inspect` or `inspect`. Required when multiple options are available. |
| `--paymentMethod` | `string` |  | Only consider challenges with this payment method (e.g. "inflow"). |
| `--currency` | `string` |  | Only consider challenges in this currency (e.g. "USDC"). |
| `--rail` | `string` |  | Only consider challenges on this settlement rail (e.g. "balance", "instrument"). |
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Inline poll cadence in seconds while a transaction is pending. 0 returns the transaction id and a follow-up command hint without blocking. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. Default 900s (matches the server-side approval expiry). |
| `--instrumentId` | `string` |  | Funding instrument id (UUID) for an instrument-rail challenge. The buyer does not choose the rail - it is derived from the seller challenge; this is the only buyer-supplied payment option. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Default true so AI assistants paying for content receive the deliverable. Pass --no-show-body to suppress (e.g. for binary downloads paired with --output-file). |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path (overwrites silently). When set, the result frame includes `output_saved_to: <absolute_path>` instead of `body` / `body_base64`. Natural choice for binary content (PDFs, images, downloads). |
| `--credentialFile` | `string` |  | Write the base64url `Authorization: Payment` credential to this file path (mode 0o600, overwrites silently). When set, the result frame includes `credential_saved_to: <absolute_path>` instead of `credential`. |

> Confirm with the user before executing this destructive command.

### inflow mpp supported

List the methods the buyer can pay with - by intent, settlement rail, and currency.

## inflow odp

Offering Discovery Protocol commands

### inflow odp actions resolve

Resolve an offering's action into an executable request without invoking it.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |
| `offeringId` | `string` | yes | Offering identifier. |
| `actionId` | `string` | yes | Action identifier from the full Offering. |

### inflow odp collections get

Get full collection details.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |
| `id` | `string` | yes | Collection identifier. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |

### inflow odp collections list

List collections from a service.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |
| `--limit` | `number` |  | Maximum Collections requested in this page. |
| `--next` | `string` |  | Opaque continuation URL from an earlier Collection response. |

### inflow odp collections search

Search collections from a service.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |
| `query` | `string` | no | Optional free-text Collection query. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |
| `--limit` | `number` |  | Maximum Collections requested in this page. |
| `--next` | `string` |  | Opaque continuation URL from an earlier Collection search response. |
| `--parentId` | `string` |  | Restrict results to direct children of this Collection identifier. |

### inflow odp directory search

Search the directory for services.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | no | Optional free-text Service query. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--keyword` | `array` |  | Repeatable Service keyword filter. |
| `--limit` | `number` |  | Maximum Services requested in this page. |
| `--next` | `string` |  | Opaque continuation URL from an earlier directory response. |
| `--enrollment` | `array` |  | Repeatable enrollment protocol filter. |
| `--operation` | `array` |  | Repeatable ODP operation filter. |
| `--payment` | `array` |  | Repeatable payment filter in protocol or protocol:option form. |

### inflow odp directory suggest

Suggest directory keywords.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prefix` | `string` | yes | Keyword prefix to complete. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--limit` | `number` |  | Maximum suggestions to return. |

### inflow odp inspect

Inspect a service's capabilities.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |

### inflow odp offerings capabilities

Resolve offering search filters and sorts.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |
| `--collectionId` | `string` |  | Resolve capabilities for this Collection. |

### inflow odp offerings discover

Find offerings across services selected from the directory.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | no | Optional free-text Offering query sent to each selected Service. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--collectionId` | `string` |  | Restrict Offering discovery to this Collection identifier. |
| `--concurrency` | `number` |  | Maximum concurrent Service searches. |
| `--filter` | `array` |  | Repeatable JSON-encoded ODP filter expression. |
| `--includeDescendants` | `boolean` |  | Include descendant Collections in Offering searches. |
| `--keyword` | `array` |  | Repeatable directory Service keyword filter. |
| `--maxOfferingsPerService` | `number` |  | Maximum Offerings per Service. |
| `--maxServices` | `number` |  | Maximum Services queried. |
| `--enrollment` | `array` |  | Repeatable directory enrollment protocol filter. |
| `--operation` | `array` |  | Repeatable directory ODP operation filter; inferred from the Offering request when omitted. |
| `--payment` | `array` |  | Repeatable directory payment filter in protocol or protocol:option form. |
| `--refinement` | `array` |  | Repeatable filter identifier to refine. |
| `--serviceQuery` | `string` |  | Free-text query used only to select Services from the directory. |
| `--sort` | `string` |  | Advertised sort identifier sent to each selected Service. |

### inflow odp offerings get

Get full offering details.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |
| `id` | `string` | yes | Offering identifier. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |

### inflow odp offerings list

List offerings from a service.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |
| `--collectionId` | `string` |  | List Offerings from this Collection. |
| `--limit` | `number` |  | Maximum Offerings requested in this page. |
| `--next` | `string` |  | Opaque continuation URL from an earlier Offering response. |

### inflow odp offerings search

Search offerings from a service.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service` | `string` | yes | ODP Service URL or origin. |
| `query` | `string` | no | Optional free-text Offering query. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--language` | `string` |  | Preferred response language sent through Accept-Language. |
| `--collectionId` | `string` |  | Restrict results to this Collection. |
| `--filter` | `array` |  | Repeatable JSON-encoded ODP filter expression. |
| `--includeDescendants` | `boolean` |  | Include descendant Collections in the search. |
| `--limit` | `number` |  | Maximum Offerings requested in this page. |
| `--next` | `string` |  | Opaque continuation URL from an earlier Offering search response. |
| `--refinement` | `array` |  | Repeatable filter identifier to refine. |
| `--sort` | `string` |  | Advertised sort identifier. |

## inflow subscriptions

Subscription management commands

### inflow subscriptions cancel

Cancel your subscription immediately.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriptionId` | `string` | yes | The subscription UUID. |

> Confirm with the user before executing this destructive command.

### inflow subscriptions fetch

Fetch a resource using your active subscription.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriptionId` | `string` | yes | The subscription UUID. |
| `resourceUrl` | `string` | yes | The MPP-protected resource URL to fetch. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Poll cadence in seconds while waiting for the transaction to become ready. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Pass --no-show-body to suppress inline body output. |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path. When set, the result frame includes `output_saved_to` instead of `body` / `body_base64`. |

> Confirm with the user before executing this destructive command.

### inflow subscriptions get

View your subscription details.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriptionId` | `string` | yes | The subscription UUID. |

### inflow subscriptions list

List your subscriptions.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--offset` | `number` | `0` | Number of subscriptions to skip. |
| `--limit` | `number` | `10` | Maximum subscriptions to return. |
| `--descending` | `boolean` | `true` | Sort newest first. |
| `--startDate` | `string` |  | Include subscriptions created on or after this RFC 3339 timestamp. |
| `--endDate` | `string` |  | Include subscriptions created on or before this RFC 3339 timestamp. |
| `--status` | `string` |  | Only include subscriptions with status active, cancelled, expired, failed, past_due, pending, or revoked. |

## inflow vault

Local credential vault commands

### inflow vault change-passphrase

Change the local vault PIN or passphrase.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


> Confirm with the user before executing this destructive command.

### inflow vault lock

Lock the local vault.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


### inflow vault policy

Show the local vault lock policy.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


### inflow vault reset

Remove the local vault database, sidecar, and runtime files.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--force` | `boolean` | `false` | Confirm deletion of the local vault database, sidecar, and runtime files. |

> Confirm with the user before executing this destructive command.

### inflow vault set-policy

Update the local vault lock policy.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--idleTimeoutSeconds` | `number` |  | Lock the vault after this many idle seconds. 0 disables the idle timeout. |
| `--lockOnSleep` | `boolean` |  | Lock the vault when the computer sleeps. |

### inflow vault status

Show local vault status.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


### inflow vault unlock

Unlock or initialize the local vault.

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|


## inflow x402

x402 Protocol payment commands

### inflow x402 cancel

Best-effort cancel of an x402 approval.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `approvalId` | `string` | yes | The approval id returned by `x402 pay`. |

> Confirm with the user before executing this destructive command.

### inflow x402 decode

Decode a raw PAYMENT-REQUIRED header value.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `header` | `string` | yes | Raw PAYMENT-REQUIRED header value (base64). |

### inflow x402 fetch

Fetch an x402-protected resource for a signed or pending payment transaction.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionId` | `string` | yes | The transaction id returned by `x402 pay`. |
| `resourceUrl` | `string` | yes | The x402-protected resource URL to fetch. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Poll cadence in seconds while waiting for the transaction to become signed. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Pass --no-show-body to suppress inline body output. |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path. When set, the result frame includes `output_saved_to` instead of `body` / `body_base64`. |

### inflow x402 inspect

Show the seller's PAYMENT-REQUIRED accepts for a URL. Read-only probe - no auth, no payment.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The x402-protected resource URL to probe. No payment is made. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--scheme` | `string` |  | Only show `accepts[]` entries with this scheme (e.g. "exact", "balance"). |
| `--network` | `string` |  | Only show entries on this network (e.g. "eip155:84532"). |
| `--asset` | `string` |  | Only show entries with this on-chain asset id (ERC-20 address or SVM mint). |
| `--assetName` | `string` |  | Only show entries whose `extra.assetName` symbol matches (e.g. "USDC"). |
| `--method` | `string` | `GET` | HTTP method for the probe request. |
| `--data` | `string` |  | Request body for the probe. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |

### inflow x402 pay

Pay an x402-protected resource and return the seller response.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | yes | The x402-protected resource URL to pay for. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--scheme` | `string` |  | Only consider `accepts[]` entries with this scheme (e.g. "exact", "balance"). |
| `--network` | `string` |  | Only consider entries on this network (e.g. "eip155:84532"). |
| `--asset` | `string` |  | Only consider entries with this on-chain asset id (ERC-20 address or SVM mint). |
| `--assetName` | `string` |  | Only consider entries whose `extra.assetName` symbol matches (e.g. "USDC"). |
| `--method` | `string` | `GET` | HTTP method for the seller request. |
| `--data` | `string` |  | Request body. JSON or raw text. Content-Type defaults to application/json when --data is set unless a --header overrides it. |
| `--header` | `array` |  | Repeatable. "Name: Value" format. |
| `--interval` | `number` | `0` | Inline poll cadence in seconds while awaiting approval. 0 returns the approval URL and a follow-up command hint without blocking. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts when --interval > 0. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. Default 900s (matches x402-buyer). |
| `--paymentId` | `string` |  | Caller-supplied payment identifier. 16-128 chars, ^[a-zA-Z0-9_-]+$. Forwarded to the server as remotePaymentId. |
| `--showBody` | `boolean` | `true` | Include the seller response body in the result. Default true so AI assistants paying for content receive the deliverable. Pass --no-show-body to suppress (e.g. for binary downloads paired with --output-file). |
| `--outputFile` | `string` |  | Write the seller response body bytes to this file path (overwrites silently). When set, the result frame includes `output_saved_to: <absolute_path>` instead of `body` / `body_base64`. Natural choice for binary content (PDFs, images, downloads). |
| `--payloadFile` | `string` |  | Write the signed `encoded_payload` bytes to this file path (mode 0o600, overwrites silently). When set, the result frame includes `payload_saved_to: <absolute_path>` instead of `encoded_payload`. Use to keep one-time payment credentials out of chat transcripts and logs. |

> Confirm with the user before executing this destructive command.

### inflow x402 status

Poll the signing state of an in-flight x402 transaction.

#### Arguments

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transactionId` | `string` | yes | The transaction id returned by `x402 pay`. |

#### Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--interval` | `number` | `0` | Poll cadence in seconds. 0 returns the current snapshot; positive values yield on every change until signed or terminal. |
| `--maxAttempts` | `number` | `0` | Hard cap on poll attempts. 0 means unlimited. |
| `--timeout` | `number` | `900` | Polling deadline in seconds. |
| `--payloadFile` | `string` |  | Write the signed `encoded_payload` bytes to this file path (mode 0o600, overwrites silently). When set, status frames include `payload_saved_to: <absolute_path>` instead of `encoded_payload`. Use to keep one-time payment credentials out of chat transcripts and logs. |

### inflow x402 supported

List the buyer-side capability cache (scheme x network).
