<!-- source: https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/flight-itinerary/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Flight itinerary

See how a travel Service describes one scheduled flight and directs an Agent to an authenticated quote operation. ODP makes the itinerary discoverable; the travel Service remains responsible for availability, fares, booking, payment, and ticketing.

### What this Offering represents

The IF123-2026-09-14-SFO-JFK Offering represents InFlow Air flight 123 from San Francisco to New York on September 14, 2026, in economy cabin. It does not represent every flight between the two cities or every departure operated under flight number 123.

| Field | Value | Purpose |
| --- | --- | --- |
| id | IF123-2026-09-14-SFO-JFK | Identifies this scheduled itinerary within the Service. |
| web\_url | /flights/IF123-2026-09-14-SFO-JFK | Links to the human-facing flight page at the Service Origin. |
| price | Starting at 199.00 USD | Provides the lowest advertised starting price during discovery. |
| schema | flight-itinerary-1.json | Defines the types and constraints of the travel attributes. |
| actions | request-quote | Identifies the operation that returns current traveler-specific terms. |

1234567891011121314151617181920212223242526272829303132333435363738394041424344

```
{
  "odp_version": "1.0",
  "id": "IF123-2026-09-14-SFO-JFK",
  "name": "InFlow Air 123 from San Francisco to New York",
  "description": "A nonstop scheduled flight offered in economy cabin.",
  "web_url": "/flights/IF123-2026-09-14-SFO-JFK",
  "price": {
    "type": "starting_at",
    "amount": "199.00",
    "currency": "USD"
  },
  "schema": {
    "url": "https://travel.example/schemas/flight-itinerary-1.json"
  },
  "attributes": {
    "operating_carrier": "IF",
    "flight_number": "123",
    "departure": {
      "airport": "SFO",
      "scheduled_at": "2026-09-14T08:30:00-07:00",
      "terminal": "1"
    },
    "arrival": {
      "airport": "JFK",
      "scheduled_at": "2026-09-14T17:05:00-04:00",
      "terminal": "5"
    },
    "cabin": "economy",
    "included_checked_bags": 1,
    "refundable": false
  },
  "actions": [
    {
      "id": "request-quote",
      "rel": "quote",
      "description": "Request current traveler-specific availability, fare, taxes, and conditions.",
      "openapi": {
        "url": "https://travel.example/openapi.json",
        "operation_id": "createFlightQuote"
      },
      "authentication": "required"
    }
  ]
}
```

### Identify each scheduled itinerary

Publish another Offering when a departure, cabin, or other choice can be independently retrieved, quoted, reserved, or purchased. This lets an Agent select an exact itinerary before it chooses an Action.

Treat the ID as an identifier

The example ID contains a flight number, date, and route because that format is useful to this Service. An Agent treats the complete value as an opaque Local Resource Identifier. It does not parse the ID to recover flight details; those details come from the Offering attributes.

### Preserve places and local times

The departure and arrival objects keep each airport together with its scheduled time and optional terminal. The Attribute Schema constrains airport values to three-letter International Air Transport Association location codes and requires each scheduled time to use the JSON Schema date-time format.

| Event | Airport | Scheduled time | Terminal |
| --- | --- | --- | --- |
| Departure | SFO | 2026-09-14T08:30:00-07:00 | 1 |
| Arrival | JFK | 2026-09-14T17:05:00-04:00 | 5 |

The UTC offsets are part of the scheduled values. An Agent preserves them when displaying or comparing the itinerary rather than treating both clock readings as if they used the same offset.

### Describe the flight

ODP does not define airline-specific fields. The Service's Attribute Schema defines this Offering's carrier, flight number, departure, arrival, cabin, baggage, and refundability fields. Another travel Service can use a different schema for its own catalog.

| Attribute | Example | Meaning in this schema |
| --- | --- | --- |
| operating\_carrier | IF | The two-character airline designator of the operating carrier. |
| flight\_number | 123 | The carrier-assigned flight number without the carrier designator. |
| cabin | economy | The cabin advertised for this itinerary. |
| included\_checked\_bags | 1 | The checked bags included before traveler-specific exceptions. |
| refundable | false | The advertised fare class does not permit a refund under its fare rules. |

An Agent should validate the attributes against this schema before relying on them. If the schema is unavailable, invalid, unsupported, or does not match the attributes, the Agent treats the attributes as uninterpretable while retaining the Offering's identity, description, Price Preview, web page, and Actions.

### Qualify baggage and refundability

The baggage count and refundability flag describe the fare presented during discovery. They are not universal promises for every traveler. Loyalty status, traveler type, route rules, or a different available fare can affect the terms returned by the quote operation.

An Agent presents these values with the Offering and uses the later quote for the terms that apply to the traveler's request. It must not convert refundable: false into a broader statement that the flight has no refundable fares.

### Present a starting price

The starting\_at Price Preview states that the lowest advertised starting price is 199.00 USD. It helps an Agent compare the itinerary during discovery, but it does not promise that this fare remains available for a particular traveler.

Use the quote for the current total

A Price Preview excludes taxes, fees, buyer-specific terms, and final quote results unless the Offering explicitly states otherwise. The live quote response supplies the authoritative fare, availability, taxes, and conditions for the request.

### Request a traveler-specific quote

The request-quote Action identifies the createFlightQuote operation in an OpenAPI 3.1 document. OpenAPI is appropriate here because traveler inputs, availability, fare details, taxes, conditions, and the response structure require a fuller interface description than a compact Action target provides.

| Field | Value | Meaning |
| --- | --- | --- |
| id | request-quote | The stable Action ID selected by the caller. |
| rel | quote | Requests current terms without completing a booking or purchase. |
| url | https://travel.example/openapi.json | Locates the OpenAPI document for this Action. |
| operation\_id | createFlightQuote | Selects exactly one operation in that document. |
| authentication | required | Requires Service authentication before the quote operation can succeed. |

The example OpenAPI URL is illustrative. A deployed Service must publish an OpenAPI 3.1 document containing exactly one operation whose operationId is createFlightQuote. An Agent does not guess another operation if that lookup fails or is ambiguous. It interprets a successful quote response according to that OpenAPI operation, not as an ODP Offering response.

### Retrieve OpenAPI without credentials

An Agent retrieves the OpenAPI document anonymously. It must not attach [AEP](https://www.aep.foundation/) credentials, payment credentials, cookies, or authorization copied from the Offering request. The document describes the quote operation, but it is not itself a request to quote or book the itinerary.

If the document is unavailable or invalid, or the operation ID cannot be resolved exactly once, only this Action becomes unusable. The itinerary's identity, description, Price Preview, web page, and interpretable attributes remain available.

### Authenticate before requesting terms

authentication: required tells the Agent that the quote operation cannot succeed anonymously. It does not select an authentication protocol or provide credentials. The Agent begins the quote request in its current authentication context, follows any live authentication challenge, and uses only credentials valid for that Service.

### Follow discovery to quote

The advertised ODP path ends with current terms. It does not imply that the traveler approved a booking or purchase.

01

### Discover the itinerary

Find the scheduled flight through the Service's advertised Offering operations.

02

### Retrieve the Full Offering

Read the route, schedule, cabin, fare details, Price Preview, Attribute Schema reference, and quote Action.

03

### Interpret the travel attributes

Use the Attribute Schema to validate and present the Service-defined itinerary fields.

04

### Prepare the quote request

Resolve the OpenAPI operation and obtain the traveler inputs required by its request definition.

05

### Request current terms

After caller selection, authenticate and submit the approved traveler inputs, then present the live quote response.

### Keep booking outside ODP

ODP publishes the itinerary and identifies how to request a quote. The travel Service owns live availability, traveler validation, fare rules, taxes, seat selection, reservations, payment, ticketing, check-in, changes, cancellations, and disruption handling.

A successful quote does not reserve a seat, create a booking, issue a ticket, or authorize payment. Those effects require separate Service operations and explicit caller decisions.

### Inspect the example artifacts

The carrier, domains, schedule, and fare are illustrative. A deployed Service supplies current Offerings and hosts every referenced schema, web page, OpenAPI document, and Action target.

- [Generated example](https://www.offeringprotocol.org/examples/flight/): open the published flight itinerary example and its source files
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/flight/flight-offering.json): inspect the scheduled itinerary, travel attributes, Price Preview, and quote Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/flight/flight-attributes.schema.json): inspect the travel field definitions and validation constraints

### Next steps

Domain data

### Define custom attributes

Describe domain-specific fields with a retrievable Attribute Schema.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Execution

### Describe an OpenAPI Action

Point to one operation when the request or response needs a complete interface description.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Commercial terms

### Separate preview from payment

Use discovery-time pricing without replacing quotes or live payment requirements.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

On this page

- [What this Offering represents](#offering)
- [Identify each scheduled itinerary](#itinerary-identity)
- [Preserve places and local times](#places-and-times)
- [Describe the flight](#attributes)
- [Qualify baggage and refundability](#fare-conditions)
- [Present a starting price](#price)
- [Request a traveler-specific quote](#quote)
- [Retrieve OpenAPI without credentials](#openapi)
- [Authenticate before requesting terms](#authentication)
- [Follow discovery to quote](#flow)
- [Keep booking outside ODP](#boundaries)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
