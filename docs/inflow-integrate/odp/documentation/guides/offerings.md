<!-- source: https://www.offeringprotocol.org/documentation/guides/offerings/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Describe what a Service offers

Represent anything an Agent can discover and evaluate without forcing every catalog into a conventional product model.

### Choose what one Offering represents

An Offering is a Service-defined resource that can represent a physical product, digital service, piece of content, reservation, unit of capacity, or another available item. ODP gives these resources a common discovery structure without prescribing one commercial data model.

- [Separate Offerings](#offering-granularity): create a separate Offering when a choice should be independently discoverable or has its own details, price, availability, or Actions
- [Attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): describe persistent characteristics of one Offering with typed Service-defined data
- [Action input](https://www.offeringprotocol.org/documentation/guides/actions/): accept request-specific choices, such as size or output format, when the caller invokes an Action

Choose a unit that has independent meaning in the Service's domain. An Offering is not always a product, and related Offerings do not necessarily form a product-and-variant hierarchy.

| Domain | Possible Offering | Boundary consideration |
| --- | --- | --- |
| Physical goods | A desk chair | Color can remain an Action input, while materially different models can be separate Offerings. |
| Digital capability | Web search | Result count can be an input; separately priced search modes can be separate Offerings. |
| Content | A research report | Formats can remain together unless each format is independently described or acquired. |
| Capacity | One hour of compute | Regions or hardware classes can be separate when availability and pricing differ independently. |

### Publish a useful Full Offering

Every Full Offering contains odp\_version, id, and name. Add only the optional fields that describe, present, organize, compare, or act upon that resource.

12345678910111213141516171819202122232425262728

```
{
  "odp_version": "1.0",
  "id": "web-search",
  "name": "Web search",
  "description": "Search the web and return cited results.",
  "images": [
    {
      "src": "/images/offerings/web-search.png",
      "alt": "Web search"
    }
  ],
  "web_url": "/offerings/web-search",
  "collection_ids": [
    "research-tools"
  ],
  "price": {
    "type": "fixed",
    "amount": "0.01",
    "currency": "USD"
  },
  "schema": {
    "url": "/schemas/web-search.json"
  },
  "attributes": {
    "result_format": "json",
    "max_results": 100
  }
}
```

| Concern | Fields | Purpose |
| --- | --- | --- |
| Required fields | id, name | Provide the stable local ID and human-readable name. |
| Presentation | description, images, web\_url, language metadata | Help Agents and humans recognize and evaluate the Offering. |
| Organization | collection\_ids | Record direct membership in zero or more Collections. |
| Comparison | price, schema, attributes | Provide a price summary and typed domain-specific data. |
| Execution | actions | Advertise operations that can follow discovery. |

### Make the Offering recognizable

An Offering's identity combines the Service origin, the Offering resource type, and its local id. Keep that ID stable while the same resource changes its name, description, imagery, price summary, or other mutable details.

- [Description](#presentation): explain what the Offering provides and what distinguishes it from nearby choices
- [Images](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): place the primary image first and reserve additional images for the Full Offering when a terse result needs only a thumbnail
- [Browser link](#presentation): use web\_url for an optional human-facing page without replacing the machine-readable Offering
- [Language](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): identify localized representations through language metadata rather than mixing translations into one field

An origin-relative image or browser path resolves within the Offering Service. Use an absolute HTTPS URL when the resource intentionally lives at another origin.

### Use terse results and full retrieval

Offering lists and searches return terse representations by default so Agents can navigate and compare a bounded page. Individual retrieval returns a Full Offering by default with every field the Service makes available for that request.

1234567891011121314151617181920212223

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "web-search",
      "name": "Web search",
      "price": {
        "type": "fixed",
        "amount": "0.01",
        "currency": "USD"
      },
      "detail_fields": [
        "/description",
        "/images",
        "/web_url",
        "/collection_ids",
        "/schema",
        "/attributes",
        "/actions"
      ]
    }
  ]
}
```

- [Required terse fields](#terse-and-full): always include id and name
- [Useful summaries](#terse-and-full): include optional fields such as the primary image or Price Preview when they improve comparison
- [Full retrieval](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/): retrieve the same resource rather than treating its full form as another Offering
- [Omitted details](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/#detail-fields): use detail\_fields when a terse result can exhaustively identify the field subtrees available in full retrieval

A terse Offering never contains actions. Retrieve the Full Offering before deciding which subsequent operation to use.

### Interpret omitted fields correctly

A Full Offering omits an optional field when the field does not apply, the Service does not have it, or the current request cannot access it. Do not use empty attributes, collection\_ids, or actions as placeholders for unused capabilities.

Terse omission

### Retrieve before concluding

A missing optional field in a terse result does not establish that the Full Offering lacks it. detail\_fields can identify known omitted subtrees.

Access expansion

### Authentication can reveal more

auth\_expands: true states that acceptable Service authentication can expose additional fields, without promising access or identifying protected data.

### Keep specialized data typed

Put Service-defined Offering data in a non-empty attributes object and identify its JSON Schema Draft 2020-12 contract through schema.url. The schema describes the complete attributes object and can be shared by multiple Offerings.

Do not move specialized values into representation-specific summary containers. A field included in a terse representation keeps the same type and meaning it has in the Full Offering. See [Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/) for schema design and validation.

### Preview price without promising settlement

The optional price object is a discovery-time summary. It can communicate that an Offering is free, has a fixed price, falls within a range, starts at an amount, uses a metered rate, or requires a later quote.

Absence does not mean free

A missing Price Preview means the Service did not advertise one. A live payment challenge, quote, or other subsequent operation remains authoritative for the amount and available settlement choices.

See [Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/) for each preview type and the boundary between discovery and payment.

### Advertise available Actions

A Full Offering can contain Actions that describe operations available after discovery. Advertising an Action tells the Agent what can be attempted; it does not invoke the operation, guarantee success, or replace the target endpoint's authentication and payment requirements.

Keep Actions out of terse Offerings, and omit actions when none apply. See [Actions](https://www.offeringprotocol.org/documentation/guides/actions/) for identifiers, targets, methods, input schemas, and resolution.

### Connect Offerings to Collections

collection\_ids records direct membership. Omit it when an Offering belongs to no Collection; otherwise provide a non-empty array of unique Collection identifiers visible under the same access context.

A search can constrain results to direct members or explicitly include descendants. That query-time expansion does not change the Offering's published membership. See [Collections](https://www.offeringprotocol.org/documentation/guides/collections/) for hierarchy and inverse membership rules.

### Choose the Offering operation

| Goal | Operation | Use |
| --- | --- | --- |
| Traverse the catalog | list-offerings | Read every accessible Offering without a search constraint. |
| Retrieve one Offering | get-offering | Obtain its Full Representation by local identifier. |
| Find matching Offerings | search-offerings | Apply text, filters, Collection scope, an advertised sort, or refinements. |
| Browse one Collection | list-collection-offerings | Read the direct members of a named Collection. |

### Next steps

Catalog queries

### Find the right Offering

Construct text searches and typed filters from advertised capabilities.

[Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/)

Subsequent operations

### Act on an Offering

Describe what an Agent can do after it selects an Offering.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

On this page

- [Choose what one Offering represents](#offering-granularity)
- [Publish a useful Full Offering](#offering-representation)
- [Make the Offering recognizable](#presentation)
- [Use terse results and full retrieval](#terse-and-full)
- [Interpret omitted fields correctly](#field-availability)
- [Keep specialized data typed](#specialized-data)
- [Preview price without promising settlement](#price-preview)
- [Advertise available Actions](#actions)
- [Connect Offerings to Collections](#collection-membership)
- [Choose the Offering operation](#choose-operation)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
