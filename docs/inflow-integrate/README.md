# InFlow B2AI Directory — Service integration handbook

Local mirror of the docs linked from [https://directory.inflowpay.ai/integrate/](https://directory.inflowpay.ai/integrate/), fetched **2026-09-15**, rewritten as a follow-along path for a seller/service engineer (this repo is an x402 gateway; treat InFlow as the directory + PSP + agent enrollment stack around it).

Every file in this folder has a `<!-- source: … -->` header. Live URLs win if they disagree with the snapshot.

---

## What you are building

Agents need three public surfaces on **one canonical HTTPS origin**:

| Layer | Protocol | Well-known | Job |
| --- | --- | --- | --- |
| Catalog | **ODP** (Offering Discovery Protocol) | `GET /.well-known/odp` → `application/odp+json` | Browse/search/inspect products and **resolve** purchase actions (do not execute them inside ODP) |
| Enrollment | **AEP** (Agent Enrollment Protocol) | `GET /.well-known/aep` | Enroll an agent identity, optional session credentials, auth for protected catalog/purchase routes |
| Payment | **x402** and/or **MPP** | (no well-known; live `402` on the purchase URL) | Protect the Action target. Directory: **either protocol satisfies**; both = more agent coverage |

Directory indexes **Service metadata**, not your catalog. After listing, agents still hit *your* origin for Offerings and Actions.

---

## Seven steps (directory publication path)

Complete once per Service origin.

### 1. InFlow Seller account + API key

- Sandbox: https://sandbox.inflowpay.ai
- Production: https://app.inflowpay.ai
- Seller register: https://app.inflowpay.ai/register/seller/

Seller SDKs (`@inflowpayai/x402-seller`, `@inflowpayai/mpp-seller`) require a **Seller** role. Sandbox keys do not work in production.

SDK egress (do not set `baseUrl` yourself):

| `environment` | Dashboard | API |
| --- | --- | --- |
| `sandbox` | `https://sandbox.inflowpay.ai` | `https://sandbox.inflowpay.ai` |
| `production` | `https://app.inflowpay.ai` | `https://api.inflowpay.ai` |

Read: [inflow-node/integration/seller-quickstart.md](inflow-node/integration/seller-quickstart.md), [inflow-node/README.md](inflow-node/README.md).

Public InFlow HTTP API (OpenAPI snapshot) is currently **one** endpoint: `POST /v1/users/agentic` (create agentic buyer user + private key). Seller payment APIs are consumed via the Node SDKs, not that OpenAPI. See [inflow/openapi/production.md](inflow/openapi/production.md).

### 2. ODP catalog (`/.well-known/odp`)

**Must implement:** `list-offerings` and `get-offering`. Advertise only operations you actually ship.

**npm (this stack is Node/Bun):**

```sh
npm install @offering-protocol/service   # you are the Service
# optional:
npm install @offering-protocol/agent @offering-protocol/directory @offering-protocol/core
```

Requires **Node 22+**. Official repo: https://github.com/offering-protocol/odp-node

Contract reminders:

- Successful top-level ODP bodies: `Content-Type` essence `application/odp+json`, body declares `odp_version`.
- Honor `Accept: application/odp+json` → else `406`.
- List/search = terse; get = Full. Identifiers opaque and stable.
- Failures = ODP Problem Details, not random JSON.
- HTTPS except localhost / `127.0.0.1` / `[::1]`.
- Action resolution describes `method` + `target`; **does not** invoke payment.

Read in this order:

1. [odp/documentation/quick-start/build-a-service.md](odp/documentation/quick-start/build-a-service.md)
2. [odp/documentation/guides/service-documents.md](odp/documentation/guides/service-documents.md)
3. [odp/documentation/guides/offerings.md](odp/documentation/guides/offerings.md)
4. [odp/documentation/guides/actions.md](odp/documentation/guides/actions.md)
5. [odp/documentation/guides/pricing-and-payments.md](odp/documentation/guides/pricing-and-payments.md) — price on the Offering is a **preview**; live `402` is authoritative
6. [odp/documentation/sdks/nodejs.md](odp/documentation/sdks/nodejs.md)
7. [odp/sdks/odp-service-package.md](odp/sdks/odp-service-package.md)
8. Working examples: [odp/sdks/example-odp-service-small.md](odp/sdks/example-odp-service-small.md), [odp/sdks/example-odp-service-x402.md](odp/sdks/example-odp-service-x402.md), [odp/sdks/example-odp-service-aep-mpp.md](odp/sdks/example-odp-service-aep-mpp.md)
9. Spec: [odp/ietf/draft-kavian-offering-discovery-protocol-01.md](odp/ietf/draft-kavian-offering-discovery-protocol-01.md)

Smoke:

```bash
curl --include -H 'Accept: application/odp+json' https://YOUR_ORIGIN/.well-known/odp
curl --include -H 'Accept: application/odp+json' https://YOUR_ORIGIN/odp/offerings
```

### 3. AEP enrollment (`/.well-known/aep`)

Agents enroll **before** hitting protected catalog/purchase routes. Typical sequence: Inspect → Enroll (`Authorization: AEP <jwt>`) → poll Status if `pending` → Grant for a session credential (api-key / basic / oauth-bearer) → present that credential only to **this** Service.

```sh
pnpm add @aep-foundation/service @aep-foundation/express express
# or hono/fastify/next adapters
```

Repo: https://github.com/aep-foundation/aep-node

Read:

1. [aep/guides/implementer-guide.md](aep/guides/implementer-guide.md)
2. [aep/sdks/aep-service-package.md](aep/sdks/aep-service-package.md)
3. [aep/sdks/example-aep-service-express.md](aep/sdks/example-aep-service-express.md)
4. Examples of wire transcripts: [aep/examples/](aep/examples/)
5. Core I-D: [aep/ietf/draft-kavian-agent-enrollment-protocol-04.md](aep/ietf/draft-kavian-agent-enrollment-protocol-04.md)

Grant-type drafts live under [aep/ietf/](aep/ietf/).

### 4. Payments (x402 and/or MPP)

Point every ODP purchase Action at a **protected** HTTP endpoint.

**InFlow-supported default: pick one protocol.** Dual-advertise on a single URL is documented as custom/unsupported: [inflow-node/integration/dual-protocol.md](inflow-node/integration/dual-protocol.md). Directory still says “either satisfies; both is nicer for agents” — that can mean **different Actions/endpoints**, not necessarily one `402` with both challenges.

| | x402 | MPP |
| --- | --- | --- |
| Package | `@inflowpayai/x402-seller` + `@x402/express` (etc.) | `@inflowpayai/mpp-seller` + `mppx` |
| Wire | `PAYMENT-REQUIRED` / `PAYMENT-SIGNATURE` | `WWW-Authenticate: Payment` / `Authorization: Payment` |
| Shape | Global middleware listing priced routes | Per-route `mppx.charge(...)` |
| Choose when | x402 ecosystem, on-chain exact, multiple facilitators | IETF Payment auth, InFlow-settled fiat/crypto rails |

This gateway already speaks x402; remaining work for directory listing is ODP + AEP + seller-account wiring so Actions resolve to existing paywalled routes.

Read:

- InFlow seller: [inflow-node/integration/seller-quickstart.md](inflow-node/integration/seller-quickstart.md), [inflow-node/integration/seller-reference.md](inflow-node/integration/seller-reference.md)
- x402 seller package: [inflow-node/packages/x402-seller.md](inflow-node/packages/x402-seller.md)
- MPP seller package: [inflow-node/packages/mpp-seller.md](inflow-node/packages/mpp-seller.md)
- Protocol: [x402/docs/getting-started/quickstart-for-sellers.md](x402/docs/getting-started/quickstart-for-sellers.md), [mpp/pages/guides/use-mpp-with-x402.md](mpp/pages/guides/use-mpp-with-x402.md), [mpp/pages/mpp-vs-x402.md](mpp/pages/mpp-vs-x402.md)
- Full MPP dump: [mpp/llms-full.md](mpp/llms-full.md) (~1MB)

### 5. Validate (same gate as publish)

Browser: https://directory.inflowpay.ai/validate/

Checks (does **not** call catalog ops, enroll, or pay):

- Canonical HTTPS origin (no path/query/fragment)
- ODP document + required ops + branding (icon/logo)
- Advertised AEP document
- Payment / trust declarations

Then **you** must exercise advertised ops:

```bash
inflow odp inspect https://YOUR_ORIGIN
inflow odp offerings list https://YOUR_ORIGIN
inflow odp offerings get https://YOUR_ORIGIN <id-from-list>
```

Full checklist: [odp/documentation/quick-start/validate-an-integration.md](odp/documentation/quick-start/validate-an-integration.md), [odp/documentation/tools/validator-and-conformance.md](odp/documentation/tools/validator-and-conformance.md).

### 6. Submit origin

Submit **origin only**: `https://api.example.com`  
Not `/.well-known/odp`, not a product URL.

Browser: https://directory.inflowpay.ai/publish/ (no InFlow account required)

API (public):

```bash
curl --request POST https://directory.inflowpay.ai/v1/services \
  --header 'Content-Type: application/json' \
  --data '{"origin":"https://api.example.com"}'
```

Success: **`202 Accepted`**

```json
{ "service_origin": "https://api.example.com" }
```

202 = passed submission checks and accepted for indexing. It does **not** prove every advertised catalog op works.

Details: [odp/documentation/quick-start/publish-to-directory.md](odp/documentation/quick-start/publish-to-directory.md), [odp/documentation/tools/directory.md](odp/documentation/tools/directory.md).

### 7. Inspect with InFlow CLI

```bash
curl -fsSL https://inflowcli.ai/install.sh | sh
inflow inspect https://YOUR_ORIGIN
```

Confirm output reports **ODP**, **AEP**, and the payment protocol(s) you advertise.

CLI skill + agent install: [inflow-cli/skill.md](inflow-cli/skill.md), [inflow-cli/llms-full.md](inflow-cli/llms-full.md), [inflow-cli/github-README.md](inflow-cli/github-README.md).

After listing: discoverable via directory search + CLI; agents still fetch live ODP/AEP from your origin.

---

## Suggested implementation order for *this* codebase

1. Map Mesh agents/tools → ODP Offerings + Full representations (ids = existing agent/tool ids).
2. Add `list-offerings` / `get-offering` (+ optional search) with `application/odp+json`.
3. Point Offering Actions at current x402 (and MPP if you keep Tempo) routes.
4. Add AEP inspect/enroll (api-key grant is the least painful session type).
5. Create InFlow **Seller** sandbox key; wire `@inflowpayai/x402-seller` if you want InFlow as facilitator instead of/in addition to current facilitator.
6. `inflow inspect` + directory validate + `POST /v1/services`.

Closest upstream samples:

- ODP + x402 Action: [odp/sdks/example-odp-service-x402.md](odp/sdks/example-odp-service-x402.md)
- ODP + AEP + MPP: [odp/sdks/example-odp-service-aep-mpp.md](odp/sdks/example-odp-service-aep-mpp.md)
- InFlow Express x402 seller: [inflow-node/examples/x402-seller-express.md](inflow-node/examples/x402-seller-express.md)

---

## Folder map

| Path | Contents |
| --- | --- |
| [directory/](directory/) | Integrate / validate / publish / homepage snapshots |
| [odp/documentation/](odp/documentation/) | Full ODP site docs (guides, protocol, SDKs, examples, tools) |
| [odp/ietf/](odp/ietf/) | ODP Internet-Draft |
| [odp/sdks/](odp/sdks/) | `@offering-protocol/*` READMEs + service examples |
| [aep/](aep/) | AEP site, implementer guide, I-Ds, examples, Node SDK |
| [inflow-node/](inflow-node/) | Official InFlow Node seller/buyer SDK docs |
| [inflow/](inflow/) | Product copy, org profile, OpenAPI |
| [inflow-cli/](inflow-cli/) | CLI install, skills, llms-full |
| [mpp/](mpp/) | mpp.dev guides + `llms-full` |
| [x402/docs/](x402/docs/) | docs.x402.org markdown (seller quickstart, schemes, extensions) |
| [_manifest.json](_manifest.json) | Harvest file list + fetch errors |

HTML→Markdown pages from offeringprotocol.org may still contain leftover “Docs Menu” chrome. Prefer IETF drafts + GitHub SDK READMEs when implementing.

---

## Live sources (re-fetch these)

- Integrate: https://directory.inflowpay.ai/integrate/
- ODP: https://www.offeringprotocol.org/documentation/
- AEP: https://www.aep.foundation/ + https://github.com/aep-foundation/aep-specs
- InFlow Node: https://github.com/inflowpayai/inflow-node
- CLI: https://inflowcli.ai/
- MPP: https://mpp.dev/llms-full.txt
- x402: https://docs.x402.org/llms.txt
- Directory org: https://github.com/inflowpayai/
