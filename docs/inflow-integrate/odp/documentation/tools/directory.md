<!-- source: https://www.offeringprotocol.org/documentation/tools/directory/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Tools

# Find a Service before searching its catalog

Use the InFlow Directory to locate candidate ODP Services by their public metadata and advertised capabilities. After selecting one, return to the Service for its current document, Collections, Offerings, and Actions.

### Use a Directory as an optional starting point

An Agent does not need a Directory when it already knows a Service origin. When the origin is unknown, the Directory provides a searchable index of public Service metadata so the Agent can identify suitable candidates before beginning direct ODP discovery.

A Directory is not an ODP protocol role, and ODP does not standardize directory queries, rankings, facets, or response formats. The commands on this page use the InFlow Directory's API and its directory client; other directories can define different discovery interfaces without changing ODP Service behavior.

### Keep the index and the catalog separate

Directory results are discovery metadata. They help choose a Service, but they do not replace a current Service Document or a response obtained directly from that Service.

Directory

### Select a candidate

Search cached Service-level descriptions, keywords, operations, and protocol support across many Services.

Service

### Read authoritative data

Retrieve the current Service Document, then follow the operations and references it advertises to authoritative Collections, Offerings, Attribute Schemas, and Action contracts.

### Understand what is indexed

The InFlow Directory projects public fields from a Service Document into a compact search result. It does not replicate the Service's Collection or Offering catalog.

| Indexed group | Examples | How an Agent uses it |
| --- | --- | --- |
| Service details | Origin, name, description, language, and localizations | Recognize the Service and identify its default language and available localizations before direct inspection. |
| Discovery hints | Keywords | Find Services by their stated subject matter without treating keywords as catalog contents. |
| Capabilities | ODP operations, enrollment, payment, payment options, trust, and MCP endpoints | Exclude Services that do not advertise a capability required by the intended workflow. |
| Public destinations | Website, documentation, support, and status URLs | Reach the Service's human-facing and operational resources. |
| Freshness | indexed\_at | Understand when the Directory last refreshed its Service metadata. |

### Search Service metadata

A free-text query searches indexed Service names, descriptions, keywords, and MCP endpoint names and descriptions. Structured filters narrow candidates by keyword, enrollment protocol, advertised ODP operation, payment protocol, or payment option. Filters describe the Service as a whole; they do not search fields inside individual Offerings.

1234

```
inflow odp directory search "AI search" \
  --keyword search \
  --operation search-offerings \
  --payment mpp:inflow --payment x402:base
```

Require every filter group

Different filter categories must all match. Multiple values inside one category are alternatives. A request for the keyword search, the operation search-offerings, and either of two accepted payment options therefore selects Services that satisfy all three categories.

### Use facets to refine Service selection

The first search page can include facet counts for matching keywords, operations, enrollment protocols, and payment protocols. Each count describes the complete matching Service set, not only the Services shown on that page.

Directory facets are not Offering-search refinements. A facet narrows which Services are candidates; a refinement comes from a selected Service's search-capability catalog and narrows Offerings within that Service.

### Complete an indexed keyword prefix

Suggestions complete a prefix from keywords in the InFlow Directory's normalized index. As Directory policy, InFlow lowercases Unicode-normalized keywords, trims their boundaries, and collapses internal whitespace; ODP itself defines no keyword normalization. The Directory orders matches by the number of published Services using each keyword. Suggestions help construct a Service filter; they do not predict natural-language queries or enumerate terms accepted by a Service's Offering search.

1

```
inflow odp directory suggest sea
```

### Continue the same search

A search page can contain an opaque next value. Pass it back unchanged to continue the exact query and filter set represented by the cursor. The continuation response omits first-page facets because those counts already describe the complete matching result set.

Do not interpret the cursor, alter it, or combine it with new search criteria. Start a new search when the query, filters, or requested limit changes.

### Interpret freshness and visibility correctly

indexed\_at records when the Directory refreshed its Service metadata. It does not promise that a Service's live catalog has remained unchanged since that time. Inspect the selected Service before relying on its current capabilities.

Public search contains Services that are published, visible, and backed by a valid ODP Service Document. Paused, disabled, hidden, or invalid entries are excluded. A missing Service therefore does not prove that its origin lacks ODP support; it can still be inspected directly.

### Treat ordering as Directory policy

For a text query, the InFlow Directory orders exact Service-name matches first, name-prefix matches second, and other indexed-text matches third; origin provides deterministic ordering within each group. Without a text query, results are ordered by origin. ODP does not define this policy, and position is not an ODP endorsement, a measure of Service quality, or a ranking of any Offering inside the Service.

### Inspect the selected Service

After selecting a candidate, use its service\_origin to retrieve the live Service Document. Verify the operations currently advertised, then request Collections, Offerings, or Actions directly from the Service.

The Directory remains public. The selected Service can require enrollment or authentication for its catalog operations and can protect later execution with MPP or x402.

### Publish by submitting an origin

Submit a Service's HTTPS origin after its public ODP integration passes validation. Acceptance makes the origin eligible for indexing; it does not copy the Service's catalog, prove Seller ownership, or transfer authority over Service metadata to the Directory.

The Directory refreshes its indexed metadata from the Service and can remove an entry from public search when the document becomes invalid or unavailable. Resubmission requests another refresh. Follow [Publish to the Directory](https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/) for the validation and submission sequence.

### Next steps

Service operators

### Publish a Service

Validate an ODP integration and submit its canonical origin for indexing.

[Publish to the Directory](https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/)

Agents and people

### Search from the terminal

Use the InFlow CLI to search the Directory and continue into direct Service discovery.

[InFlow CLI](https://www.offeringprotocol.org/documentation/tools/inflow-cli/)

On this page

- [Directory role](#role)
- [Authority](#authority)
- [Indexed metadata](#indexed-metadata)
- [Search](#search)
- [Facets](#facets)
- [Suggestions](#suggestions)
- [Pagination](#pagination)
- [Visibility](#visibility)
- [Ordering](#ordering)
- [Inspect the Service](#inspect)
- [Publication](#publication)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
