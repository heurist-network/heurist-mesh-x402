<!-- source: https://www.offeringprotocol.org/documentation/protocol/access-and-composition/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Follow access requirements at request time

Use ODP declarations to anticipate access requirements, then let each endpoint's live authentication and payment challenges control what happens next.

### Keep Service inspection public

Every Agent can retrieve GET /.well-known/odp without enrollment, authentication, or payment. This public entry point identifies the ODP operations the Service supports and the access expectation attached to each one.

The Service can enforce access policy on the catalog operations advertised by that document. Public inspection therefore tells an Agent how to begin without exposing protected Collections, Offerings, or Actions.

### Read each authentication declaration in context

ODP uses authentication metadata in three places. Each declaration applies only to the operation, Action, or payment protocol where it appears.

| Location | What it describes |
| --- | --- |
| Operation descriptor | Whether the named ODP catalog operation is anonymous, can expand after authentication, or requires authentication. |
| Offering Action | Whether invoking that specific subsequent operation is anonymous, can expand after authentication, or requires authentication. |
| Payment descriptor | Whether the Agent must authenticate to the Service before using the advertised payment protocol. |

Service-wide protocol advertisement describes supported enrollment, payment, and trust protocols. It does not override the access declaration on an operation or Action and does not guarantee that a protocol applies to every endpoint.

### Interpret operation authentication

| Value | Meaning |
| --- | --- |
| not-required | The operation is usable without Service authentication. |
| optional | The operation works anonymously, while acceptable authentication can expose additional content. |
| required | The operation must authenticate the Agent before it can succeed. |

An operation or Action using optional or required requires the Service Document to advertise an enrollment protocol. optional does not promise that every authenticated response differs; it declares that both contexts are supported and authentication can affect visible content.

### Interpret payment authentication separately

Each protocols.payments descriptor uses not-required or required. Here, authentication answers whether an Agent must authenticate to the Service before it can use that payment protocol. A required payment descriptor also requires an advertised enrollment protocol.

Payment support is not a payment demand

Advertising [MPP](https://mpp.dev/) or [x402](https://x402.org/) does not mean every ODP operation or Action requires payment. The live response to the selected request determines whether payment is required.

### Begin with the requested operation

An Agent starts by sending the requested ODP operation in its current authentication context. Protocol advertisement helps the Agent understand possible requirements, but it does not authorize enrollment, authentication, or payment before the endpoint asks for one.

A Price Preview, Action relation, schema annotation, or OpenAPI security declaration is also descriptive. None of these fields authorizes an Agent to enroll, authenticate, pay, or invoke an Action.

This preserves the simplest path. A public operation can succeed immediately, an authentication-only operation can request an AEP credential, and a payment-only operation can issue a payment challenge without requiring enrollment.

### Follow the live challenge

The response from the requested endpoint is authoritative for the protocol mechanics needed at that moment. ODP does not redefine these challenge formats.

| Protocol | Live signal |
| --- | --- |
| [AEP](https://www.aep.foundation/) | 401 Unauthorized with an AEP challenge in WWW-Authenticate. |
| [MPP](https://mpp.dev/) | 402 Payment Required with a Payment challenge in WWW-Authenticate. |
| [x402](https://x402.org/) | 402 Payment Required with payment requirements in PAYMENT-REQUIRED. |

A live challenge for a protocol omitted from the Service Document remains authoritative. Conversely, an advertised protocol without a corresponding live challenge must not cause an Agent to use that protocol speculatively.

### Authenticate before processing payment

When an ODP operation requires both Service authentication and payment, the Service must establish authentication first. A request without an acceptable AEP credential receives the AEP challenge even when it also lacks payment. Only the authenticated retry can produce the applicable payment challenge.

01

### Request the ODP operation

Send the operation in the Agent's current authentication context.

02

### Receive the AEP challenge

Complete enrollment or authentication under AEP, subject to caller approval.

03

### Retry with the Service credential

Preserve the operation while adding the accepted AEP credential.

04

### Receive and fulfill payment

Process the live MPP or x402 challenge only after authentication succeeds.

05

### Retry with both credentials

Send the Service credential and the payment protocol's proof on the authorized retry.

### Preserve both credential fields

When payment can follow AEP authentication, the Agent should place the Service credential in AEP's dedicated AEP-Authorization field. This leaves Authorization available for the MPP Payment credential.

For x402, the paid retry carries the AEP credential together with the PAYMENT-SIGNATURE field defined by x402. Each protocol remains responsible for its own credential syntax, request binding, replay protection, and validation.

### Support the path each operation needs

A Service declares Service-authentication expectations at the applicable operation or Action boundary. The requested endpoint's live response determines whether payment is required. Support for one composition path does not imply support for another ordering.

Public and free

#### Request and receive

The initial operation succeeds without an authentication or payment challenge.

Authentication only

#### Authenticate and retry

The Service issues an AEP challenge, then processes the authenticated retry.

Payment only

#### Pay and retry

The Service issues a live MPP or x402 challenge directly without requiring AEP.

Authenticated and paid

#### Authenticate, then pay

The Service establishes authentication before issuing and processing the payment challenge.

### Treat success as authoritative

A successful response means the request did not require another challenge at that point. It does not matter that the Service advertises enrollment or payment support elsewhere; the Agent accepts the successful result instead of initiating another protocol.

An Agent must not infer that ODP support implies support for AEP, MPP, x402, or another protocol. It also must not infer that a Service supporting authentication followed by payment supports payment followed by authentication.

### Expose protected discovery without leaking it

optional operations and auth\_expands: true let a Service disclose that authentication can expand the current result without describing the protected content itself. The signal does not promise access to a particular Agent or identify which fields or resources will appear.

A Service must not use identifiers, result totals, detail\_fields, refinement counts, errors, timing differences, or other metadata to reveal the nature or quantity of protected catalog content to an unauthorized principal.

### Isolate credentials by destination

An Agent applies origin and credential policy independently to every request. A link from one ODP resource does not authorize forwarding a Service credential, payment proof, cookie, caller authorization field, or enrollment artifact to its target.

payment\_origins identifies additional Service Origins that can issue payment challenges. An advertised origin does not prove control of that origin, authorize payment, or permit credentials to be copied to it.

- [Supporting metadata](https://www.offeringprotocol.org/documentation/protocol/security/): retrieve JSON Schemas and OpenAPI documents anonymously without copied credentials
- [Cross-origin Actions](https://www.offeringprotocol.org/documentation/guides/actions/): begin without credentials belonging to the Offering Service and follow the target origin's live requirements
- [MCP endpoints](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations): treat each descriptor as a connection location, not a tool inventory or authorization grant, and do not inherit credentials from the referring request
- [Redirects](https://www.offeringprotocol.org/documentation/protocol/security/): strip sensitive fields before any separately authorized request begins

### Retain each protocol's safety rules

Every challenge-response retry remains subject to the credential handling, exact request binding, redirect, replay, and error rules of the protocol that caused it. Composition does not weaken caller approval, spend limits, accepted assets, destination policy, or other Agent controls.

If an authoritative payment amount or settlement choice differs from discovery metadata, the Agent presents the live requirement to its policy layer. It must not silently rely on a Price Preview or other descriptive advertisement.

### Keep composed access predictable

- [Inspect](#public-inspection): serve the Service Document publicly and read only the operations it advertises
- [Request](#initial-request): begin the selected operation in the current authentication context
- [Challenge](#live-challenges): let the endpoint's live AEP, MPP, or x402 signal determine the next protocol step
- [Order](#authentication-before-payment): establish required Service authentication before processing payment
- [Isolate](#credential-isolation): apply destination policy independently and never copy credentials merely because ODP links to a resource

### Next steps

Request safety

### Secure every destination

Apply network, redirect, credential, and untrusted-content protections across ODP resources.

[Security](https://www.offeringprotocol.org/documentation/protocol/security/)

Payment boundary

### Compare preview and enforcement

Distinguish discovery-time pricing from the live payment challenge.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

On this page

- [Public inspection](#public-inspection)
- [Authentication declarations](#access-boundaries)
- [Operation authentication](#operation-authentication)
- [Payment authentication](#payment-authentication)
- [Initial request](#initial-request)
- [Live challenges](#live-challenges)
- [Authentication before payment](#authentication-before-payment)
- [Credential fields](#credential-fields)
- [Supported paths](#supported-paths)
- [Authoritative success](#authoritative-success)
- [Protected discovery](#protected-discovery)
- [Credential isolation](#credential-isolation)
- [Protocol safety](#protocol-safety)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
