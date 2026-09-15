<!-- source: https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Interpret catalog representations

Understand what a partial catalog result communicates, when to retrieve its full resource, and how to interpret Service-defined attributes.

### One resource, two representations

Terse and full representations describe the same Collection or Offering. Selecting a representation changes how much information is returned, not the resource's identity or data model.

Navigation and comparison

### Terse representation

Contains at least id and name, plus the optional fields the Service considers useful and economical to return.

Individual evaluation

### Full representation

Contains every ODP field the Service makes available for the request. Optional fields remain omitted when they do not apply, are unavailable, or cannot be accessed.

Terse is not another model

A Service must not move core fields or specialized attributes into a separate preview, summary, or representation-specific container.

### Select the representation

Every Collection and Offering operation accepts at most one representation query parameter. Its value is terse or full.

| Request | Result |
| --- | --- |
| List or search default | Terse representation for every item in the page envelope. |
| Individual retrieval default | Full Collection or Offering representation. |
| representation=terse | Terse representation regardless of the operation default. |
| representation=full | Full representation regardless of the operation default. |

The selection applies to page items, not to the page envelope. Repeating the parameter or using another value produces 400 Bad Request. Requesting full items does not increase the Service's page-size or response-size limits.

### Preserve field meaning

A field keeps the same name, location, type, and meaning in both representations. Volatile values can differ when the representations are generated at different times, but the contract of the field does not change.

- [Omitted fields](#detail-fields): a terse representation can leave out complete fields or members of nested objects
- [Included values](#field-meaning): an included scalar or array is not silently shortened unless that field explicitly defines summary behavior
- [Images](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): a terse resource can include only the primary image even when its full representation contains more
- [Actions](https://www.offeringprotocol.org/documentation/guides/actions/): a terse Offering omits Actions because invocation details belong to full retrieval

auth\_expands: true signals that acceptable Service authentication can expose additional fields. The field is omitted rather than set to false, and it neither promises access nor identifies protected fields.

### Understand detail fields

A terse representation can use detail\_fields to identify the minimal field subtrees that full retrieval will add. Each entry is a JSON Pointer beginning with a forward slash.

1234567891011121314

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "research-report",
      "name": "Research report",
      "detail_fields": [
        "/description",
        "/attributes",
        "/actions"
      ]
    }
  ]
}
```

detail\_fields is a non-empty array of at most 32 unique pointers. Each pointer begins with a forward slash, contains no more than 256 printable ASCII characters, and does not use the URI fragment form of a JSON Pointer.

A pointer to an omitted object or array covers its complete subtree. When present, the list is exhaustive; when a complete list would exceed its limits, the Service omits detail\_fields rather than returning an incomplete list. Absence therefore makes no claim that the full representation contains nothing more.

detail\_fields does not select returned fields

detail\_fields does not let an Agent request selected fields, grant access to full data, or reveal protected field existence to an unauthorized principal.

### Apply version and language context

Every ODP Top-Level Document carried in a request or response declares its own odp\_version. An embedded terse item inherits the version of its containing document and does not repeat it. A later individual retrieval is a new top-level response and declares its version independently.

01

### Page envelope

Declares odp\_version for the list or search response.

02

### Embedded items

Inherit that version without repeating top-level metadata.

03

### Individual retrieval

Returns a new top-level document with its own odp\_version.

Language metadata follows a similar containing-context rule. The nearest applicable metadata wins in the order Collection or Offering, containing response, then Service Document.

### Describe specialized data

An Offering uses attributes for non-empty, Service-defined structured data and schema.url to identify the JSON Schema that describes the complete attributes object. Multiple Offerings can share the same Attribute Schema.

123456789

```
{
  "schema": {
    "url": "/schemas/research-report.json"
  },
  "attributes": {
    "source_count": 20,
    "research_depth": "comprehensive"
  }
}
```

An Offering with attributes always includes its schema reference. A terse Offering can include partial attributes, but it still references the schema for the complete full object and can identify omitted attribute members through detail\_fields. When no specialized data applies, the Service omits both fields.

### Retrieve Attribute Schemas

Resolve schema.url against the Offering response URL and retrieve it with GET. Send Accept: application/schema+json and require that media type on a successful response.

- [Dialect](#schema-retrieval): the schema declares the JSON Schema Draft 2020-12 meta-schema with $schema
- [References](#schema-retrieval): process the references needed to interpret or validate the instance; cross-document references use $ref
- [Dynamic references](#schema-retrieval): $dynamicRef is supported only as a fragment beginning with #
- [Caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/): treat the schema as a mutable HTTP resource and follow its cache directives and validators

An Agent-oriented SDK should resolve and cache the reference graph it needs and return a locally complete schema representation. Its caller should not need additional network requests merely to interpret the Offering.

### Validate Full and Terse attributes differently

| Boundary | Requirement |
| --- | --- |
| Service | Validate the complete attributes object in every Full Offering against its Attribute Schema. |
| Agent using full data | Validate Full Offering attributes before relying on their specialized meaning. |
| Agent using terse data | Do not validate partial terse attributes as though they were the complete schema instance. |

Every value included in terse attributes still has the type and meaning assigned by the Attribute Schema. Partial does not mean untyped.

### Keep schema failures scoped

An unavailable, invalid, unsupported, or non-matching Attribute Schema makes the Offering's attributes uninterpretable. It does not invalidate the Offering's identity, core description, Price Preview, browser link, Collection membership, or Actions.

Keep the useful Offering

An Agent-oriented SDK should omit uninterpretable attributes from its normalized result and report a scoped issue separately. That issue belongs to the SDK result, not to the ODP wire document.

### Next steps

Domain data

### Define custom attributes

Design specialized Offering data and the Attribute Schema that describes it.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Retrieval

### Traverse and refresh resources

Retrieve pages and refresh mutable schemas correctly.

[Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/)

On this page

- [One resource, two representations](#two-representations)
- [Select the representation](#selection)
- [Preserve field meaning](#field-meaning)
- [Understand detail fields](#detail-fields)
- [Apply version and language context](#document-context)
- [Describe specialized data](#specialized-data)
- [Retrieve Attribute Schemas](#schema-retrieval)
- [Validate Full and Terse attributes differently](#validation-boundary)
- [Keep schema failures scoped](#schema-failures)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
