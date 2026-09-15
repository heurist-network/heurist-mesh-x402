<!-- source: https://www.offeringprotocol.org/documentation/guides/actions/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Turn discovery into an executable operation

Describe what an Agent can do with an Offering while leaving execution, authentication, payment, and the result under the target endpoint's control.

### Advertise what can happen next

An Action describes an HTTP operation associated with one Offering. It can tell an Agent how to download content, request a quote, reserve capacity, purchase an item, or invoke an online capability.

Actions are optional and appear only in a Full Offering. An Offering with no applicable operation omits actions and remains valid for discovery, comparison, and browser navigation. One Offering can advertise up to 16 Actions.

Advertisement does not execute

Retrieving an Offering, parsing an Action, resolving its schema, or loading its OpenAPI document must not call the Action target. Invocation begins only after the caller explicitly selects an Action and supplies or approves its inputs.

### Read an Action contract

Every Action has a stable local identifier, a rel value describing its purpose, and an authentication expectation. It also contains exactly one target description: a compact HTTP target or an OpenAPI target.

| Member | Required | Meaning |
| --- | --- | --- |
| id | Yes | A Local Resource Identifier unique among the Offering's Actions. |
| rel | Yes | The broad result sought from the operation. |
| authentication | Yes | not-required, optional, or required Service authentication at the target. |
| description | No | A concise explanation of the operation and its intended result. |
| http or openapi | Exactly one | The contract used to locate and understand the operation. |

Keep an Action ID stable while that Action remains the same operation on the Offering. Duplicate IDs make every Action bearing that ID unusable because an Agent cannot select one unambiguously.

### Choose the intended relation

rel communicates the kind of outcome the caller is seeking. It does not define the response schema, commerce workflow, authentication mechanism, or payment requirement.

| Relation | Use it when the caller wants to | Example |
| --- | --- | --- |
| download | Retrieve a downloadable representation. | Download a report or generated archive. |
| purchase | Complete a one-time acquisition. | Buy an item or permanent license. |
| quote | Obtain current terms without acquiring anything. | Price a configured service. |
| reserve | Hold or allocate a resource. | Reserve a seat or compute capacity. |
| invoke | Execute an online capability and receive its result. | Run a search, analysis, or generation request. |

free is a Price Preview type, not an Action relation. An Agent retains an Action with an unknown relation so a caller can select it explicitly by ID, but never chooses it automatically based on an assumed meaning.

### Choose a target description

Compact HTTP

### Describe a focused operation

Use a compact target for one GET or POST operation whose optional request body and successful response types can be described without a complete interface contract.

OpenAPI 3.1

### Reference a richer operation

Use OpenAPI when the operation needs parameters, multiple request-body alternatives, complex responses, or declared security requirements.

Both forms identify the same kind of Action. The choice changes how the operation is described, not its relation, identity, authentication expectation, or execution safety.

### Describe a compact HTTP target

The compact form places the target in http. Its required href is a Resource Reference and its required method is GET or POST.

12345678910111213141516171819

```
{
  "id": "run-search",
  "rel": "invoke",
  "authentication": "required",
  "description": "Run a web search and return cited results.",
  "http": {
    "href": "/actions/search",
    "method": "POST",
    "request": {
      "content_type": "application/json",
      "schema": {
        "url": "/schemas/search-request.json"
      }
    },
    "response_content_types": [
      "application/json"
    ]
  }
}
```

- [Request body](#compact-http): describe one optional body with a media type, a JSON Schema reference, or both
- [Request schema](#compact-http): apply the same reference resolution, anonymous retrieval, caching, and narrow-failure rules used by Attribute Schemas
- [Successful responses](#compact-http): advertise up to eight possible media types without constraining challenges, redirects, or errors
- [Live response](#compact-http): treat the returned Content-Type as authoritative

An Agent sends no request body unless the caller supplies one or the operation contract supplies a complete value. A compact target cannot describe URL, header, or cookie parameters; use OpenAPI when those inputs are part of the operation.

### Reference an OpenAPI operation

An OpenAPI Action names exactly one Operation Object by its case-sensitive operation\_id. The example inherits the OpenAPI document from [http.openapi.url](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations) in the Service Document.

12345678

```
{
  "id": "reserve-seat",
  "rel": "reserve",
  "authentication": "optional",
  "openapi": {
    "operation_id": "reserveSeat"
  }
}
```

Set openapi.url on the Action when it uses a different document. The Action-level reference overrides the Service-level reference. The Action is unusable when neither location is available or when the identifier resolves to zero or multiple operations.

The document must be OpenAPI 3.1 JSON. Retrieve it anonymously, enforce the ODP size, depth, and redirect limits, and match only operationId. An Agent must not guess from the path, method, summary, or description.

### Keep discovery separate from execution

Action resolution prepares the method, URL, content type, and request contract for a caller. The caller selects the Action and approves any required inputs before the Agent sends the network request.

01

### Retrieve the Full Offering

Read the complete Action list for the current access context instead of relying on a terse catalog result.

02

### Select the Action ID

Use the caller's requested operation and choose one advertised Action without inferring intent from an unknown relation.

03

### Prepare the request

Load supporting metadata, validate supplied inputs, and determine the authentication, payment, and state-changing consequences.

04

### Obtain approval and invoke

Apply caller policy or approval, then make the target request in its current authentication context.

### Follow live access requirements

authentication describes whether Service authentication is expected at the Action target. It does not create a credential, replace an AEP challenge, or prove that the target currently requires authentication.

Begin the Action request in its current authentication context. Follow a live AEP, MPP, x402, or other HTTP challenge according to that protocol. An advertisement without a challenge must not cause the Agent to enroll, authenticate, or pay speculatively.

A cross-origin Action starts without credentials belonging to the Offering Service. Credentials can be obtained or sent only under the target origin's own policy and live challenge flow.

### Isolate unusable Actions

Action metadata is independently usable. Preserve the Offering and unrelated Actions when one Action cannot be resolved safely.

- [Invalid Action](#narrow-failures): omit only that Action from the usable Action set and report a scoped issue
- [Duplicate ID](#narrow-failures): treat every Action with that identifier as unusable rather than choosing one
- [Failed schema](#narrow-failures): leave the target unresolved without discarding the Offering's identity, price, or presentation fields
- [Failed OpenAPI lookup](#narrow-failures): do not guess an operation from nearby metadata
- [Unknown relation](#relations): retain the Action for explicit selection but do not select it automatically

### Retry state changes carefully

A Service must give every compact GET Action safe HTTP semantics. Loading or retrying it must not create the state change that a POST Action would represent.

After an ambiguous outcome from a state-changing Action, an Agent must not retry automatically unless the operation defines an applicable idempotency mechanism and the retry preserves it. Challenge-response retries remain governed by AEP, MPP, x402, and the exact request binding of the protocol involved.

### Next steps

Commercial context

### Describe price before execution

Help an Agent compare an Offering without confusing a preview with a payment requirement.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

Protocol behavior

### Apply access requirements

Follow authentication and payment challenges without leaking credentials or acting speculatively.

[Access and composition](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

On this page

- [Advertise what can happen next](#advertise-next-step)
- [Read an Action contract](#action-contract)
- [Choose the intended relation](#relations)
- [Choose a target description](#target-description)
- [Describe a compact HTTP target](#compact-http)
- [Reference an OpenAPI operation](#openapi)
- [Keep discovery separate from execution](#execution-flow)
- [Follow live access requirements](#live-access)
- [Isolate unusable Actions](#narrow-failures)
- [Retry state changes carefully](#safe-retries)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
