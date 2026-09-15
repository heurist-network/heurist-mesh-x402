<!-- source: https://www.offeringprotocol.org/documentation/examples/commerce/physical-retail/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Physical retail

See how a retailer publishes one exact travel-mug variant with an image, a Price Preview, inventory and fulfillment metadata, and an authenticated quote Action. The retailer's systems remain responsible for the transaction.

### What this Offering represents

The travel-mug-20oz-blue Offering represents one blue 20-ounce travel mug. It is not a general record for every mug variation. An Agent can discover this exact variant, present its advertised details, and request current terms without inventing a separate option-selection model.

| Field | Value | Purpose |
| --- | --- | --- |
| id | travel-mug-20oz-blue | Identifies this exact variant within the Service. |
| web\_url | /products/travel-mug-20oz-blue | Links to the human-facing page at the Service Origin. |
| price | 34.95 USD | Provides one discovery-time item price. |
| schema | physical-retail-3.json | Defines the types and constraints of the retail attributes. |
| actions | request-quote | Advertises the operation that returns current terms. |

12345678910111213141516171819202122232425262728293031323334353637383940414243444546474849505152535455565758596061

```
{
  "odp_version": "1.0",
  "id": "travel-mug-20oz-blue",
  "name": "Insulated travel mug, 20 oz, blue",
  "description": "A vacuum-insulated stainless-steel travel mug with a leak-resistant lid.",
  "images": [
    {
      "alt": "Blue 20-ounce insulated travel mug",
      "height": 1200,
      "src": "/images/products/travel-mug-20oz-blue.webp",
      "type": "image/webp",
      "width": 1200
    }
  ],
  "web_url": "/products/travel-mug-20oz-blue",
  "price": {
    "type": "fixed",
    "amount": "34.95",
    "currency": "USD"
  },
  "schema": {
    "url": "https://retail.example/schemas/physical-retail-3.json"
  },
  "attributes": {
    "sku": "MUG-20-BLU",
    "brand": "Northstar",
    "color": "blue",
    "capacity_ml": 591,
    "tax_classification": "general-merchandise",
    "inventory": {
      "region": "US-CA",
      "status": "in_stock",
      "observed_at": "2026-08-01T18:30:00Z"
    },
    "fulfillment": {
      "shipping_supported": true,
      "pickup_supported": true
    }
  },
  "actions": [
    {
      "id": "request-quote",
      "rel": "quote",
      "description": "Request current inventory, tax, shipping or pickup options, and final price.",
      "http": {
        "href": "/quotes",
        "method": "POST",
        "request": {
          "content_type": "application/json",
          "schema": {
            "url": "https://retail.example/schemas/retail-quote-request-2.json"
          }
        },
        "response_content_types": [
          "application/json"
        ]
      },
      "authentication": "required"
    }
  ]
}
```

### Identify each purchasable variant

The color and capacity identify the item a buyer can act on. If a red mug or a 16-ounce mug can be independently referenced, quoted, or purchased, the retailer publishes it as another Offering with its own ID.

Keep the selected item unambiguous

The caller selects an Offering before selecting one of its Actions. A quote for this Offering therefore concerns the blue 20-ounce variant; the Action does not need an additional color or capacity selector to identify the item.

### Present the product image

The first entry in the ordered images array is the primary image. Its src resolves against the Service Origin, alt describes the subject, and width and height report intrinsic pixel dimensions. The optional type hints that the resource is a WebP image before it is fetched; the live response remains authoritative.

Images are standard Offering metadata. An Agent retrieves them anonymously and must not attach Service credentials, payment credentials, cookies, or caller authorization. It can present them without interpreting the retailer's Attribute Schema, but an image does not reserve an item or promise that the pictured item remains available.

### Describe the merchandise

The retailer's Attribute Schema gives the item-specific fields a defined shape. These are Service-owned attributes rather than a universal ODP merchandise model.

| Attribute | Example | Meaning in this schema |
| --- | --- | --- |
| sku | MUG-20-BLU | The retailer's stock-keeping identifier. |
| brand | Northstar | The advertised manufacturer or brand. |
| color | Blue | The color of this purchasable variant. |
| capacity\_ml | 591 | The capacity in the schema-declared milliliter unit. |
| tax\_classification | general-merchandise | An input to the retailer's tax process, not an ODP tax category. |

### Treat inventory as a snapshot

The Offering reports that the item was in\_stock in US-CA at 2026-08-01T18:30:00Z. The region and observation time give the status necessary context.

This snapshot helps an Agent evaluate the item during discovery. It does not reserve inventory or guarantee availability when the buyer later requests a quote or completes a purchase. In this example, the quote response supplies current availability.

### Advertise possible fulfillment

shipping\_supported: true and pickup\_supported: true state that the retailer supports both fulfillment categories for this Offering. They do not promise that a particular address is serviceable or that a particular store has pickup inventory.

The quote operation evaluates the buyer's actual delivery or pickup request. ODP publishes the supported categories so an Agent can decide whether asking for current terms is worthwhile.

### Separate the preview from the quote

The fixed Price Preview advertises an item price of 34.95 USD. It is not an invoice, payment instruction, inventory guarantee, or calculation of the buyer's final total.

The quote determines current availability, applicable tax, shipping or pickup choices, and the final price for the buyer's circumstances. If the quote or a later live payment requirement differs from the preview, the Agent uses and presents the authoritative value.

### Request current terms

The caller explicitly selects request-quote before the Agent invokes its compact HTTP target. The Action posts a JSON request to an origin-relative URL and expects a successful JSON response.

| Field | Value | Meaning |
| --- | --- | --- |
| rel | quote | Obtains current terms without purchasing the mug. |
| href | /quotes | Resolves against the Service Origin. |
| method | POST | Submits the caller-approved quote request. |
| content\_type | application/json | Declares the request-body media type. |
| authentication | required | Requires Service authentication before the quote can succeed. |

The retail.example request-schema URL is illustrative, and that schema is not included with this example. A deployed Service must publish the referenced schema so an Agent can determine the required quote inputs before sending the request.

### Follow discovery to quote

The ODP flow ends with current terms, not a completed purchase.

01

### Discover the exact variant

Find the blue 20-ounce mug through the Service's Offering operations.

02

### Retrieve the Full Offering

Read the image, Price Preview, Attribute Schema reference, retail attributes, and quote Action.

03

### Evaluate the snapshot

Present the exact variant and qualify its inventory and fulfillment metadata with their limits.

04

### Request a quote

After caller selection, authenticate and submit inputs that satisfy the advertised request schema.

05

### Present current terms

Use the live quote response for availability, fulfillment choices, taxes, and final price. Do not infer a purchase.

### Keep retail operations outside ODP

ODP publishes discovery metadata and identifies the operation that requests current terms. The retailer's application owns inventory updates, address validation, tax calculation, shipping rates, pickup eligibility, orders, payment, returns, and fulfillment.

The quote Action does not purchase the mug. Any subsequent purchase or payment follows a separately advertised or Service-defined contract and the live responses from that endpoint.

### Inspect the example artifacts

The example domains and inventory timestamp are illustrative. A deployed Service must host the referenced schemas, image, web page, and Action target and keep their metadata current.

- [Generated example](https://www.offeringprotocol.org/examples/physical-retail/): open the published physical retail example and its source files
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/physical-retail/travel-mug-offering.json): inspect the variant, retail attributes, and quote Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/physical-retail/physical-retail-attributes.schema.json): inspect the types and constraints applied to the retail attributes

### Next steps

Commercial terms

### Describe price and payment

Separate discovery-time prices from quotes and live payment requirements.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

Execution

### Define another operation

Choose a compact HTTP target or an OpenAPI operation for the next Action.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

On this page

- [What this Offering represents](#offering)
- [Identify each purchasable variant](#variants)
- [Present the product image](#image)
- [Describe the merchandise](#merchandise)
- [Treat inventory as a snapshot](#inventory)
- [Advertise possible fulfillment](#fulfillment)
- [Separate the preview from the quote](#price)
- [Request current terms](#quote)
- [Follow discovery to quote](#flow)
- [Keep retail operations outside ODP](#boundaries)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
