<!-- source: https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Traverse and refresh catalog resources

Follow continuation links exactly as the Service returns them, and keep cached ODP resources separated by request and authentication context.

### Let the Service control pagination

ODP does not expose page numbers, offsets, previous-page links, or total-result counts. A Service returns the current items and, when more remain, an opaque next link that contains everything needed to continue the same logical traversal.

Service responsibility

### Create the sequence

Choose page boundaries, preserve the query and access context, and keep resource identity and ordering stable across the traversal.

Agent responsibility

### Follow the sequence

Consume each page, preserve continuation links exactly, and stop when next is omitted or the caller stops iteration.

### Read the page envelope

Every successful list or search response is an ODP Top-Level Document containing odp\_version and items. The items can be Terse or Full representations according to the operation and request.

1234567891011121314

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "research-report",
      "name": "Research report"
    },
    {
      "id": "gpu-hour",
      "name": "Dedicated GPU hour"
    }
  ],
  "next": "/odp/offerings/pages/p_7F4k29Nq"
}
```

items can be empty. An empty array does not end traversal when the page still contains next; only omission of next identifies the final page. A page can also contain auth\_expands: true when acceptable Service authentication can expose additional items or fields. It does not identify, count, or describe protected content, and the Service omits it instead of serializing false.

### Request a maximum page size

Every initial list and search operation accepts limit from 1 through 100. A GET operation carries it in the query string; a POST search carries it as a top-level request-body member. The value requests a maximum, so a Service can return fewer items and chooses its own page size when the value is absent.

Page size is not a result limit

An Agent-oriented SDK should default its configurable initial page size to 50 and can request fewer items when the caller's remaining overall result limit is smaller. Reaching that separate result limit stops local iteration, and the SDK must not fetch another page merely because the Service sequence has not ended.

### Follow the continuation exactly

An Agent retrieves next with GET, including when the initial search used POST. The link is a Resource Reference containing no more than 2,048 ASCII characters. The Service-selected URL preserves the representation, filters, search terms, sorting, access context, and page-size policy. The Agent does not repeat the original request body or reconstruct those inputs.

12

```
GET /odp/offerings/pages/p_7F4k29Nq HTTP/1.1
Accept: application/odp+json
```

- [Preserve](#continuation-requests): use the continuation link exactly as supplied without decoding or modifying its cursor
- [Constrain](#continuation-requests): require the link to resolve to the same origin as the initial operation
- [Advance](#continuation-requests): reject a response that returns its own request URL as the next continuation
- [Finish](#page-envelope): stop only when a successful page omits next

### Keep one logical sequence stable

Within one traversal, membership and ordering remain stable and the same Resource Identity cannot appear twice. The item's id is the final deterministic ordering tie-breaker. This lets an Agent iterate without missing or duplicating resources when concurrent catalog changes occur.

The representation of a resource can still reflect changes made after the initial request. Stability applies to which Resource Identities belong to the traversal and their order, not to freezing every descriptive or volatile field for the continuation lifetime.

### Treat cursors as opaque values

A continuation URL can contain a self-contained cursor or refer to state retained by the Service. An Agent cannot distinguish those storage models and handles both in the same way.

| Requirement | Service behavior |
| --- | --- |
| Integrity | Protect a self-contained cursor against modification. |
| Confidentiality | Do not disclose credentials, private catalog data, or access-policy details. A Service should encrypt confidential continuation state. |
| Authorization | Validate every cursor as untrusted input and never treat possession as authorization. |
| Lifetime | Keep each continuation usable for at least one hour after issuance. |

An expired continuation produces 410 Gone with CONTINUATION\_EXPIRED Problem Details. The Service does not silently restart the traversal, and an Agent-oriented SDK reports the failure so its caller can decide whether to repeat the initial operation.

### Let SDK callers iterate over items

An Agent-oriented SDK should expose list and search results as asynchronous iterables that retrieve continuation pages as needed. The ordinary interface yields Collection or Offering representations rather than requiring every caller to manage page envelopes and continuation links.

A lower-level page interface can expose items and next for callers that need explicit control. Any interface that automatically retrieves pages must stop before another network request when the caller ends iteration.

### Let HTTP control freshness

ODP resources are mutable HTTP resources. Cache-Control, Expires, entity tags, and validators are authoritative. SDK fallback lifetimes apply only when the response supplies no freshness information and never override explicit HTTP metadata.

Each resource class has an independently configurable fallback because its expected rate of change differs. A Service Document can remain useful for hours while search results can become stale immediately.

### Apply resource-specific fallbacks

| Resource | Fallback freshness |
| --- | --- |
| Service Document | 4 hours |
| Collection | 1 hour |
| Offering | 5 minutes |
| Search response | 0 seconds |
| Filter or Sort Definition | 1 hour |
| Attribute Schema | 24 hours |

Search continuation pages retain the zero-second fallback because they remain search responses. A POST search response is cacheable only when explicit HTTP semantics permit it.

### Revalidate each page independently

Every page request has its own cache key and validators. For GET pages, a Service should provide an entity tag and honor conditional requests so an Agent can confirm that a cached representation remains current without downloading it again.

Agent revalidation

123

```
GET /odp/offerings?limit=50 HTTP/1.1
Accept: application/odp+json
If-None-Match: "offerings-page-42"
```

Unchanged response

123

```
HTTP/1.1 304 Not Modified
ETag: "offerings-page-42"
Cache-Control: max-age=300
```

304 Not Modified reuses the cached representation associated with that validator. It does not validate another page in the same traversal or make the underlying catalog immutable.

### Partition caches by access context

An Agent cache keeps anonymous responses separate from every authenticated context. It must not reuse an authenticated representation, page, schema, or capability document anonymously or under different credentials, even when the URL and requested representation are identical.

A continuation does not grant access

A next link preserves traversal state but does not override cache directives, authorize a shared cache, make a private response public, or replace the Service's live authentication requirements.

### Keep traversal dependable

- [Page](#page-envelope): return a valid envelope and omit next only when the sequence ends
- [Continue](#continuation-requests): preserve the opaque link and retrieve it with GET without reconstructing inputs
- [Stabilize](#stable-traversal): keep Resource Identity membership and ordering stable without duplicating items
- [Protect](#cursor-contract): integrity-protect cursor state, conceal sensitive values, and validate it as untrusted input
- [Cache](#cache-authority): honor HTTP metadata, use configurable fallbacks, and partition every access context

### Next steps

Failure behavior

### Handle limits and retries

Apply response limits, Problem Details, rate-limit timing, and bounded retry policy.

[Errors and limits](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/)

Resource meaning

### Interpret returned items

Understand Terse and Full representations before consuming each page.

[Representations and schemas](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/)

On this page

- [Pagination model](#pagination-model)
- [Page envelope](#page-envelope)
- [Page size](#page-size)
- [Continuation requests](#continuation-requests)
- [Stable traversal](#stable-traversal)
- [Cursor contract](#cursor-contract)
- [Agent iteration](#agent-iteration)
- [Cache authority](#cache-authority)
- [Fallback lifetimes](#fallback-lifetimes)
- [Conditional requests](#conditional-requests)
- [Cache isolation](#cache-isolation)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
