<!-- source: https://www.offeringprotocol.org/documentation/use-cases/physical-goods/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Use Cases

# Describe physical goods with ODP

Use Offerings, images, typed attributes, Price Previews, Collections, and Actions to describe physical goods. The store still handles inventory, tax, shipping, payment, and fulfillment.

### Choose what the Offering represents

Create a separate Offering for a physical choice that can be independently discovered, compared, priced, reserved, or purchased. Product identity, configuration, and availability are separate decisions; a change in any one of them does not automatically require another Offering.

- [Separate Offering](#offering-boundary): give a simple good, independently purchasable variant, or defined bundle its own Offering ID when the caller can choose and act on it separately
- [Offering attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): describe persistent characteristics such as material, color, dimensions, condition, or compatibility
- [Action input](https://www.offeringprotocol.org/documentation/guides/actions/): collect quantity, personalization, final measurements, and other values supplied for one request
- [Availability](#availability): treat stock and reservability as changing facts unless the available choice itself has a different identity

### Map common retail shapes into ODP

Begin with the choice the customer can act upon. Attach the descriptive metadata, Price Preview, and Actions that help an Agent understand that choice without reproducing the Service's internal stock-keeping or checkout model.

The rows below are illustrative examples, not exclusive product categories or a required sequence. A made-to-order bundle can combine more than one pattern. Each Action is independently advertised, and the Service's operation contract determines how a caller moves from a quote or reservation to a later purchase.

| Retail shape | Offering represents | Common Actions | Important metadata |
| --- | --- | --- | --- |
| Simple item | One independently purchasable good | purchase | Description, images, attributes, and an appropriate Price Preview |
| Size or color variant | One independently purchasable variant | purchase | Complete product and variant facts, including the Offering ID, attributes, images, and price |
| Made-to-order item | The configurable good or production service | quote, plus a separately advertised purchase Action when supported | Configuration contract, lead-time context, images, and a quoted or ranged price |
| Bundle | One defined group acquired together | purchase | Included components, Offering ID, images, and bundle price |

### Make the good recognizable

Physical goods depend on presentation that lets an Agent and a person distinguish one choice from another. Use the core Offering fields for identity and recognition before placing specialized product facts in attributes.

- [Name and description](https://www.offeringprotocol.org/documentation/guides/offerings/): identify the good and explain the characteristics that distinguish it from nearby choices
- [Images](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): publish an ordered set of views whose first descriptor identifies the primary image; reject an unusable image without discarding the others
- [Human-facing page](https://www.offeringprotocol.org/documentation/guides/offerings/): use web\_url to connect the Offering to its corresponding browser experience
- [Language](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): add Offering-level language metadata when it differs from inherited response or Service metadata, and advertise localized variants when supported

Images and browser links remain descriptive resources. Their presence does not establish inventory, reserve an item, begin checkout, or prove that the visible price is still available.

### Give purchasable variants stable identities

Give a variant its own Offering when an Agent must discover, compare, quote, reserve, purchase, or pay for it independently. The Offering ID identifies the exact variant before the Agent prepares or approves a purchase request.

Separate Offering

### Expose an actionable variant

Create another Offering when a size, color, material, capacity, condition, or package has its own price, availability, reservation, purchase target, or search identity.

Offering attribute

### Describe a non-actionable characteristic

Keep a characteristic in attributes when it helps identify or compare the good but does not represent another choice the caller can independently acquire.

Action input

### Configure the transaction

Use the Action request for values such as quantity or optional personalization when they configure the selected Offering without representing another product choice.

Do not hide materially different purchasable variants only inside the purchase request body. An Agent should be able to identify the exact Offering it selected before it approves an operation with commercial consequences.

### Describe physical characteristics with a schema

ODP does not impose a universal product taxonomy. Place domain-specific facts in the Offering's non-empty attributes object and publish a JSON Schema Draft 2020-12 document through schema.url so Agents can interpret those fields consistently.

- [Identity](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): describe manufacturer, brand, model, part identifier, condition, or another domain identifier
- [Appearance](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): type color, material, finish, pattern, and other visible characteristics
- [Measurements](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): define dimensions, weight, size system, size value, and their units without relying on prose alone
- [Compatibility](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): publish structured fit, component, platform, or application constraints that matter before purchase

The Attribute Schema validates the complete Full Offering attributes. It does not validate quantity, a shipping selection, personalization, or another caller-supplied purchase input; those values belong in the selected Action's request contract.

### Organize the catalog for useful browsing

A small catalog can expose Offerings directly. Collections become useful when stable groups such as plants, furniture, clothing, replacement parts, or seasonal assortments help an Agent narrow the catalog before comparing individual goods.

#### Collections

Create customer-facing browse paths without requiring every Offering to belong to a Collection. One Offering can appear in multiple relevant Collections; do not reproduce internal tables, warehouse partitions, or deployment structure.

#### Search

Advertise Offering search when text matching or a large catalog makes direct listing insufficient.

#### Filters

Declare searchable fields such as color, size, material, brand, condition, or price only when the Service supports them.

### Preview price without promising checkout totals

A Price Preview helps an Agent compare goods before entering a purchase flow. It is discovery metadata, not a payment authorization, final quote, or checkout total.

| Type | Physical-goods use | Do not infer |
| --- | --- | --- |
| free | Explicitly advertise that no price is required for the Offering. | That shipping, access requirements, or other conditions are absent. |
| fixed | Show one advertised display price for the item, variant, or bundle. | That the amount is the final checkout total or cannot change at execution. |
| range | Advertise inclusive bounds when configuration affects the expected price. | That every configuration is available or priced within the range indefinitely. |
| starting\_at | Show the lowest advertised starting price for a configurable good. | That the selected configuration costs the starting amount. |
| quote | State that a later operation determines current terms. | That discovery has already requested or accepted those terms. |
| Omitted price | Use when the Service does not advertise a discovery-time price. | That the Offering is free. |

The core Price Preview excludes taxes, shipping, discounts, buyer-specific terms, fees, availability, and final quote results unless the Offering explicitly states otherwise outside the core price object. The live quote or payment challenge remains authoritative.

### Treat availability as changing state

ODP does not define a core inventory count, stock reservation, or fulfillment-availability model. A Service can publish availability-related facts in typed attributes when they help discovery, but those values remain cached snapshots that can change before an Action is invoked.

Only a live operation can hold the item

An advertised reserve Action describes the ability to request a hold or allocation. Reading the Offering or seeing an item marked available does not reserve it. The Action target determines whether the resource can still be held under its current policy.

Respect authoritative HTTP cache directives and validators, and use the ODP Offering fallback only when the response supplies no freshness information. Revalidate stale metadata before presenting time-sensitive details, while treating the live reservation, quote, or purchase endpoint as the final authority.

### Advertise purchase-related Actions precisely

An Action tells an Agent what can follow discovery. It does not run while the Agent retrieves the Offering, resolves a request schema, or reads an OpenAPI operation.

| Relation | Meaning | Important boundary |
| --- | --- | --- |
| purchase | Complete a one-time acquisition. | The live operation determines current terms, authorization, and outcome. |
| reserve | Hold or allocate a resource. | A reservation does not imply purchase, payment, or fulfillment. |
| quote | Obtain current terms without completing an acquisition. | Receiving terms does not accept them or authorize payment. |

A focused GET or POST operation can use the compact HTTP target. Use an OpenAPI 3.1 operation when purchase preparation needs parameters, alternative request bodies, complex responses, or declared security. Quantity, delivery selection, or personalization can be Service-defined request fields when they configure the already selected Offering.

### Keep checkout and fulfillment outside ODP

ODP makes a physical good discoverable and advertises the operation that can follow. It does not replace the systems that calculate totals, authorize a customer, accept payment, create an order, or deliver the item.

| ODP describes | Another authority controls |
| --- | --- |
| Product or variant identity | Inventory allocation and stock mutation |
| Discovery-time Price Preview | Final tax, shipping, discount, and checkout total |
| Images and typed product attributes | Checkout presentation and order records |
| Purchase, reservation, or quote Action | Order creation, fulfillment, cancellation, and refund policy |
| Expected authentication | Credential issuance, caller authorization, and approval |
| Advertised payment support | Live payment challenge, settlement method, and completed payment |
| Delivery-related descriptive attributes | Address validation, carrier selection, tracking, and delivery |

### Move from discovery to purchase safely

Keep catalog navigation, product selection, commercial approval, and execution as separate decisions. This gives the caller a clear opportunity to inspect the exact good and operation before anything can reserve inventory or create an order.

01

### Browse or search

Use Collections, text search, and declared filters to find candidate goods without downloading the entire catalog.

02

### Retrieve the Full Offering

Inspect its images, attributes, Price Preview, Collection membership, and available Actions.

03

### Select the exact good

Choose the Offering ID for the item, variant, or bundle the caller intends to acquire.

04

### Resolve and approve the Action

Read its request contract and consequences, collect permitted inputs, and obtain explicit approval before invocation.

05

### Follow the live operation

Invoke the target and follow any [AEP](https://www.aep.foundation/), [MPP](https://mpp.dev/), [x402](https://x402.org/), checkout, and fulfillment requirements it returns.

### Next steps

Complete scenario

### Model a physical retail catalog

Follow a complete example that combines Collections, purchasable variants, images, attributes, prices, and Actions.

[Physical retail](https://www.offeringprotocol.org/documentation/examples/commerce/physical-retail/)

Execution

### Design the operation that follows

Define Action identity, relation, request inputs, response formats, access expectations, and execution safety.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

On this page

- [Offering boundary](#offering-boundary)
- [Retail shapes](#mapping)
- [Presentation](#presentation)
- [Purchasable variants](#variants)
- [Physical attributes](#attributes)
- [Catalog organization](#catalog-organization)
- [Price Preview](#pricing)
- [Availability](#availability)
- [Purchase Actions](#actions)
- [Checkout boundary](#checkout-boundary)
- [Purchase flow](#purchase-flow)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
