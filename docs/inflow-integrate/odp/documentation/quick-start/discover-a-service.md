<!-- source: https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Quick start

# Discover a Service and its Offerings

Find a Service, inspect its advertised operations, and retrieve a complete Offering from its catalog.

### Start with a Service origin

ODP navigation starts from a Service origin. If the Agent already knows the origin, it can inspect the Service directly. Otherwise, it can use a directory or another trusted source to find candidate origins.

#### Known origin

Use the origin directly, such as https://demo.inflowpay.ai. Do not substitute a website page, Offering URL, or endpoint base.

#### Unknown origin

Search the Directory for Services whose public metadata matches the Agent's need, then select the service\_origin member from one result. This member belongs to the Directory response; it is not declared by the Service Document.

### Find a Service in the Directory

Search the Directory with a Service-level query or filters. The result describes matching Services and returns the canonical origin needed for direct ODP navigation.

1

```
inflow odp directory search search
```

Directory search returns Services

Select a Service from the Directory results, then retrieve its current Service Document and catalog directly from its origin.

### Inspect the Service Document

Inspect the selected origin before constructing a catalog request. The command retrieves and validates the current Service Document, resolves its endpoint base, and displays the operations and access requirements the Service advertises.

1

```
inflow odp inspect https://demo.inflowpay.ai
```

### Choose an advertised operation

Select the operation that matches the Agent's immediate goal. An Agent must not probe an operation that the Service Document does not advertise.

| Goal | Operation |
| --- | --- |
| Browse all Offerings | list-offerings |
| Search Offerings | search-offerings, only when advertised |
| Browse catalog groups | list-collections, only when advertised |
| Retrieve a known Offering | get-offering |

When search-offerings is unavailable, use list-offerings for an unconstrained sequence. Do not infer a search endpoint from another Service or from a familiar URL pattern.

### Browse or search Offerings

Listing is supported by every conformant Service. Search is an optional alternative for a Service that advertises it. Both operations return Terse Offerings intended for navigation and comparison.

123

```
inflow odp offerings list https://demo.inflowpay.ai

inflow odp offerings search https://demo.inflowpay.ai web
```

Preserve each returned Offering identifier exactly. The identifier belongs to the Service and is the value used by get-offering.

### Retrieve the selected Offering

Use a returned identifier to retrieve the Full Offering. The response can include descriptions, images, pricing previews, custom attributes, and available Actions in addition to the fields shown in its Terse representation.

1

```
inflow odp offerings get https://demo.inflowpay.ai search
```

### Continue paginated results

A list or search response can include an opaque next value. In interactive output, use the continuation command printed by the CLI. In structured output, pass the value back through --next without parsing, editing, or reconstructing it.

A non-empty page is not the end condition

Continue while the response includes next. The sequence ends only when the final page omits it.

### Review an Action before invocation

A Full Offering can advertise Actions that identify what may happen after discovery. Resolving an Action is read-only: it produces the target request contract without invoking the target.

1

```
inflow odp actions resolve https://demo.inflowpay.ai search invoke
```

Review the resolved method, URL, content type, and request schema before constructing a request. Enrollment, authentication, and payment are handled by the protocols protecting the target; discovering or resolving the Action does not perform them.

### Next steps

Catalog model

### Understand Offering details

Learn how Terse and Full Offerings represent the resources an Agent can select.

[Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

Tool reference

### Explore the complete CLI

Review directory filters, Collection navigation, Offering search, and structured output.

[InFlow CLI](https://www.offeringprotocol.org/documentation/tools/inflow-cli/)

On this page

- [Start with a Service origin](#service-origin)
- [Find a Service in the Directory](#directory-search)
- [Inspect the Service Document](#inspect-service)
- [Choose an advertised operation](#select-operation)
- [Browse or search Offerings](#navigate-offerings)
- [Retrieve the selected Offering](#retrieve-offering)
- [Continue paginated results](#continuations)
- [Review an Action before invocation](#action-boundary)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
