<!-- source: https://www.offeringprotocol.org/documentation/guides/custom-attributes/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Describe domain-specific attributes

Add structured domain-specific data to an Offering and describe that data with a reusable JSON Schema.

### Extend an Offering without changing ODP

ODP defines common fields for an Offering's ID, presentation, Collections, price, and Actions. A Service places domain-specific data in attributes instead of adding private fields to the Offering or waiting for the core protocol to model every industry.

| Core Offering fields | Service-defined attributes |
| --- | --- |
| ID, name, description, images, browser URL, Collection membership, Price Preview, and Actions. | Specifications such as accelerator model, memory, deployment region, material, dimensions, itinerary details, or subscription limits. |

Do not duplicate a core value inside attributes. An Agent should not have to decide whether a custom price, image, action, or display name overrides the corresponding ODP field.

### Publish attributes with their schema

attributes is a non-empty JSON object. Whenever it is present, the Offering also contains schema with exactly one url member identifying the Attribute Schema. A Service with no domain-specific data omits both fields rather than publishing empty objects.

123456789101112131415161718

```
{
  "odp_version": "1.0",
  "id": "a100-80gb-us-west",
  "name": "Dedicated NVIDIA A100 80 GB rental",
  "schema": {
    "url": "https://compute.example/schemas/gpu-rental-1.json"
  },
  "attributes": {
    "accelerator": {
      "manufacturer": "NVIDIA",
      "model": "A100",
      "count": 1,
      "memory_per_device_gib": 80
    },
    "region": "us-west-2",
    "network_egress_gbps": 25
  }
}
```

Use the schema response as the source

The schema reference does not repeat a media type, JSON Schema version, digest, or cache metadata. The schema response and its HTTP metadata authoritatively describe the retrieved resource.

### Describe the complete attribute object

An Attribute Schema is a [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) document that validates the complete attributes object. Its property types and constraints give unfamiliar data a precise contract; titles, descriptions, and examples help an Agent present that data to a caller.

12345678910111213141516171819202122232425262728293031323334353637383940414243444546

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://compute.example/schemas/gpu-rental-1.json",
  "title": "GPU rental attributes",
  "description": "Service-defined attributes for rentable accelerator capacity.",
  "type": "object",
  "required": ["accelerator", "region"],
  "additionalProperties": false,
  "properties": {
    "accelerator": {
      "type": "object",
      "required": [
        "manufacturer",
        "model",
        "count",
        "memory_per_device_gib"
      ],
      "additionalProperties": false,
      "properties": {
        "manufacturer": {
          "type": "string",
          "title": "Accelerator manufacturer"
        },
        "model": {
          "type": "string",
          "title": "Accelerator model"
        },
        "count": {
          "type": "integer",
          "minimum": 1
        },
        "memory_per_device_gib": {
          "type": "number",
          "exclusiveMinimum": 0
        }
      }
    },
    "region": {
      "type": "string"
    },
    "network_egress_gbps": {
      "type": "number",
      "minimum": 0
    }
  }
}
```

Several Offerings can reference the same Attribute Schema when they share one contract. Reuse keeps interpretation consistent without making the schema immutable or coupling resource identity to a schema URL.

### Retrieve the Attribute Schema

An Agent resolves schema.url against the Offering response URL and retrieves it with GET. An origin-relative reference stays at the Service origin, while an absolute HTTPS URL can deliberately identify another origin.

Agent request

12

```
GET /schemas/gpu-rental-1.json HTTP/1.1
Accept: application/schema+json
```

Service response

123

```
HTTP/1.1 200 OK
Content-Type: application/schema+json
Cache-Control: max-age=86400
```

The Agent should request application/schema+json. A successful response must use that media-type essence and must declare the Draft 2020-12 meta-schema through $schema. A missing, malformed, differently typed, or invalid document is unusable as an Attribute Schema.

Retrieve supporting schemas safely

Attribute Schema retrieval is anonymous. An Agent must not attach cookies, AEP credentials, payment credentials, caller authorization fields, or secrets from the referring request. It validates every destination as a permitted public network address, rejects cross-origin redirects and transport downgrades, and repeats destination validation for each connection, retry, and redirect.

### Process references and vocabularies

$id and $ref retain their standard JSON Schema meanings. An Agent processes every referenced document needed to interpret or validate the attributes and applies one bounded retrieval policy to the complete graph.

- [$ref](#references-and-vocabularies): can identify another schema document using normal Draft 2020-12 resolution rules
- [$dynamicRef](#references-and-vocabularies): is supported only as a fragment reference beginning with #
- [Required vocabularies](#references-and-vocabularies): make the schema unsupported when the Agent cannot implement one of them
- [Optional vocabularies](#references-and-vocabularies): follow normal JSON Schema handling together with unknown keywords

An Agent-oriented SDK should return a locally complete schema representation. Its caller should not need to discover unresolved references and perform additional network requests merely to understand the Offering.

### Validate the Full representation

A Service must validate every complete attributes object in a Full Offering against its Attribute Schema. An Agent should validate Full attributes before using them for comparison, policy, presentation, or Action selection.

Validate the complete instance

Schema validation establishes whether the Service-defined data follows its advertised contract. It does not validate unrelated ODP fields, authorize an Action, or replace a live authentication or payment requirement.

### Do not validate a Terse fragment as complete

A Terse Offering may include a partial view of nested attributes. When it does, it still includes schema, but that schema describes the complete Full Offering attributes rather than the partial object in the summary.

12345678910111213141516171819

```
{
  "id": "a100-80gb-us-west",
  "name": "Dedicated NVIDIA A100 80 GB rental",
  "schema": {
    "url": "https://compute.example/schemas/gpu-rental-1.json"
  },
  "attributes": {
    "accelerator": {
      "model": "A100"
    }
  },
  "detail_fields": [
    "/attributes/accelerator/manufacturer",
    "/attributes/accelerator/count",
    "/attributes/accelerator/memory_per_device_gib",
    "/attributes/region",
    "/attributes/network_egress_gbps"
  ]
}
```

detail\_fields identifies recursively omitted fields that are available through Full retrieval. Every included value keeps the type and meaning defined by the Attribute Schema, but the partial object must not be validated as though omitted required properties were absent from the complete Offering.

When present, detail\_fields must exhaustively identify the minimal omitted subtrees with no more than 32 unique JSON Pointers. A pointer to an omitted object or array covers that complete subtree. If an exhaustive list would exceed the limit, omit detail\_fields rather than publishing a partial list.

### Advertise search capabilities separately

An Attribute Schema explains serialized Offering data. It does not automatically make properties searchable, sortable, filterable, or available through field projection. Those capabilities are advertised separately for each applicable operation and scope.

A Filter Definition can map to a core field, a custom attribute, computed catalog data, or an external index. The definition exposes the supported input contract, not an internal storage path, so an Agent must not derive filters from schema property names.

See [Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/) for capability advertisement, filter definitions, sorting, and refinements.

### Cache schemas as mutable resources

An Attribute Schema is an ordinary mutable HTTP resource. Cache directives and validators are authoritative; the URL and a previously retrieved copy do not make it immutable. When the response supplies no freshness information, the configurable ODP fallback is 24 hours.

| Boundary | Limit |
| --- | --- |
| One Attribute Schema | 262,144 decoded bytes |
| Complete reference graph | 1,048,576 decoded bytes |
| Documents in one graph | 16 |
| Reference depth | 8 |
| Redirects per resource | 5 |

Schema caches remain partitioned by authentication context. An authenticated schema response is not reused for an anonymous request or for another authentication context, even when the URL is identical.

### Keep schema failures narrow

An unavailable, invalid, unsupported, or non-matching Attribute Schema makes only attributes uninterpretable. The Offering's identity, descriptive fields, Price Preview, browser URL, Collection membership, and Actions remain usable.

An Agent-oriented SDK should omit uninterpretable attributes from its normalized result and report a scoped issue separately. That result shape belongs to the SDK contract; the Service does not add an issues member to the ODP wire representation.

### Keep custom data dependable

- [Model](#extension-boundary): keep common discovery semantics in ODP fields and place only domain-specific data in attributes
- [Describe](#schema-contract): publish types, constraints, titles, and descriptions that make unfamiliar values interpretable
- [Validate](#full-validation): validate complete attributes at the Service and before an Agent relies on them
- [Cache](#schema-caching): honor HTTP metadata and bound the entire reference graph
- [Isolate](#failure-isolation): keep a schema failure from discarding unrelated Offering capabilities

### Next steps

Resource contract

### Complete the Offering

Combine custom data with the Offering's stable ID, presentation, pricing, and Actions.

[Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

Wire behavior

### Handle partial representations

Apply Terse and Full rules without mistaking omitted detail for absent data.

[Representations and schemas](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/)

On this page

- [Extension boundary](#extension-boundary)
- [Attributes and schema](#attribute-pair)
- [Schema contract](#schema-contract)
- [Schema retrieval](#schema-retrieval)
- [References and vocabularies](#references-and-vocabularies)
- [Full validation](#full-validation)
- [Terse attributes](#terse-attributes)
- [Search boundary](#search-boundary)
- [Schema caching](#schema-caching)
- [Failure isolation](#failure-isolation)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
