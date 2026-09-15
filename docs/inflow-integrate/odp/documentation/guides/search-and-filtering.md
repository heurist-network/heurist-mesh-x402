<!-- source: https://www.offeringprotocol.org/documentation/guides/search-and-filtering/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Build searches from advertised capabilities

Choose the correct operation and construct typed searches from the contract published by each Service and Collection.

### Choose list or search

List operations traverse an unconstrained catalog sequence. Search operations require an actual constraint and return 200 OK with an empty items array when nothing matches.

| Operation | Required constraint | Additional controls |
| --- | --- | --- |
| search-collections | query, parent\_id, or both | Optional page limit; the Service owns ordering. |
| search-offerings | query, filters, or both | Collection scope, descendant expansion, sort recipe, refinements, and page limit. |

Use list-collections, list-offerings, or list-collection-offerings when no search constraint applies. An unconstrained search request is invalid.

### Let the Service interpret text queries

query contains the caller's search text, and the Service decides how to interpret it. ODP does not standardize searchable fields, tokenization, stemming, case folding, language processing, semantic matching, or relevance.

Agents therefore preserve the caller's query and do not assume equivalent results across Services. When a request includes both text and filters, an Offering must satisfy the Service-interpreted query and every Filter Expression.

### Keep Collection search straightforward

Collection search helps an Agent find navigation groups by text or walk one level of hierarchy. It deliberately excludes Offering filters, sort recipes, and refinements because those capabilities describe Offering data rather than Collection traversal.

| Request members | Matches | Typical use |
| --- | --- | --- |
| query | Visible Collections matching Service-defined text search. | Find a group when its location in the hierarchy is unknown. |
| parent\_id: null | Collections that omit parent\_ids. | Begin navigation from the catalog roots. |
| parent\_id: id | Direct children containing the named parent ID. | Advance exactly one level through the hierarchy. |
| query and parent\_id | Collections satisfying both constraints. | Find a named concept within one immediate branch. |

The Service selects and stabilizes the result order. ODP 1.0 does not let the Agent request a Collection sort recipe. See [Collections](https://www.offeringprotocol.org/documentation/guides/collections/) for graph traversal and membership.

### Discover capabilities before filtering

search\_capabilities advertises Filter and Sort Definitions that a Service accepts. Each source is either a bounded inline array or a same-origin link to a pageable definition sequence. Filters and sorts are independent sources.

The field appears only when the Service advertises search-offerings. It can be published at Service scope or on a Full Collection for searches that explicitly name that Collection.

1234567891011121314151617181920212223242526272829303132

```
{
  "search_capabilities": {
    "filters": {
      "inline": [
        {
          "id": "result-count",
          "title": "Result count",
          "description": "Maximum results returned by the Offering.",
          "type": "integer",
          "operators": ["eq", "in", "gte", "lte"],
          "refinable": true
        }
      ]
    },
    "sorts": {
      "inline": [
        {
          "id": "most-results",
          "title": "Most results",
          "description": "Order by the largest result count.",
          "keys": [
            {
              "filter_id": "result-count",
              "direction": "descending",
              "missing": "last"
            }
          ]
        }
      ]
    }
  }
}
```

A definition belongs to one search context

A capability identifier has meaning only within its Service, operation, source, definition kind, and effective scope. Similar identifiers at different Services or scopes are not interchangeable.

An Agent retrieves and validates an entire linked source before exposing any definitions from it. A failed source is omitted from the normalized catalog without preventing text-only Offering search.

### Combine the applicable search capabilities

An Offering search without collection\_id uses only Service-wide capabilities. A search naming a Collection uses the union of Service-wide capabilities and capabilities advertised by that exact Collection.

- [Service scope](#effective-capabilities): apply Service-wide definitions first
- [Collection scope](#effective-capabilities): add definitions from only the Collection explicitly named by the request
- [Descendant expansion](#effective-capabilities): change Offering membership scope without inheriting capabilities from descendants
- [Conflicts](#effective-capabilities): remove every duplicated identifier from the usable catalog instead of choosing an override

Ancestors, descendants, and other Collections do not contribute definitions. A Sort Definition that references a missing, invalid, or conflicting Filter Definition is also unavailable, while unrelated definitions remain usable.

### Translate caller intent into a valid search

The Agent does not invent filter parameters from Offering field names. It resolves the applicable capability catalog first, then maps the caller's criteria only through definitions that survive validation.

01

### Choose the scope

Determine whether the search spans the Service or explicitly names one Collection.

02

### Resolve capabilities

Retrieve every required inline or linked source and build the valid effective catalog for that scope.

03

### Validate the criteria

Match each requested filter, operator, value, sort, and refinement to its advertised definition.

04

### Submit one request

Preserve the caller's text and send the typed expressions and selected recipes without rewriting their meaning.

### Use typed Filter Definitions

A Filter Definition declares its identifier, human-readable title and description, value type, and supported operators. It maps each Offering to zero or more scalar values without exposing how the Service stores or computes them.

| Type | Wire value | Compatible operators |
| --- | --- | --- |
| string | JSON string | eq, in, exists |
| boolean | JSON Boolean | eq, in, exists |
| integer, number | JSON integer or number | All seven core operators |
| decimal | Base-10 string without an exponent | All seven core operators |
| date, date-time | RFC 3339 date or instant | All seven core operators |

The seven core operators are eq, in, lt, lte, gt, gte, and exists. Ordered comparisons do not apply to strings or Booleans.

String filter equality is case-sensitive and performs no normalization or locale folding. A definition marked refinable: true must advertise eq, in, or both.

### Construct valid Filter Expressions

Each expression identifies an effective Filter Definition, selects one of its advertised operators, and supplies a value of the declared type. Every expression in the request combines with logical AND.

- [Scalar comparisons](#filter-expressions): eq, lt, lte, gt, and gte accept one scalar
- [Set membership](#filter-expressions): in accepts 1 through 100 unique values and matches when either set intersects
- [Presence](#filter-expressions): exists accepts a Boolean and tests whether the Offering's mapped value set is empty
- [Ranges](#filter-expressions): repeat one identifier with lower and upper comparison expressions

ODP 1.0 does not define a general Boolean tree, negation, substring matching, or regular-expression filtering. An unknown identifier, unadvertised operator, or incorrectly typed value produces an INVALID\_REQUEST problem.

### Select an advertised sort recipe

A Sort Definition is a complete ordering recipe with one through three keys. The Agent selects it by identifier and does not add, remove, reverse, or reorder those keys.

Each key references an effective Filter Definition and fixes its direction and missing-value placement. The Service appends Offering id as the final ascending tie-breaker. Omitting sort uses the Service's preferred ordering.

### Request contextual refinements

A Filter Definition marked refinable: true can produce value-count buckets for guided navigation. The initial Offering-search request names up to 16 refinable identifiers, and the initial response can return bounded groups for useful values.

A bucket count applies the query, Collection scope, access context, and every filter except expressions for that bucket's own filter. This preserves independent constraints while showing viable alternatives for the selected dimension.

1234567891011121314151617181920212223242526

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "web-search",
      "name": "Web search"
    }
  ],
  "refinements": [
    {
      "filter_id": "result-count",
      "values": [
        {
          "value": 20,
          "count": 4
        },
        {
          "value": 50,
          "count": 2,
          "count_relation": "lower_bound"
        }
      ]
    }
  ],
  "next": "/odp/offerings/search?cursor=opaque-value"
}
```

The response says that four distinct Offerings match the criteria when result-count equals 20. At least two match when it equals 50; lower\_bound prevents the Agent from presenting that second count as exact.

Counts describe the logical result set

Sorting and page limits do not affect a bucket count. An exact count omits count\_relation; a count known only as a minimum uses lower\_bound. Refinement values are contextual suggestions, not a complete enumeration of the filter's domain.

### Submit one coherent Offering search

The request below combines text intent with an advertised typed filter and sort recipe. It scopes membership to one Collection and its descendants, requests a refinement group, and bounds the first page.

123456789101112131415161718

```
{
  "odp_version": "1.0",
  "query": "market research",
  "filters": [
    {
      "id": "result-count",
      "operator": "gte",
      "value": 20
    }
  ],
  "sort": "most-results",
  "refinements": [
    "result-count"
  ],
  "collection_id": "research-tools",
  "include_descendants": true,
  "limit": 20
}
```

include\_descendants is valid only with collection\_id. It expands which Offerings can match without importing capabilities from descendant Collections or changing their direct membership.

### Distinguish no matches from an invalid request

A well-formed search that finds nothing succeeds with an empty page. A request that cannot be interpreted against the advertised contract fails with an INVALID\_REQUEST problem instead of silently ignoring the unsupported criterion.

| Invalid request | Why it fails |
| --- | --- |
| No query or filters | Offering search requires at least one constraint; use a list operation otherwise. |
| Unknown filter or sort ID | The identifier is unavailable in the effective capability catalog. |
| Unadvertised operator | The Filter Definition did not authorize that comparison. |
| Wrong value type or shape | The value does not match the filter type or the selected operator's scalar, array, or Boolean contract. |
| Descendants without a Collection | include\_descendants has no scope unless collection\_id is present. |
| Unavailable refinement | The referenced filter is missing, invalid, duplicated, or not marked refinable. |

A named Collection that does not resolve under the current access context produces 404 Not Found. The Service can use the same result when confirming that an inaccessible Collection exists would disclose protected information.

### Preserve the search across pages

The Service chooses a stable logical sequence and returns an opaque next reference when another page exists. The continuation preserves the original query, filters, sort, Collection scope, access context, representation, and effective page limit.

Follow the continuation reference as returned rather than reconstructing or editing it. Refinement groups describe the complete logical result set and can appear only on the initial response, not continuation pages. See [Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/) for traversal and refresh behavior.

### Next steps

Domain data

### Define searchable attributes

Give specialized Offering data explicit types and constraints.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Traversal

### Keep result pages stable

Follow continuation references and HTTP cache controls correctly.

[Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/)

On this page

- [Choose list or search](#list-or-search)
- [Let the Service interpret text queries](#text-query)
- [Keep Collection search straightforward](#collection-search)
- [Discover capabilities before filtering](#capability-advertisement)
- [Combine the applicable search capabilities](#effective-capabilities)
- [Translate caller intent into a valid search](#construct-search)
- [Use typed Filter Definitions](#filter-definitions)
- [Construct valid Filter Expressions](#filter-expressions)
- [Select an advertised sort recipe](#sort-recipes)
- [Request contextual refinements](#refinements)
- [Submit one coherent Offering search](#complete-search)
- [Distinguish no matches from an invalid request](#invalid-requests)
- [Preserve the search across pages](#continuations)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
