<!-- source: https://www.offeringprotocol.org/documentation/use-cases/marketplaces/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Use Cases

# Describe a multi-seller marketplace with ODP

Publish the marketplace as one branded Service while exposing the listings, seller details, search behavior, and Actions that Agents need to compare choices from multiple independent sellers.

### Define the marketplace Service

In this guide, a marketplace is a branded Service that publishes a combined catalog of listings from multiple independent sellers. The marketplace is the Service that Agents discover: its origin publishes the Service Document, its brand identifies the catalog, and its operations expose the Collections, Offerings, and Actions available through the marketplace.

Individual sellers remain participants within the marketplace catalog. Their identities and listing-specific details can be described through Offering attributes, but they are not separate ODP Services unless they independently publish ODP from their own origins.

A service aggregator uses a different integration pattern. When an aggregator gives each underlying service a dedicated origin or subdomain, each origin is its own ODP Service and publishes its own Service Document. The aggregator may help Agents locate or access those Services, but that arrangement is not the marketplace model described on this page.

A single-seller or single-provider Service is not a marketplace merely because it has a large catalog. The defining distinction is a marketplace-branded catalog containing choices from multiple independent sellers.

### Map marketplace concepts into ODP

Start with the resource an Agent needs to discover, compare, or select. Use ODP resources for the public catalog rather than copying the marketplace's internal seller, inventory, or database model.

| Marketplace concept | ODP representation | Purpose |
| --- | --- | --- |
| Marketplace | Service | Identifies the public origin and advertises the catalog operations it supports. |
| Browsing group | Collection | Organizes Offerings into stable, useful paths for navigation or search. |
| Selectable listing | Offering | Gives one discoverable choice a stable identifier, description, metadata, and available Actions. |
| Seller facts | Offering attributes and Attribute Schema | Describes seller data needed to distinguish or compare listings without adding a universal seller model to ODP. |
| Search fields | Filter Definitions | Declares the typed criteria and operators the marketplace accepts. |
| Ordering choices | Sort Definitions | Publishes complete ordering recipes the Agent can request. |
| Faceted navigation | Requested refinements | Returns useful values and counts for narrowing all Offerings matched by the current search. |
| Commercial or operational request | Action | Describes a subsequent request such as a quote, reservation, purchase, download, or invocation. |

ODP does not define a universal seller resource. A marketplace can describe seller information that matters to discovery through typed attributes while retaining its seller accounts, contracts, inventory records, and business rules outside ODP.

### Model each actionable listing as an Offering

Create a separate Offering when a listing has its own price, availability, commercial terms, or Action target. The Offering ID lets the Agent retrieve and select that exact marketplace choice before it approves a later operation.

- [Separate seller listings](#listing-identity): give each seller's listing its own Offering when the Agent can select it independently or when its price, availability, terms, or Action target differs
- [One marketplace choice](#listing-identity): use one Offering when the marketplace intentionally presents one choice and selects the seller or fulfillment path after the Agent acts
- [Request configuration](https://www.offeringprotocol.org/documentation/guides/actions/#action-contract): keep quantity, delivery preference, output format, and other per-request values in the Action input when they do not define a distinct listing

Give each independently inspectable and selectable listing its own stable Offering ID. Do not create or combine Offerings merely to mirror internal stock records, seller tables, or deployment services.

### Build useful browse paths

Use Collections for buyer-facing paths through the combined catalog, such as departments, categories, regions, audiences, or curated selections. These paths can span sellers and help an Agent narrow the catalog before it compares individual listings.

Do not make every seller a Collection by default. Publish a seller Collection only when browsing that seller is a deliberate marketplace navigation path. When seller is instead a property used to compare listings, define it as an Offering attribute and advertise a corresponding filter if the marketplace supports filtering by seller.

The [Collections guide](https://www.offeringprotocol.org/documentation/guides/collections/) explains overlapping membership, hierarchy, direct membership, descendant search, and the use of list-offerings for the complete catalog.

### Advertise the searches the marketplace supports

A combined catalog becomes practical when an Agent can discover the marketplace's accepted search inputs before constructing a request. Advertise search-offerings only when the Service implements it, then publish the Filter and Sort Definitions that apply across the Service or within a selected Collection.

- [Text query](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/#text-query): lets the Agent express what it wants while the marketplace controls matching and relevance across all sellers
- [Seller and listing filters](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/#filter-definitions): let the Agent narrow results by seller or by listing facts such as price, availability, condition, region, or fulfillment when the marketplace declares those fields
- [Sort recipes](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/#sort-recipes): let the Agent request a complete marketplace-defined order such as relevance, price, rating, or delivery estimate
- [Refinements](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/#refinements): show useful values and counts across every matching seller listing, not merely the current page

Service-wide definitions apply throughout the marketplace. Definitions published by a Collection apply only when the search explicitly names that Collection. Descendant inclusion expands Offering membership; it does not import search definitions from descendant Collections.

Use linked definition sources when the marketplace has more search definitions than belong comfortably in the Service Document or one Collection. The Agent retrieves and validates every page permitted by ODP's source limits before using any definition from it.

Attributes do not become filters automatically

An Attribute Schema explains the fields returned with an Offering. A separate Filter or Sort Definition is required before an Agent can send that field as a search criterion or ordering request.

### Return large catalogs predictably

Use Terse representations in list and search results to keep each page compact, then retrieve the Full representation of a selected Collection or Offering. Stable pagination and HTTP caching let an Agent continue through a large catalog without repeatedly downloading the same data.

| Mechanism | Marketplace use | Agent behavior |
| --- | --- | --- |
| Terse representation | Returns compact Collections or Offerings for navigation and comparison. | Treat omitted optional fields as unavailable in this representation, not absent from the corresponding Full Representation. |
| Full representation | Provides the complete description available for one selected Collection or Offering. | Retrieve it before relying on optional details omitted from a Terse result. |
| Stable ordering | Keeps one logical result sequence traversable across pages. | Preserve the Service's ordering; the Service uses the Collection or Offering ID as its final tie-breaker. |
| Continuation link | Carries the Service-selected state required for the next page. | Follow next exactly without decoding, modifying, or reconstructing its cursor. |
| HTTP cache metadata | Reduces repeated transfer of catalog data that remains reusable. | Honor cache directives and validators, then revalidate stale data before relying on changing details. |

Each ODP page contains at most 100 items. Follow the supplied next link until it is omitted rather than expecting one response to contain the complete marketplace catalog. The [Errors and limits](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/#resource-limits) page lists the response, depth, page, and linked-source limits that apply.

### Describe marketplace-specific facts

Use an Offering's attributes and Attribute Schema for facts that matter to this marketplace but do not belong in ODP's common Offering fields. The schema gives each value a type, meaning, and validation rule without turning one marketplace's model into a universal taxonomy.

- [Seller](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): describe a seller identifier, display name, marketplace-defined rating fields, or another seller fact needed to compare listings
- [Availability](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): publish discoverable availability classifications while leaving live allocation to the selected Action
- [Fulfillment](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): identify supported regions, delivery modes, response times, or other descriptive fulfillment characteristics
- [Domain details](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): define condition, service tier, format, capacity, compatibility, or other facts needed to compare listings

Keep names, descriptions, images, browser links, Price Previews, Collection membership, and Actions in their common ODP fields. Attributes extend those fields; they do not replace them.

### Connect listings to marketplace Actions

An Offering's Actions identify the operations available after an Agent selects that listing. The Action must preserve the choice the Agent actually made. If the Agent selected a seller-specific listing, the request must identify that listing unambiguously; if the marketplace chooses the seller later, the Offering must not imply otherwise.

| Action design | When to use it | Required distinction |
| --- | --- | --- |
| One target per listing | Each seller listing publishes an Action target that identifies that listing. | The target itself identifies the selected listing without additional routing data. |
| Shared target | Many listings use one marketplace operation. | The target URL or request schema includes the selected Offering ID or another unambiguous listing identifier. |
| Marketplace-selected seller | The Agent selects one marketplace Offering and the marketplace chooses the seller or fulfillment path. | The Offering does not imply that the Agent selected a particular seller. |

Choose the Action relation that describes the operation, such as quote, reserve, purchase, download, or invoke. Use the compact HTTP form for one focused request or an OpenAPI 3.1 operation when the Agent needs a declared request schema, response schema, or security requirements.

ODP does not define seller onboarding, subscriptions, payouts, disputes, checkout, fulfillment, or settlement. The marketplace application and the live Action endpoint remain responsible for those behaviors.

### Keep marketplace policy outside discovery

ODP explains what the Agent can discover and which operation can follow. The marketplace retains the policies and systems that rank listings, authorize callers, complete transactions, and manage sellers.

| ODP describes | The marketplace controls |
| --- | --- |
| Discoverable Collections and Offerings | Seller records, internal inventory, and catalog administration |
| Accepted search inputs and ordering recipes | Matching, ranking, recommendations, and personalization |
| Discovery-time Price Preview | Live price, taxes, fees, discounts, and commercial terms |
| Available Actions | Checkout, fulfillment, subscriptions, disputes, and seller settlement |
| Expected authentication and advertised payment support | Live challenges, authorization decisions, payment execution, and settlement |

### Next steps

Navigation

### Organize marketplace Collections

Define stable browse paths, direct membership, hierarchy, and Collection-constrained Offering access.

[Collections](https://www.offeringprotocol.org/documentation/guides/collections/)

Search

### Advertise searchable criteria

Publish supported text, filter, sort, and refinement behavior without exposing internal index design.

[Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/)

Data model

### Describe marketplace-specific facts

Use typed attributes for seller, fulfillment, availability, and other marketplace-specific listing data.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Scale

### Page and cache large results

Preserve stable result ordering and reuse cached responses while their HTTP freshness information permits it.

[Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/)

Complete scenario

### Build a marketplace-scale catalog

Follow a concrete example that combines Collections, linked search definitions, filters, sorting, refinements, pagination, and custom attributes.

[Marketplace-scale catalog](https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/marketplace-scale-catalog/)

On this page

- [Marketplace definition](#marketplace-definition)
- [Marketplace concepts](#mapping)
- [Actionable listings](#listing-identity)
- [Browse paths](#browse-paths)
- [Marketplace search](#search)
- [Large result sets](#large-results)
- [Marketplace attributes](#attributes)
- [Marketplace Actions](#actions)
- [Marketplace policy](#responsibilities)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
