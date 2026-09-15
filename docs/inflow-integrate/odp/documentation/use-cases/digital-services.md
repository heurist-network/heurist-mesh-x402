<!-- source: https://www.offeringprotocol.org/documentation/use-cases/digital-services/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Use Cases

# Describe digital services with ODP

Use Offerings, typed attributes, Price Previews, and Actions to describe APIs, downloadable content, generation capabilities, and service capacity. The target application still handles execution, access, payment, and delivery.

### Choose what the Offering represents

A digital Offering represents a stable choice that an Agent can understand before execution. It can identify a callable capability, such as search or analysis, or a specific digital resource, such as a report or dataset. Generation and capacity can describe how that choice works, while a Price Preview describes its commercial terms. None of those properties defines a separate kind of Offering.

- [Callable capability](#offering-shape): use an Offering for a stable operation such as search, analysis, translation, extraction, or generation
- [Existing digital resource](#offering-shape): use an Offering for a report, dataset, media file, software artifact, or other work that already exists and can be retrieved or acquired
- [Capacity as a choice](#offering-shape): create a separate Offering for a capacity class or unit only when it must be discovered, compared, priced, or reserved independently; otherwise describe it with an attribute or Action input
- [Generated results](#offering-shape): keep an ephemeral result outside the catalog unless the Service later publishes it as a stable resource with its own Offering ID

The Offering does not have to mirror an internal endpoint, billing plan, or database record. Choose something an Agent can identify, compare with nearby choices, and evaluate before calling the underlying service.

### Map the service into ODP

Start with the thing the caller chooses, then attach the metadata and Action that explain how it can be used. The same ODP resource model works across digital domains even when their execution contracts differ.

The examples below can overlap. They illustrate common mappings rather than an exhaustive set of digital-service categories. Pricing is described separately, so any example can be free or paid.

| Example | Offering represents | Common Actions | Useful metadata |
| --- | --- | --- | --- |
| Search API | A search capability with a stable purpose and result model | invoke | Request schema, response types, result limits, and a metered or fixed Price Preview |
| Report generation | The capability that produces a report from caller inputs | invoke or quote | Input schema, output formats, expected duration, and an estimated or quoted price |
| Existing report | A specific downloadable work | download, purchase, or both | Description, image, content format, publication date, and access price |
| Compute service | A class or unit of allocatable capacity | reserve, quote, or invoke | Region, hardware class, unit, availability context, and metered pricing |

### Keep request configuration separate from the Offering

Use the Offering for the durable choice an Agent discovers. Use its attributes for characteristics of that choice, and use the Action request for values supplied for one invocation.

- [Create another Offering](https://www.offeringprotocol.org/documentation/guides/offerings/): when a mode, capacity class, dataset, or service tier must be discovered, compared, priced, or acted upon independently
- [Use attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): for persistent characteristics that describe the Offering and help Agents compare it with other choices
- [Use Action input](https://www.offeringprotocol.org/documentation/guides/actions/): for query text, output length, result count, file format, source URLs, and other values supplied for one request

This keeps search results focused on meaningful choices instead of generating a separate Offering for every possible combination of request values.

### Give specialized details stable meaning

Place domain-specific data in the Offering's non-empty attributes object and identify its JSON Schema Draft 2020-12 contract with schema.url. ODP deliberately avoids imposing one taxonomy on search APIs, content libraries, model inference, compute, and other digital services.

- [Inputs](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): describe discoverable capability characteristics such as accepted format families and advertised operating limits
- [Outputs](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): identify available result formats, quality classes, delivery modes, or retention characteristics
- [Capacity](https://www.offeringprotocol.org/documentation/guides/custom-attributes/): type regions, hardware classes, duration constraints, throughput, or usage units
- [Comparison](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/): publish values that a declared Filter or Sort Definition can address consistently across Offerings

Attributes support discovery and comparison; they do not validate the caller's individual request. Put the authoritative request fields, accepted values, and input-size constraints in the compact Action request schema or OpenAPI operation. Reuse the same Attribute Schema across Offerings that share a domain model so Agents do not have to reinterpret equivalent fields.

### Organize the catalog at the size it needs

A Service with a few distinct capabilities can expose its Offerings directly. Collections become useful when a larger catalog has stable groups that help an Agent narrow its choices, such as research tools, content libraries, model families, regions, or service tiers.

- [Direct Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/): keep a small catalog direct when every Offering is already easy to browse and compare
- [Collections](https://www.offeringprotocol.org/documentation/guides/collections/): introduce meaningful catalog groups without requiring every Offering to belong to a Collection
- [Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/): advertise only the operations and declared fields the Service actually supports, then let Agents narrow a large result set without downloading the whole catalog

Catalog structure should reflect durable choices, not the Service's internal deployment topology. A Collection is useful when the grouping helps discovery; it is unnecessary when it merely repeats an implementation detail or contains one obvious Offering.

### Preview the commercial model

A Price Preview helps an Agent compare digital Offerings before execution. Choose the type that honestly represents what is known during discovery, and leave final settlement to the authoritative quote or payment response.

| Type | Digital-service use | Do not infer |
| --- | --- | --- |
| free | Explicitly state that no price is required for the Offering. | That authentication, rate limits, or usage policy are absent. |
| fixed | Show one known display price for a report, request, license, or other acquisition. | That the amount is a payment authorization or cannot change at execution. |
| metered | Advertise a rate per request, token, record, second, byte, or another defined unit. | That ODP measures usage or calculates the final charge. |
| starting\_at or range | Give useful bounds when request configuration influences the final amount. | That a particular request has already been priced or authorized. |
| quote | State that a later operation determines current terms. | That discovery itself requests or accepts a quote. |
| Omitted price | Use when the Service does not advertise a discovery-time price. | That the Offering is free. |

The Price Preview currency is a display denomination; it does not select a payment protocol, network, rail, or settlement asset. See [Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/) for how discovery-time prices relate to live payment requirements.

### Move from discovery to execution deliberately

A digital Offering can describe an executable capability without causing it to run. Keep catalog navigation, operation selection, input preparation, approval, and invocation as distinct decisions.

01

### Discover the terse Offering

Use its identity and available summary fields to decide whether the resource is relevant.

02

### Retrieve the Full Offering

Read its complete attributes, Price Preview, and Actions under the current access context.

03

### Select and prepare an Action

Choose an advertised Action by ID, resolve its contract, and validate caller-supplied inputs without invoking it.

04

### Apply access policy and invoke

Obtain any required approval, follow live authentication and payment challenges, then interpret the successful response through the Action contract.

Discovery never invokes the capability

Retrieving an Offering, resolving a request schema, or loading an OpenAPI document must not call the Action target. Invocation begins only after the caller explicitly selects the Action and supplies or approves its inputs.

### Describe inputs and outputs honestly

The Action contract should give an Agent enough information to prepare a valid request and identify how a successful response is represented before anything executes. Choose the compact form only when it can express the operation without hiding material inputs.

Compact HTTP

### Use one focused request

Describe a GET or POST target, one optional request body, and the media types a successful response can return. A request-body schema describes only that body, not URL, header, or cookie parameters.

OpenAPI 3.1

### Expose the complete operation

Reference one operation when the contract needs parameters, multiple request alternatives, complex responses, or declared security. The case-sensitive operation\_id must resolve to exactly one Operation Object.

response\_content\_types advertises successful formats; it does not define the domain meaning of a result or constrain challenges, redirects, and errors. The live response's Content-Type remains authoritative.

### Compose access and payment at the live endpoint

An Action's authentication value communicates whether Service authentication is expected at its target. It does not create a credential or authorize execution. [AEP](https://www.aep.foundation/) can establish a reusable Service credential, while [MPP](https://mpp.dev/) or [x402](https://x402.org/) can protect the selected Action request.

Begin with the request's current authentication context and follow the live endpoint response. A protocol advertisement does not prove that every Action requires authentication or payment, and a Price Preview does not authorize either. Free catalog discovery can lead to authenticated or paid execution; protected discovery does not mean that invoking every discovered Action costs money.

When an Action targets another origin, do not forward credentials from the Offering Service. The target origin must establish its own applicable authentication and payment context.

### Keep subscription lifecycle outside ODP

ODP 1.0 does not define recurring subscriptions

ODP can make a subscription-like service discoverable and advertise an Action that enters an external subscription workflow. It does not define a standard subscribe relation, renewal schedule, cancellation contract, entitlement record, usage ledger, or recurring billing state.

Describe the discoverable service and any useful Price Preview without implying lifecycle semantics ODP does not own. The selected Action's compact contract or OpenAPI operation defines how the external workflow begins. An Agent encountering a Service-defined relation can retain it for explicit selection by ID, but must not infer its meaning or choose it automatically.

### Keep execution outside ODP

ODP makes a digital service understandable before execution. It does not replace the systems that run the capability, authorize access, settle payment, measure usage, or deliver entitlements.

| ODP describes | Another authority controls |
| --- | --- |
| Discoverable Offering ID and metadata | The successful operation's domain-specific result |
| Discovery-time Price Preview | The live quote, payment amount, and settlement choices |
| Action advertisement and expected authentication | Caller approval, credentials, authorization, and endpoint policy |
| A metered rate and its unit | Usage measurement, aggregation, and final charge calculation |
| Downloadable content metadata | Delivery entitlement, retention, and access after acquisition |

### Next steps

Execution

### Design the executable operation

Define Action identity, relation, inputs, outputs, access expectations, and execution safety.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Complete scenario

### Model a digital subscription

See how discovery can lead into a recurring service whose lifecycle remains outside ODP.

[Digital subscription](https://www.offeringprotocol.org/documentation/examples/commerce/digital-subscription/)

On this page

- [Offering shape](#offering-shape)
- [Map the service](#mapping)
- [Request configuration](#configuration)
- [Specialized details](#attributes)
- [Catalog organization](#catalog-organization)
- [Commercial model](#pricing)
- [Execution flow](#execution)
- [Action contracts](#contracts)
- [Access and payment](#access-and-payment)
- [Subscriptions](#subscriptions)
- [Execution outside ODP](#boundaries)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
