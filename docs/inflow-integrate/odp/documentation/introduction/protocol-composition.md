<!-- source: https://www.offeringprotocol.org/documentation/introduction/protocol-composition/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Introduction

# Compose discovery with enrollment and payment

ODP describes what is available. Related protocols and integration surfaces define enrollment, access, trust, payment, tools, and execution.

### Division of responsibility

An Agent can encounter several protocols and integration surfaces after discovery. Each one answers a different question and remains authoritative for the behavior it defines.

| Protocol or integration surface | Answers |
| --- | --- |
| [ODP](https://www.offeringprotocol.org/) | What does this Service offer, and which discovery operations are available? |
| [AEP](https://www.aep.foundation/) | How does an Agent enroll and obtain reusable Service credentials? |
| [MPP](https://mpp.dev/) or [x402](https://x402.org/) | What payment does the live request require? |
| TAP | Which trust mechanism can the Service accept and verify? |
| ODP Action | Which subsequent operation is available, and is its request described with compact HTTP metadata or OpenAPI? |
| MCP | Which MCP endpoints does the Service expose? |

The table deliberately includes more than protocols. An ODP Action describes a subsequent operation, MCP exposes a separate tool-oriented integration surface, and the target application executes the selected operation. ODP advertises these relationships without taking authority from the mechanism that defines each exchange.

### Three layers working together

A protected, paid operation can combine three steps: discover it with ODP, obtain Service access with AEP, and satisfy its live payment requirement.

01

### Discover with [ODP](https://www.offeringprotocol.org/)

Find the relevant Service and Offering, then identify an advertised Action.

02

### Enroll when access requires it

[AEP](https://www.aep.foundation/) lets the Agent obtain a reusable credential for the Service.

03

### Pay when the live operation requires it

[MPP](https://mpp.dev/) or [x402](https://x402.org/) carries the payment challenge, credential, and result.

### Receive the Service-defined result

The Action target remains authoritative for the operation and its response.

Composition is optional

A public, free Offering can use ODP without enrollment or payment. A Service combines the protocols only when an operation requires authenticated access, payment, or both.

### Advertisement versus enforcement

ODP provides advance signals, while the endpoint handling a request enforces its current requirements.

#### [Service support](https://www.offeringprotocol.org/documentation/guides/service-documents/)

The Service Document advertises Service-wide enrollment, payment, and trust support.

#### [Expected access](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

An ODP operation or Action describes whether Service authentication is expected.

#### [Live enforcement](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

The response from the requested endpoint remains authoritative for authentication and payment.

Advertising [MPP](https://mpp.dev/) or [x402](https://x402.org/) does not mean every endpoint requires payment. An Offering's Price Preview also does not replace a live payment challenge.

### Enrollment

Advertising [AEP](https://www.aep.foundation/) tells an Agent that the Service supports Agent enrollment.

The enrollment protocol independently defines Agent identity, enrollment, approval, credential grants, credential status, and revocation. ODP neither reproduces its Service Document nor selects a credential grant type.

### Payments

A Service can advertise [MPP](https://mpp.dev/), [x402](https://x402.org/), or both through [protocols.payments](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations). It can also describe its preference, whether Service authentication is required first, and human-consumable compatibility options such as InFlow, Solana, Base, or Tempo.

These are discovery signals. The payment protocol remains authoritative for the actual method, network, asset, amount, and settlement requirements. See [Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/) for the boundary between an ODP Price Preview and live payment enforcement.

### Trust protocols

A Service can advertise support for Visa Trusted Agent Protocol (TAP). This tells Agents that the Service can process TAP signals where they apply.

The advertisement does not prove Service ownership, authorize disclosure of consumer information, or replace TAP's request validation.

### MCP and OpenAPI

A Service can advertise remote MCP Streamable HTTP endpoints through the Service Document's [mcp](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations) array. MCP defines its tools, resources, prompts, authorization, and version negotiation. An MCP endpoint is not an ODP operation or Action.

An Action can use OpenAPI 3.1 when it needs a complete interface description. The Service Document can locate a default document through [http.openapi](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations), while an Action can override it. OpenAPI enriches the Action but is not required for basic ODP navigation or for expressing ODP authentication and payment semantics.

Discovery is not authorization

Discovering an MCP or OpenAPI reference does not authorize an Agent to call it or forward credentials obtained for another endpoint.

### Common compositions

The following patterns illustrate common paths rather than an exhaustive list. A Service combines only the access and payment steps required by the selected Action and its live response.

Public and free

#### Discover and invoke

[ODP](https://www.offeringprotocol.org/) discovery → Action invocation

Authenticated

#### Enroll, then invoke

[ODP](https://www.offeringprotocol.org/) discovery → [AEP](https://www.aep.foundation/) credential → Action invocation

Public and paid

#### Request, then pay

[ODP](https://www.offeringprotocol.org/) discovery → Action request → [MPP](https://mpp.dev/) or [x402](https://x402.org/) challenge → paid retry

Authenticated and paid

#### Enroll, request, and pay

[ODP](https://www.offeringprotocol.org/) discovery → [AEP](https://www.aep.foundation/) credential → Action request → [MPP](https://mpp.dev/) or [x402](https://x402.org/) challenge → paid retry

### Next steps

Boundaries

### Apply access requirements

Understand authentication, credential, and live-enforcement boundaries.

[Access and composition](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

Quick start

### Build a composed Service

Begin with the minimum ODP surface, then add only the protocols the Service needs.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Division of responsibility](#responsibilities)
- [Three layers working together](#three-layers)
- [Advertisement versus enforcement](#advertisement-and-enforcement)
- [Enrollment](#enrollment)
- [Payments](#payments)
- [Trust protocols](#trust)
- [MCP and OpenAPI](#mcp-and-openapi)
- [Common compositions](#common-compositions)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
