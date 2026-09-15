<!-- source: https://www.offeringprotocol.org/documentation/examples/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Learn from practical ODP examples

Use focused scenarios to see how ODP resources and features work together. Some examples trace a complete discovery path, while others focus on modeling decisions involving pricing, attributes, or Actions. Choose the closest example and adapt its decisions to your own Service.

### How to use these examples

01

### Choose the closest scenario

Start with the example closest to the feature or modeling problem you need to understand. It does not need to match your entire business.

02

### Inspect the example

Read the Service Document, Collection, Offering, or Attribute Schema included by the example. Inspect Actions inside Full Offerings, then trace each URL or identifier to the operation or resource it names.

03

### Adapt the model, not the identifiers

Preserve the demonstrated resource relationships and modeling decisions. Replace the sample names, identifiers, URLs, and Service-owned attribute fields with values from your application.

Examples are non-normative

These examples illustrate design decisions; they do not add requirements to ODP or define ODP profiles. One Service can combine protected discovery, physical goods, subscriptions, custom attributes, and large-catalog navigation when those features apply. The groups on this page help readers navigate the examples; they do not define exclusive kinds of Service.

### Establish the foundation

Use Minimum Service to see the two required public operations with representative responses. Use Protected discovery to see how advertised authentication and live access or payment challenges affect requests to catalog operations.

| Example | What it teaches |
| --- | --- |
| [Minimum Service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) | A complete example of the required public operations: a Service Document that advertises list-offerings and get-offering, one Offering page, and one Full Offering. |
| [Protected discovery](https://www.offeringprotocol.org/documentation/examples/foundations/protected-discovery/) | How a Service advertises AEP enrollment, authentication requirements, and payment support, and how live HTTP 401 or 402 responses tell the Agent what it must do before retrying a catalog operation. |

### Add a commerce pattern

These examples show how ODP describes free downloads, recurring plans, and physical goods. A single Service can publish Offerings that use more than one of these patterns.

| Example | Start here when | Main decisions demonstrated |
| --- | --- | --- |
| [Free digital Offering](https://www.offeringprotocol.org/documentation/examples/commerce/free-digital-offering/) | You need to describe a downloadable file whose Offering advertises a free Price Preview and a download operation. | An explicit free Price Preview, metadata for PDF and Markdown representations, and a compact Action that requires no authentication and advertises a PDF response. |
| [Digital subscription](https://www.offeringprotocol.org/documentation/examples/commerce/digital-subscription/) | You need to make a recurring plan discoverable while another system manages the subscription. | A fixed annual Price Preview advertises the plan amount, and an OpenAPI quote Action identifies the operation used to request current terms. The subscription system handles account creation, billing, payment, renewal, cancellation, and entitlement enforcement. |
| [Physical retail](https://www.offeringprotocol.org/documentation/examples/commerce/physical-retail/) | Agents need to discover a physical good and request current commercial terms before checkout. | Each independently purchasable variant is a separate Offering with its own images, typed attributes, and fixed Price Preview. A protected quote Action identifies where to request current terms; the retailer's systems handle checkout and fulfillment. |

### Apply ODP to specialized scenarios

Use these examples to see how a Service describes domain-specific attributes, metered capacity, or navigation through a large catalog.

| Example | Start here when | Main decisions demonstrated |
| --- | --- | --- |
| [Flight itinerary](https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/flight-itinerary/) | Offerings contain travel-specific fields that ODP does not define. | Nested travel attributes, a starting\_at Price Preview, and an OpenAPI-described quote Action. |
| [GPU rental](https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/gpu-rental/) | The Service offers metered infrastructure capacity whose availability and price must be confirmed before use. | Capacity attributes, a metered Price Preview, request configuration, and a protected quote Action. |
| [Marketplace-scale catalog](https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/marketplace-scale-catalog/) | A marketplace brand needs scalable discovery across a combined catalog containing listings from multiple independent sellers. | Collections, contextual search and filters, pagination, refinements, Terse and Full Offerings, and a Service-owned Attribute Schema. |

### Documentation and artifacts

Each documentation example explains the modeling decisions and how its resources connect. The generated example catalog provides the corresponding standalone JSON documents for inspection and implementation reference.

- [Example documentation](#foundations): choose a scenario on this page when you need to understand its design and resource relationships
- [Generated example files](https://www.offeringprotocol.org/examples/): open the concise artifact catalog when you need standalone JSON documents
- [Validator and conformance](https://www.offeringprotocol.org/documentation/tools/validator-and-conformance/): check a deployed Service or see which ODP requirements the conformance suite tests

### Next steps

Foundation

### Review the minimum example

Review the Service Document and representative responses for the two required operations before adding Collections, search, prices, attributes, schemas, or Actions.

[Minimum Service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/)

Implementation

### Design your implementation

Connect ODP resources and operations to an existing application.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [How to use the examples](#use-examples)
- [Establish the foundation](#foundations)
- [Add a commerce pattern](#commerce)
- [Apply ODP to specialized scenarios](#specialized-scenarios)
- [Documentation and artifacts](#documentation-and-artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
