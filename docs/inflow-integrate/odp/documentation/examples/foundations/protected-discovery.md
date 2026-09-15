<!-- source: https://www.offeringprotocol.org/documentation/examples/foundations/protected-discovery/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Protected discovery

Follow a catalog request that requires AEP authentication before the Service presents an MPP or x402 payment challenge. ODP advertises the supported protocols, while each live HTTP response determines the next step for the request being made.

### What the Service advertises

The example Service Document declares authentication required for all three advertised Offering operations. It advertises [AEP](https://agentenrollment.com/) for enrollment and identifies two supported payment protocols in preference order. These declarations prepare an Agent for likely access requirements; they do not replace a live challenge.

| Area | Advertised value | Meaning |
| --- | --- | --- |
| Enrollment | aep | The Service supports AEP enrollment. |
| Operations | get-offering, list-offerings, search-offerings | Each operation declares authentication: required. |
| First payment choice | mpp, authentication: required, with inflow and tempo | Authenticate first. MPP is the Service's preferred advertised payment protocol. |
| Second payment choice | x402, authentication: required, with base | Authenticate first. x402 is the Service's alternate advertised payment protocol. |

Payment-option names are human-readable compatibility labels. They do not define the exact method, network, asset, amount, or settlement terms; the selected payment protocol supplies those details in its live challenge.

### Begin with the requested operation

The Agent starts by calling the ODP operation the caller selected in its current authentication context. It does not enroll or pay solely because the Service Document advertises those protocols. For this protected Service, a request without acceptable AEP credentials receives an AEP challenge.

12345

```
GET /odp/offerings HTTP/1.1
Host: catalog.example

HTTP/1.1 401 Unauthorized
WWW-Authenticate: AEP service_did="did:web:catalog.example", inspect="https://catalog.example/.well-known/aep"
```

The 401 response identifies the Service DID and its AEP inspection document. The Agent follows the AEP flow, obtains an acceptable credential, and retries the same ODP operation. A public operation could instead return its ODP representation immediately, and a payment-only operation could return a 402 response without AEP.

### Authenticate before paying

When an operation requires both authentication and payment, the Service authenticates the Agent first. This example assumes the AEP Inspect document advertises aep-jwt for protected-resource authentication. A Service that advertises a session credential method uses that method's defined credential presentation instead.

For [MPP](https://mpp.dev/), the Agent carries its AEP assertion in AEP-Authorization so Authorization remains available for the MPP payment credential. The authenticated request receives a complete Payment challenge in WWW-Authenticate:

1234567

```
GET /odp/offerings HTTP/1.1
Host: catalog.example
AEP-Authorization: AEP <client-assertion>

HTTP/1.1 402 Payment Required
Cache-Control: no-store
WWW-Authenticate: Payment id="qB3wErTyU7iOpAsD9fGhJk", realm="catalog.example", method="inflow", intent="charge", request="eyJhbW91bnQiOiIxMC41IiwiY3VycmVuY3kiOiJVU0RDIiwibWV0aG9kRGV0YWlscyI6eyJyYWlsIjoiYmFsYW5jZSJ9LCJyZWNpcGllbnQiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEifQ"
```

After the caller approves payment, the Agent retries with the MPP credential and a newly generated AEP JWT assertion. The new assertion needs its own jti and must be bound to this protected-resource request; an assertion accepted on the challenge request cannot be replayed. The successful response includes the recommended Payment-Receipt.

123456789

```
GET /odp/offerings HTTP/1.1
Host: catalog.example
AEP-Authorization: AEP <new-client-assertion>
Authorization: Payment <payment-credential>

HTTP/1.1 200 OK
Cache-Control: private
Payment-Receipt: <MPP payment receipt>
Content-Type: application/odp+json
```

For [x402](https://www.x402.org/), the authenticated request receives encoded payment requirements in PAYMENT-REQUIRED:

1234567

```
GET /odp/offerings HTTP/1.1
Host: catalog.example
AEP-Authorization: AEP <client-assertion>

HTTP/1.1 402 Payment Required
Cache-Control: no-store
PAYMENT-REQUIRED: <x402 payment requirements>
```

After the caller approves payment, the Agent retries with the x402 payment proof and another newly generated, request-bound AEP JWT assertion. A successful x402 response includes the encoded settlement result in PAYMENT-RESPONSE.

123456789

```
GET /odp/offerings HTTP/1.1
Host: catalog.example
AEP-Authorization: AEP <new-client-assertion>
PAYMENT-SIGNATURE: <x402 payment signature>

HTTP/1.1 200 OK
Cache-Control: private
PAYMENT-RESPONSE: <x402 settlement response>
Content-Type: application/odp+json
```

Never copy an AEP assertion, session credential, MPP credential, or x402 payment proof to another origin. Redirects and retries remain subject to each protocol's request-binding and replay rules.

### Let the live response determine the next step

The Service Document describes supported protocols and expected access requirements. The response to the current operation is authoritative for whether that request needs authentication or payment and for the exact retry mechanics. Apply these rules directly:

#### Successful response

Use the returned ODP representation. Do not initiate an advertised protocol that did not challenge the request.

#### Valid 401 AEP challenge

Complete AEP authentication and retry the same operation with the resulting credential.

#### Valid 402 payment challenge

Apply caller approval and payment policy, fulfill the named protocol, and retry with the required proof.

#### Unadvertised live challenge

Treat the valid challenge as authoritative even when the cached Service Document does not advertise that protocol.

#### Advertisement without a challenge

Do not authenticate or pay speculatively.

A challenge does not replace caller approval

A valid payment challenge supplies protocol mechanics, not permission to spend. The Agent still applies the caller's approval, spending limits, accepted assets, destination policy, and other payment rules. If authoritative terms differ from previously displayed metadata, return them to the policy layer instead of paying silently.

### Apply each protocol to its part of the exchange

ODP connects discovery to later protocol exchanges without redefining them. The Service implementation and Agent apply the specification that owns each live signal.

| Protocol | Responsibility in this flow |
| --- | --- |
| [ODP](https://www.offeringprotocol.org/) | Advertises Service capabilities and defines the Collection or Offering operation being requested. |
| [AEP](https://agentenrollment.com/) | Defines enrollment, Agent authentication, credentials, and the AEP challenge and retry behavior. |
| [MPP](https://mpp.dev/) | Defines the Payment challenge, payment credential, request binding, settlement, and replay rules. |
| [x402](https://www.x402.org/) | Defines the payment requirements, payment signature, verification, settlement, and replay rules for an x402 exchange. |

### Inspect the example artifacts

The generated artifact contains the complete Service Document used by this example. Compare its protocol descriptors and operation access declarations with the request sequence above.

- [Generated example](https://www.offeringprotocol.org/examples/protected-discovery/): open the published protected-discovery example and its source files
- [Service Document JSON](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/protected-discovery/protected-service.json): inspect the enrollment, payment, and authenticated-operation declarations

### Next steps

Protocol rules

### Review access and composition

Read the complete rules for authentication, payment, live challenges, and cross-origin credential isolation.

[Access and Composition](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

Public baseline

### Compare the minimum Service

See the same required Offering operations without authentication or payment.

[Minimum Service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/)

On this page

- [What the Service advertises](#advertisement)
- [Begin with the requested operation](#begin-operation)
- [Authenticate before paying](#authenticate-before-payment)
- [Let the live response determine the next step](#live-response)
- [Apply each protocol to its part of the exchange](#protocol-responsibilities)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
