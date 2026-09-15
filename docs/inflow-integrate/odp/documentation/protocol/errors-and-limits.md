<!-- source: https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Handle failures without losing usable data

Use stable machine-readable problems for failed operations, preserve unaffected data after supporting-resource failures, and stop processing before any ODP resource exceeds its limit.

### Return machine-readable problems

An ODP request-processing error that includes a response body uses [Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) and the application/problem+json media type. The object contains type, title, status, and code; it can also contain detail and instance.

status must equal the HTTP response status. title is limited to 128 Unicode code points and detail to 2,048. The stable code begins with an uppercase ASCII letter and contains no more than 64 uppercase ASCII letters, digits, or underscores.

Challenge protocols keep their own response rules

A live AEP, MPP, x402, or other authentication or payment challenge retains the body rules defined by that protocol. Problem Details does not replace the challenge header, and an Agent preserves those headers for the applicable protocol handler.

### Build a predictable problem response

type is an absolute HTTPS URL that must equal https://offeringprotocol.org/problems/ followed by the lowercase code with each underscore replaced by a hyphen. The following response identifies an invalid search-body member without requiring the Agent to interpret prose.

1234567891011121314

```
{
  "type": "https://offeringprotocol.org/problems/invalid-request",
  "title": "Invalid request",
  "status": 400,
  "code": "INVALID_REQUEST",
  "detail": "One or more request parameters are invalid.",
  "invalid_params": [
    {
      "in": "body",
      "name": "/limit",
      "reason": "Must be an integer from 1 through 100."
    }
  ]
}
```

An Agent uses code, the HTTP status, and structured parameter entries to determine recovery. title, detail, and each parameter reason remain useful for a human but are not control-flow identifiers.

### Use stable core problem codes

The HTTP status classifies the failure for general clients, while the ODP code identifies the protocol condition for Agent implementations.

| Code | Status | Meaning |
| --- | --- | --- |
| INVALID\_REQUEST | 400 | Request syntax or values are invalid. |
| NOT\_AUTHENTICATED | 401 | Authentication is required or invalid. |
| NOT\_AUTHORIZED | 403 | The principal cannot perform the operation. |
| NOT\_FOUND | 404 | The requested ODP resource does not exist. |
| NOT\_ACCEPTABLE | 406 | No acceptable response representation exists. |
| CONTINUATION\_EXPIRED | 410 | The continuation link has expired. |
| REQUEST\_TOO\_LARGE | 413 | The request exceeds its resource limit. |
| UNSUPPORTED\_MEDIA\_TYPE | 415 | The request media type is unsupported. |
| RATE\_LIMITED | 429 | A request rate or quota has been exceeded. |
| SERVICE\_UNAVAILABLE | 503 | The Service is temporarily unable to respond. |

### Identify invalid parameters precisely

An INVALID\_REQUEST problem can include a non-empty invalid\_params array containing at most 32 failures. Every entry identifies its location as query, body, header, or path, then provides a name and concise reason.

A body-member name is a JSON Pointer. Other names identify the parameter or header directly. Names contain no more than 256 Unicode code points and reasons no more than 1,024. An Agent can present the reason to a caller, but it must not parse that prose to select its recovery behavior.

### Separate operation errors from scoped issues

An Agent-oriented SDK should map a failed requested operation to a typed error containing at least code, message, and retryable. It can also expose retry timing and structured invalid parameters. A failed operation is not converted into a partial success.

Operation failure

### Return a typed error

Failure to retrieve or validate the resource the caller requested ends that operation and exposes its structured error.

Enrichment failure

### Preserve unrelated fields

An unavailable Attribute Schema makes the associated attributes uninterpretable, but the Offering identity, description, Price Preview, Collections, and Actions remain usable.

The SDK reports the enrichment failure as a scoped issue in its own result contract. That issue is not added to the ODP wire representation and does not invalidate unaffected Offering data.

### Enforce every resource limit

Limits apply after HTTP content codings are decoded and before the representation is exposed to an Agent caller. JSON depth is measured from the top-level value. An Agent stops reading as soon as a body exceeds its applicable byte limit.

| Resource | Limit |
| --- | --- |
| ODP request body | 65,536 bytes |
| Individual Collection or Offering response | 524,288 bytes |
| List, search, or Filter Definition page | 524,288 bytes |
| Problem Details response | 16,384 bytes |
| JSON nesting depth except Service Document | 16 |
| Service Document | 65,536 bytes |
| Service Document nesting depth | 8 |
| Items per page | 100 |
| Pages per linked capability source | 16 |
| One Attribute Schema document | 262,144 bytes |
| Complete Attribute Schema reference graph | 1,048,576 bytes |
| One OpenAPI Action document | 1,048,576 bytes |
| Distinct documents in one schema graph | 16 |
| Attribute Schema reference depth | 8 |
| Redirects per retrieved resource | 5 |

More specific limits on fields, relationships, and pagination still apply. A Service can return fewer items than requested to keep a page within its byte limit. Domain-specific attribute arrays use their Attribute Schema and the overall byte and depth boundaries instead of a universal item count.

### Reject rather than truncate

A receiver rejects the affected document before exposing any partial JSON, schema, string, or array. A malformed or oversized Service Document is rejected in full; an Agent must not act on the fields that happened to arrive before the failure.

- [Paged results](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/): keep valid items already yielded from earlier pages, stop automatic traversal at the failing page, and report the local SDK error RESPONSE\_LIMIT\_EXCEEDED
- [Attribute Schemas](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): omit only the attributes made uninterpretable by the failed schema graph and report a scoped issue
- [Oversized requests](#resource-limits): return 413 Content Too Large with REQUEST\_TOO\_LARGE Problem Details

### Keep redirects bounded and same-origin

An Agent follows at most five redirects for each retrieved ODP resource, JSON Schema resource, or OpenAPI Action document. Every redirect target retains the scheme, host, and effective port of the preceding request. Redirect loops, transport-security downgrades, cross-origin redirects, and a sixth redirect are rejected.

A Resource Reference can explicitly begin an independently validated request at another origin. That resource cannot use a redirect to transfer the request to yet another origin. The [Security](https://www.offeringprotocol.org/documentation/protocol/security/) guide explains the network and credential protections that apply to each destination.

### Retry only transient failures

An Agent-oriented SDK should support bounded automatic retry for 429 Too Many Requests and 503 Service Unavailable. The default policy performs no more than three retries and spends no more than 30 seconds waiting across the operation.

| Response | Retry behavior |
| --- | --- |
| 429 | The Service must include Retry-After. The Agent honors it only when the delay fits within the total waiting budget. |
| 503 | The Service should include Retry-After. Without it, the SDK uses bounded exponential backoff with jitter. |

ODP list, search, and retrieval operations are read-only at the application layer and can use this retry policy. An SDK does not automatically restart an expired continuation or retry authentication, authorization, validation, or another non-transient failure.

### Handle future errors safely

Compatible revisions can add problem codes and object members. An Agent ignores unknown additive members, ignores an invalid-parameter entry whose in value it does not recognize, and interprets an unknown problem code using the HTTP status and standard Problem Details fields. It must not substitute a familiar code or invent recovery semantics.

The same narrow-failure principle applies to unfamiliar capabilities: disable the smallest dependent capability, preserve unrelated data, and fail closed when an unknown value prevents the Agent from determining identity, authorization, payment, request semantics, or security consequences. An unsupported odp\_version rejects the ODP document rather than entering this fallback path.

### Keep failures bounded and actionable

- [Describe](#problem-details): return stable Problem Details fields for ODP failures that include a body
- [Locate](#invalid-parameters): identify invalid inputs structurally without making Agents parse human prose
- [Bound](#resource-limits): stop reading before a body, document graph, page sequence, or redirect chain exceeds its limit
- [Preserve](#errors-and-issues): keep unrelated data usable when an enrichment failure has a defined narrow scope
- [Retry](#retry-policy): retry only bounded transient failures and return every other failure to the caller

### Next steps

Resource safety

### Secure resource retrieval

Apply destination validation, credential isolation, redirect, and untrusted-content protections.

[Security](https://www.offeringprotocol.org/documentation/protocol/security/)

Compatible evolution

### Evolve without guessing

Apply version selection and narrow handling for additive protocol changes.

[Versioning and extensibility](https://www.offeringprotocol.org/documentation/protocol/versioning-and-extensibility/)

On this page

- [Problem Details](#problem-details)
- [Problem response](#problem-example)
- [Core problem codes](#problem-codes)
- [Invalid parameters](#invalid-parameters)
- [Errors and issues](#errors-and-issues)
- [Resource limits](#resource-limits)
- [Limit failures](#limit-failures)
- [Redirect limits](#redirect-limits)
- [Retry policy](#retry-policy)
- [Error compatibility](#error-compatibility)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
