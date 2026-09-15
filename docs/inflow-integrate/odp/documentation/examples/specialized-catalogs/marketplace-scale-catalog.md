<!-- source: https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/marketplace-scale-catalog/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Marketplace-scale catalog

See how one branded marketplace Service exposes millions of independently managed listings without placing its catalog or complete filter vocabulary in the Service Document. Collections establish context, advertised capabilities define valid searches, and continuation links traverse stable result sequences.

### What this Service represents

Market Example is one marketplace brand that publishes a combined catalog of listings from many independent sellers. Agents discover and navigate the marketplace Service, while the marketplace controls the catalog operations and presents the listings under its brand.

This differs from an aggregator that gives each wrapped digital service its own origin and Service Document. Catalog size alone does not make a Service a marketplace. See [Marketplaces](https://www.offeringprotocol.org/documentation/use-cases/marketplaces/) for the complete distinction.

### Keep the Service Document bounded

The Service Document tells an Agent how to enter the marketplace catalog. It remains compact even when the catalog contains millions of listings because it advertises operations and shared integration metadata rather than embedding catalog records or every contextual filter.

| Service metadata | What it provides |
| --- | --- |
| http.endpoint\_base | The base path for fixed ODP Collection and Offering operations. |
| http.openapi | The reusable OpenAPI document inherited by Actions that omit their own URL. |
| branding | The square icon and wide logo used to present the marketplace Service. |
| protocols | A Service-wide summary of [AEP](https://www.aep.foundation/), [MPP](https://mpp.dev/), and [x402](https://x402.org/) support without claiming every request requires them. |
| mcp | The Storefront MCP endpoint, without duplicating its tools, version negotiation, or authorization metadata. |
| Public links | Separate website, documentation, support, and status destinations. |

### Advertise the catalog operations

The Service advertises all seven Collection and Offering operations used by this example. An Agent relies on this list instead of probing unadvertised paths or assuming that every ODP Service supports search.

| Collections | Offerings |
| --- | --- |
| list-collections | list-offerings |
| get-collection | get-offering |
| search-collections | search-offerings |
| — | list-collection-offerings |

Each operation uses authentication: optional. Anonymous requests can succeed, while authenticated requests can expose additional content. The descriptor does not identify protected content or replace a live authentication challenge.

### Find a root Collection

The Collection search combines the Service-interpreted query home office with parent\_id: null. The explicit null value restricts results to root Collections, which omit parent\_ids. Omitting parent\_id would apply no hierarchy constraint.

123456

```
{
  "odp_version": "1.0",
  "query": "home office",
  "parent_id": null,
  "limit": 50
}
```

The response returns the root home-office Collection as a Terse Collection. Its exhaustive detail\_fields list tells the Agent which field subtrees are available through get-collection.

1234567891011121314151617

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "home-office",
      "name": "Home office",
      "detail_fields": [
        "/description",
        "/images",
        "/language",
        "/localizations",
        "/search_capabilities",
        "/web_url"
      ]
    }
  ]
}
```

### Use the Collection as search context

The Full Collection describes home-office furniture, lighting, and accessories. It provides a primary image, English localization metadata, a human-facing browser link, and search capabilities scoped to Offering searches that explicitly name this Collection.

| Collection field | Role |
| --- | --- |
| id: home-office | Names the Collection used as search context. |
| Omitted parent\_ids | Identifies this Collection as a root. |
| Linked filters | Moves the contextual filter vocabulary into a pageable resource. |
| processing-fastest | Advertises one complete sort recipe based on processing time. |

### Page contextual filter definitions

The Collection links to its filters instead of placing the complete vocabulary inline. The first page returns two definitions and a next link; the second returns two more and omits next to end the sequence.

| Filter | Type | Operators | Additional meaning |
| --- | --- | --- | --- |
| category | String | eq, in | Supports value-count refinements. |
| material | String | eq, in | Supports value-count refinements. |
| made\_to\_order | Boolean | eq | Supports value-count refinements. |
| processing\_days | Integer | gte, lte | Uses the UCUM day unit and supplies the sort key. |

A filter identifier is meaningful only within its Service, operation, capability source, and Collection scope. It need not match an Offering attribute name or expose a database field. The Service can map it to attributes, computed data, or an external search index.

### Build one deterministic Offering search

The Offering search combines a text query with independent constraints. Every filter expression is joined with logical AND, while the two values within the material in expression are alternatives.

123456789101112131415161718192021222324252627

```
{
  "odp_version": "1.0",
  "query": "standing desk",
  "collection_id": "home-office",
  "include_descendants": true,
  "filters": [
    {
      "id": "material",
      "operator": "in",
      "value": [
        "walnut",
        "oak"
      ]
    },
    {
      "id": "processing_days",
      "operator": "lte",
      "value": 14
    }
  ],
  "sort": "processing-fastest",
  "refinements": [
    "material",
    "made_to_order"
  ],
  "limit": 50
}
```

| Request field | Effect |
| --- | --- |
| query | Asks the Service to interpret “standing desk.” |
| collection\_id | Uses home-office as the Collection constraint and capability scope. |
| include\_descendants | Includes direct members and members of descendant Collections. |
| filters | Accepts walnut or oak and requires processing time of at most 14 days. |
| sort | Selects the advertised fastest-processing recipe without rewriting its keys. |
| refinements | Requests contextual counts for material and made-to-order values. |

### Return useful terse results

The initial response returns two Terse Offerings, requested refinement groups, and a continuation link. The Service chooses the matching and ordering; the Agent does not assume another Service interprets the same query or ranks results identically.

123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051525354555657585960616263646566676869707172737475

```
{
  "auth_expands": true,
  "odp_version": "1.0",
  "items": [
    {
      "id": "walnut-standing-desk-4821",
      "name": "Handmade walnut standing desk",
      "description": "Height-adjustable desk made to order by a verified workshop.",
      "web_url": "/listing/walnut-standing-desk-4821",
      "collection_ids": [
        "home-office"
      ],
      "price": {
        "type": "starting_at",
        "amount": "1450.00",
        "currency": "USD"
      },
      "schema": {
        "url": "https://market.example/schemas/home-office-furniture-7.json"
      },
      "attributes": {
        "category": "desk",
        "materials": [
          "walnut",
          "steel"
        ],
        "made_to_order": true
      },
      "detail_fields": [
        "/actions",
        "/attributes/dimensions",
        "/attributes/processing_days"
      ]
    },
    {
      "id": "brass-task-lamp-9938",
      "name": "Restored brass task lamp",
      "description": "A rewired vintage desk lamp with an adjustable arm.",
      "web_url": "/listing/brass-task-lamp-9938",
      "collection_ids": [
        "home-office"
      ]
    }
  ],
  "refinements": [
    {
      "filter_id": "material",
      "values": [
        {
          "value": "wood",
          "count": 18420
        },
        {
          "value": "metal",
          "count": 12681,
          "count_relation": "lower_bound"
        }
      ]
    },
    {
      "filter_id": "made_to_order",
      "values": [
        {
          "value": true,
          "count": 9372
        },
        {
          "value": false,
          "count": 27811
        }
      ]
    }
  ],
  "next": "/odp/collections/home-office/offerings?cursor=b2ZmZXJpbmdzMg"
}
```

The standing desk includes descriptive fields, Collection membership, a Price Preview, and selected attributes that help comparison. The task lamp is intentionally smaller. An optional field omitted from a Terse Offering is not evidence that its Full Offering lacks that field.

The desk's Attribute Schema describes its complete Full Offering attributes. The attributes in this terse result are only a partial view, so an Agent preserves their declared types but does not validate them as though the complete attribute object were present.

### Explain omitted details

The desk's detail\_fields list exhaustively identifies the minimal field subtrees omitted from that terse result: its Actions, dimensions, and processing time. The Agent retrieves the Full Offering to obtain them.

detail\_fields does not provide field projection, grant access, or reveal protected fields to an unauthorized caller. The lamp omits detail\_fields, which makes no claim about whether its Full Offering contains more information.

### Return requested refinements

The response includes refinement groups only because the request named material and made\_to\_order. Each group refers back to an advertised refinable Filter Definition; it does not define a new filter or enumerate every possible value.

When computing a material bucket, the Service keeps the query, Collection constraint, access context, and processing-time filter but removes the original material expression. That is why the response can offer useful alternatives such as wood and metal even though the request selected walnut or oak.

### Distinguish exact and lower-bound counts

| Bucket | Count | Interpretation |
| --- | --- | --- |
| wood | 18420 | Exactly 18,420 distinct Offerings match this candidate value and the retained constraints. |
| metal | 12681 lower\_bound | At least 12,681 distinct Offerings match; the Service does not present the value as exact. |

These are counts for individual candidate refinement values across the complete logical result set. They are not total-result counts, and the page limit and selected sort do not change them.

### Follow continuation links exactly

The next reference is an opaque, same-origin continuation chosen by the Service. The Agent preserves it exactly and retrieves it with GET, even though the initial search used POST. It does not decode the cursor, reconstruct the query, or resend the original request body.

Only omission of next ends the sequence. The continuation preserves the original search terms, filters, sorting, access context, and page-size policy while maintaining stable membership and ordering for that traversal.

Refinement groups describe the complete logical result set and appear only on the initial response. Continuation responses omit them rather than recomputing or repeating the counts on every page.

### Explain authenticated expansion

auth\_expands: true states that acceptable Service authentication can expose additional Offerings or additional fields under this query. The anonymous response remains valid and usable.

This signal does not identify or count protected content, promise access to a particular caller, or replace a live authentication challenge. An Agent retries only when its caller's operation justifies authentication.

### Retrieve the selected Full Offering

After selecting the desk, the Agent uses get-offering to retrieve its complete description. The Full Offering contains its dimensions and processing time, direct membership in home-office, a starting Price Preview, and the quote Action announced by detail\_fields.

1234567891011121314151617181920212223242526272829303132333435363738394041424344

```
{
  "actions": [
    {
      "authentication": "required",
      "description": "Request current price, tax, shipping or pickup options, and production availability.",
      "id": "request-quote",
      "openapi": {
        "operation_id": "requestDeskQuote"
      },
      "rel": "quote"
    }
  ],
  "attributes": {
    "category": "desk",
    "dimensions": {
      "depth_cm": 76.2,
      "maximum_height_cm": 122.0,
      "minimum_height_cm": 68.5,
      "width_cm": 152.4
    },
    "made_to_order": true,
    "materials": [
      "walnut",
      "steel"
    ],
    "processing_days": 14
  },
  "collection_ids": [
    "home-office"
  ],
  "description": "Height-adjustable desk made to order by a verified workshop.",
  "id": "walnut-standing-desk-4821",
  "name": "Handmade walnut standing desk",
  "odp_version": "1.0",
  "price": {
    "amount": "1450.00",
    "currency": "USD",
    "type": "starting_at"
  },
  "schema": {
    "url": "https://market.example/schemas/home-office-furniture-7.json"
  },
  "web_url": "/listing/walnut-standing-desk-4821"
}
```

The Action omits an OpenAPI URL and therefore inherits /openapi.json from the Service Document. The Agent resolves exactly one operation whose operationId is requestDeskQuote before asking for current price, tax, fulfillment choices, and production availability.

The Offering belongs directly to home-office because that ID appears in collection\_ids. Collection hierarchy does not silently add membership in ancestor Collections.

### Keep Directory and catalog search separate

The Service keywords—marketplace, handmade, vintage, and retail—help a Directory index and find Market Example as a Service. They do not advertise accepted Offering queries, filters, suggestions, or refinements.

After selecting the Service, an Agent retrieves its current Service Document and uses its catalog operations. Directory search does not become cross-Service Offering search, and Directory metadata does not replace the marketplace's authoritative catalog responses.

### Follow the scalable discovery flow

01

### Discover the marketplace

Obtain the Service Origin directly or through a Directory, then retrieve its current Service Document.

02

### Find the Collection

Search for the home-office root, then retrieve its Full Collection and scoped search capabilities.

03

### Load filter definitions

Follow the linked filter pages and retain each definition in its Service, operation, and Collection scope.

04

### Search Offerings

Combine the caller's query with advertised filters, sorting, refinements, descendant expansion, and a page limit.

05

### Traverse and refine

Present terse results and requested counts, and follow each continuation link without rebuilding it.

06

### Retrieve the selected Offering

Load complete attributes and Actions only after the caller selects a listing that merits more detail.

### Inspect the example artifacts

The example contains a few representative records to explain a shape intended for a much larger catalog. The marketplace name, domains, listings, counts, and cursors are illustrative.

- [Generated example](https://www.offeringprotocol.org/examples/marketplace/): open the published sequence and every source artifact
- [Service Document](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/marketplace-service.json): inspect operations, shared OpenAPI, branding, protocols, links, and MCP
- [Full Collection](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-collection.json): inspect the root Collection and its scoped search capabilities
- [Collection search request](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-collection-search-request.json): inspect the query and root constraint
- [Collection search response](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-collection-search-response.json): inspect the Terse Collection and omitted-detail pointers
- [Filter page one](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-filters-page-1.json): inspect refinable string filters and continuation
- [Filter page two](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-filters-page-2.json): inspect boolean and numeric filters
- [Offering search request](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-offering-search-request.json): inspect the complete constrained search
- [Offering search response](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-search-response.json): inspect terse results, refinements, and continuation
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/walnut-standing-desk-offering.json): inspect the selected desk and inherited OpenAPI Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/marketplace/home-office-furniture-attributes.schema.json): inspect the marketplace-defined listing attributes

### Next steps

Navigation

### Build Collection context

Organize catalog navigation and scope search capabilities.

[Collections](https://www.offeringprotocol.org/documentation/guides/collections/)

Queries

### Advertise valid searches

Define filters, sorts, and refinements before accepting them.

[Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/)

Traversal

### Continue stable sequences

Issue opaque continuation links and preserve traversal order.

[Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/)

Domain data

### Describe listing attributes

Publish schemas for marketplace-defined fields.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

On this page

- [What this Service represents](#service)
- [Keep the Service Document bounded](#service-document)
- [Advertise the catalog operations](#operations)
- [Find a root Collection](#root-collection)
- [Use the Collection as search context](#collection-context)
- [Page contextual filter definitions](#filters)
- [Build one deterministic Offering search](#search-request)
- [Return useful terse results](#terse-results)
- [Explain omitted details](#details)
- [Return requested refinements](#refinements)
- [Distinguish exact and lower-bound counts](#counts)
- [Follow continuation links exactly](#continuation)
- [Explain authenticated expansion](#authentication)
- [Retrieve the selected Full Offering](#full-offering)
- [Keep Directory and catalog search separate](#directory)
- [Follow the scalable discovery flow](#flow)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
