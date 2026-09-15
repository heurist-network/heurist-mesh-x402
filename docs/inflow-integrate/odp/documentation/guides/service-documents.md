<!-- source: https://www.offeringprotocol.org/documentation/guides/service-documents/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Publish a Service Document

Give Agents one public entry point for understanding your Service and the ODP operations it supports.

### The Service entry point

Every [ODP](https://www.offeringprotocol.org/) Service publishes a JSON Service Document at its origin.

PublicGET/.well-known/odp

The Service Document is public

The Service Document must be available without enrollment, authentication, or payment. A Service can protect the catalog operations advertised by the document, but it cannot protect the document itself.

### Minimum Service Document

A conformant Service begins with descriptive metadata, language information, at least the two required Offering operations, and an HTTP endpoint base.

1234567891011121314151617181920

```
{
  "odp_version": "1.0",
  "name": "Example Service",
  "description": "Search and retrieve digital research services.",
  "language": "en",
  "localizations": ["en"],
  "operations": [
    {
      "name": "list-offerings",
      "authentication": "not-required"
    },
    {
      "name": "get-offering",
      "authentication": "not-required"
    }
  ],
  "http": {
    "endpoint_base": "/odp/"
  }
}
```

| Field | Purpose |
| --- | --- |
| odp\_version | Selects the ODP document contract used by the Service. |
| name and description | Explain what the Service is and what it makes available. |
| language and localizations | Identify the current representation language and the Service metadata languages available. |
| operations | Advertise only the catalog operations the Service implements. |
| http.endpoint\_base | Provides the origin-relative base path for fixed ODP operation paths. |

See the [Minimum Service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) example for the Offering list and Full Offering that complete the required discovery flow.

### The origin is the identity

The origin from which the final Service Document is retrieved identifies the Service. An Agent does not trust a self-asserted identifier inside the document.

Do not declare a second identity

The Service Document cannot contain a self-asserted Service identifier or a root web\_url. Use website\_url when you want to identify the human-facing website or storefront.

### Describe the Service

Required metadata gives every Agent a useful baseline. Optional fields add discovery, presentation, integration, and operational context.

| Group | Fields | Use |
| --- | --- | --- |
| Required | odp\_version, name, description, language, localizations, operations, http | Establish the minimum Service metadata and catalog operations. |
| Discovery | keywords, [search\_capabilities](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/#capability-advertisement) | Help Agents and directories understand how the Service can be found and searched. |
| Branding and public links | branding, website\_url, documentation\_url, support\_url, status\_url | Provide recognizable branding plus human-facing, support, documentation, and operational destinations. |
| Composition | protocols, payment\_origins, mcp, http.openapi | Advertise related protocol support and machine-readable integration surfaces. |

Keywords are freeform discovery hints in the document's language. They do not define accepted search terms, filters, or a protocol-wide taxonomy.

### Advertise implemented operations

Every Service implements and advertises list-offerings and get-offering. The remaining operations are optional and appear only when the Service supports them.

| Capability | Operations |
| --- | --- |
| Required Offering access | list-offerings, get-offering |
| Offering search | search-offerings |
| Collection navigation | list-collections, search-collections, get-collection, list-collection-offerings |

Each descriptor declares whether Service authentication is not-required, optional, or required. Using optional or required also requires the Service Document to advertise [AEP](https://www.aep.foundation/) enrollment. An Agent must not probe for an operation that the document does not advertise.

See [Discovery and operations](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/) for fixed paths, request methods, and operation construction.

### Locate the endpoints

http.endpoint\_base begins with one forward slash and identifies the base path for ODP operations. An Agent removes a trailing slash, appends one slash, and then appends the fixed path for the advertised operation.

01

### Start with the Service origin

https://service.example

02

### Apply the endpoint base

/odp

03

### Append the advertised operation path

https://service.example/odp/offerings

[http.openapi](#protocols-and-integrations) can identify a reusable OpenAPI 3.1 document for Actions. It enriches Action invocation but is not required for navigating ODP.

### Add presentation and links

branding provides both a square icon and a horizontal logo. The Service links identify its human-facing website, documentation, support destination, and operational status page.

The following excerpt shows where those optional fields live at the top level of the Service Document. It is not a replacement for the required fields in the minimum document.

12345678910111213141516

```
{
  "branding": {
    "icon": {
      "src": "/images/icon.svg",
      "type": "image/svg+xml"
    },
    "logo": {
      "src": "/images/logo.svg",
      "type": "image/svg+xml"
    }
  },
  "website_url": "https://www.example.com/",
  "documentation_url": "/docs/",
  "support_url": "/support/",
  "status_url": "https://status.example.net/"
}
```

A same-origin Resource Reference should use an origin-relative path such as /support/. A resource hosted elsewhere uses an absolute HTTPS URL such as https://status.example.net/. Relative references resolve against the Service origin, not against website\_url or http.endpoint\_base.

See [Branding and localization](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/) for image, language, and localized representation requirements.

### Compose protocols and integrations

The Service Document can advertise enrollment through [AEP](https://www.aep.foundation/), payments through [MPP](https://mpp.dev/) or [x402](https://x402.org/), and trust through TAP. It can also provide remote MCP endpoints and the origins that may issue payment challenges.

This excerpt shows the exact placement of the optional composition fields. The surrounding Service Document must still contain every required field shown in the minimum example.

12345678910111213141516171819202122232425262728293031323334353637383940414243

```
{
  "payment_origins": [
    "https://payments.example.net"
  ],
  "protocols": {
    "enrollment": [
      {
        "name": "aep"
      }
    ],
    "payments": [
      {
        "name": "mpp",
        "authentication": "required",
        "options": ["inflow", "tempo"]
      },
      {
        "name": "x402",
        "authentication": "required",
        "options": ["base", "solana"]
      }
    ],
    "trust": [
      {
        "name": "tap"
      }
    ]
  },
  "mcp": [
    {
      "type": "streamable-http",
      "url": "/mcp",
      "name": "Catalog tools",
      "description": "Agent tools for this Service."
    }
  ],
  "http": {
    "endpoint_base": "/odp",
    "openapi": {
      "url": "/openapi.json"
    }
  }
}
```

| Field | What it advertises | Important boundary |
| --- | --- | --- |
| protocols.enrollment | AEP enrollment support. | The array contains the single descriptor {"name":"aep"} when present. |
| protocols.payments | MPP, x402, or both in Service-preference order. | authentication states whether Service authentication is required first; options contains compatibility labels. |
| protocols.trust | TAP support. | Advertisement does not replace TAP request validation or prove ownership. |
| payment\_origins | Additional origins that can issue payment challenges. | Omit it when challenges come only from the canonical Service origin. |
| mcp | Remote MCP Streamable HTTP endpoints. | The descriptor locates an endpoint; it does not enumerate MCP tools or authorize a connection. |
| http.openapi | The default OpenAPI 3.1 document for Actions. | An Action-level openapi.url overrides this reference. |

Omit unsupported protocol categories instead of serializing empty arrays. A payment descriptor names mpp or x402 and uses not-required or required for authentication. Names are unique, at most two descriptors can appear, and their order expresses Service preference. A descriptor with required authentication also requires protocols.enrollment to advertise AEP.

options can contain algorand, aptos, arbitrum, avalanche, base, card, ethereum, hedera, inflow, lightning, polygon, solana, stellar, stripe, tempo, and ton. These compact compatibility labels do not replace protocol-specific payment methods, networks, assets, or settlement terms.

An Agent filters unknown protocol names without invalidating an otherwise usable document. Known descriptors must still satisfy their complete contract. All composition fields advertise support; their defining protocols and live endpoints remain authoritative for authentication, payment, trust, and MCP behavior. See [Protocol composition](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/) for the boundaries between them.

### Keep the document bounded

The Service Document is a flat JSON object. Its decoded representation cannot exceed 65,536 bytes or a JSON nesting depth of eight, and its successful response uses application/odp+json. An Agent rejects an invalid document as a whole rather than acting on a partially parsed result.

Retrieval follows at most five redirects. Every redirect remains on the same scheme, host, and effective port as the preceding request.

Keep catalog data behind operations

Do not embed a growing catalog in the Service Document. Publish Service-level metadata and capabilities here, then return Collections and Offerings from the operations that own them.

### Implementation checklist

- [Public endpoint](#entry-point): serve GET /.well-known/odp without enrollment, authentication, or payment
- [Media type](#retrieval-limits): return successful documents as application/odp+json
- [Required fields](#minimum-document): include every member shown in the minimum document
- [Operations](#operations): advertise only operations that are implemented with the declared access behavior
- [References](#presentation-and-links): use valid origin-relative paths or absolute HTTPS URLs
- [Validation](https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/): validate the document and advertised integration before publication

### Next steps

Quick start

### Implement a working Service

Turn the minimum document into a complete ODP integration.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

Readiness

### Check the integration

Validate the public document and every advertised operation before publication.

[Validate an integration](https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/)

On this page

- [The Service entry point](#entry-point)
- [Minimum Service Document](#minimum-document)
- [The origin is the identity](#service-identity)
- [Describe the Service](#service-metadata)
- [Advertise implemented operations](#operations)
- [Locate the endpoints](#http-configuration)
- [Add presentation and links](#presentation-and-links)
- [Compose protocols and integrations](#protocols-and-integrations)
- [Keep the document bounded](#retrieval-limits)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
