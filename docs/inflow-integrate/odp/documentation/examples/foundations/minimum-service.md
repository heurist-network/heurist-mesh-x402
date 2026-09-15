<!-- source: https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Minimum Service

Use one Service Document, one Offering page, and one Full Offering as a complete reference for the smallest conformant ODP Service.

### The minimum required endpoints

A minimum Service exposes public discovery metadata and the two required Offering operations. This example contains one Offering so the complete sequence from the Service origin to its Full representation is easy to follow.

| Endpoint | Representation | Role |
| --- | --- | --- |
| GET /.well-known/odp | Service Document | Identifies the Service and advertises its available operations. |
| GET /odp/offerings | Offering page | Returns the accessible sequence of terse Offering references. |
| GET /odp/offerings/consultation | Full Offering | Resolves the listed identifier to its complete representation. |

Collections, search, prices, custom attributes, Attribute Schemas, Actions, enrollment, and payments are not required. The [canonical example files](https://www.offeringprotocol.org/examples/minimum-service/) provide these three representations as standalone artifacts.

### Service Document

The well-known document establishes the discovery entry point. It advertises only list-offerings and get-offering, declares both operations public, and locates their fixed paths beneath /odp/.

PublicGET/.well-known/odp

12345678910111213141516171819202122

```
{
  "odp_version": "1.0",
  "name": "Consulting Example",
  "description": "A small Service with one Offering and the required ODP operations.",
  "language": "en",
  "localizations": [
    "en"
  ],
  "operations": [
    {
      "authentication": "not-required",
      "name": "get-offering"
    },
    {
      "authentication": "not-required",
      "name": "list-offerings"
    }
  ],
  "http": {
    "endpoint_base": "/odp/"
  }
}
```

The document does not claim capabilities that the example does not implement. An Agent can therefore navigate directly from this advertisement without probing for familiar but undeclared endpoints.

### Offering list

The list endpoint returns a page of terse Offerings. Each item supplies the stable identifier and human-readable name needed to select and retrieve an Offering.

PublicGET/odp/offerings

123456789

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "consultation",
      "name": "One-hour consultation"
    }
  ]
}
```

The response omits next because this is the final page. The identifier consultation becomes the final path segment used by get-offering.

### Full Offering

The individual endpoint returns the Full Offering for the request. The minimum representation contains the protocol version and repeats the identifier and name supplied by the terse list item.

PublicGET/odp/offerings/consultation

12345

```
{
  "odp_version": "1.0",
  "id": "consultation",
  "name": "One-hour consultation"
}
```

No additional Offering fields are required. Descriptions, pricing, images, Actions, and domain-specific attributes are optional.

### Why this Service is complete

The example satisfies the required Service behavior with a small set of connected resources. "Minimum Service" is not a separately advertised profile; larger Services use the same required operations and add optional capabilities.

#### Stable entry point

The public Service Document is available at /.well-known/odp on the Service origin.

#### Required operations

list-offerings and get-offering are both advertised and implemented.

#### Matching identifier

The identifier returned by the list operation resolves to a Full Offering with the same identifier and name.

#### Accurate access

The declared not-required authentication behavior matches all three public endpoints.

#### ODP representation

Each successful top-level response uses application/odp+json and declares odp\_version.

### Next steps

Implementation guide

### Adapt ODP to your application

Connect the minimum ODP endpoints to an existing catalog or service.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

Catalog design

### Expand the Offering model

Add richer Offering fields and optional capabilities after the baseline discovery path works.

[Explore Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

On this page

- [The minimum required endpoints](#complete-surface)
- [Service Document](#service-document)
- [Offering list](#offering-list)
- [Full Offering](#full-offering)
- [Why this Service is complete](#conformance)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
