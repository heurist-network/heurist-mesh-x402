<!-- source: https://www.offeringprotocol.org/documentation/examples/commerce/digital-subscription/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Digital subscription

See how a software Service makes an annual team plan discoverable. ODP describes the plan and its quote Action; the Service application owns account creation, recurring billing, renewal, cancellation, and entitlements.

### What this Offering represents

The team-annual Offering represents one annual team plan. It has its own identity because an Agent can discover, compare, and request current terms for this plan independently from other plans the Service may publish.

| Field | Value | Purpose |
| --- | --- | --- |
| id | team-annual | Gives this plan a stable Local Resource Identifier. |
| web\_url | /plans/team-annual | Links to the human-facing plan page. The origin-relative reference resolves against the Service Origin. |
| price | 240.00 USD | Provides one discovery-time price for the term described by the attributes. |
| schema | team-subscription-4.json | Defines the types and constraints of the Service-owned attributes. |
| actions | request-quote | Identifies the operation that returns current terms for a configured request. |

1234567891011121314151617181920212223242526272829303132333435363738394041

```
{
  "odp_version": "1.0",
  "id": "team-annual",
  "name": "Team annual plan",
  "description": "A collaborative workspace subscription for teams of 3 to 25 people.",
  "web_url": "/plans/team-annual",
  "price": {
    "type": "fixed",
    "amount": "240.00",
    "currency": "USD"
  },
  "schema": {
    "url": "https://software.example/schemas/team-subscription-4.json"
  },
  "attributes": {
    "billing_term": "P1Y",
    "renews_automatically": true,
    "cancellation_timing": "end_of_term",
    "seat_limits": {
      "minimum": 3,
      "maximum": 25
    },
    "features": {
      "shared_workspaces": true,
      "version_history_days": 365,
      "support_level": "priority"
    }
  },
  "actions": [
    {
      "id": "request-quote",
      "rel": "quote",
      "description": "Request current pricing and terms for the selected seat count and billing location.",
      "openapi": {
        "url": "https://software.example/openapi.json",
        "operation_id": "createTeamSubscriptionQuote"
      },
      "authentication": "required"
    }
  ]
}
```

### Connect the price to its term

The fixed Price Preview advertises 240.00 USD. The Service-owned billing\_term attribute has the ISO 8601 duration P1Y, so an Agent can present the amount as the advertised price for one annual term.

The preview does not create a subscription

The price and billing term describe the Offering during discovery. They are not a payment instruction, invoice, recurring authorization, or guarantee that taxes and buyer-specific adjustments are included. The quote supplies current commercial terms. If payment follows, the live payment challenge supplies the authoritative amount and settlement choices.

This example does not state whether 240.00 USD is the total plan price or a per-seat amount. An Agent must present it only as the advertised price for one annual term and use the quote response for the configured total.

### Describe the plan with attributes

ODP does not define a universal subscription object. This Service uses an Attribute Schema to define the types and constraints of its plan details. Another Service can publish a different schema for its own subscription model.

| Attribute | Example value | What it tells the Agent |
| --- | --- | --- |
| billing\_term | P1Y | The advertised price covers one year. |
| renews\_automatically | true | The plan advertises automatic renewal as one of its terms. |
| cancellation\_timing | end\_of\_term | The plan advertises cancellation at the end of the current term. |
| seat\_limits | 3-25 | The plan accepts teams within this advertised size range. |
| features | Shared workspaces, 365-day history, priority support | The capabilities included in this plan. |

These values describe the plan, not an individual customer's subscription. They do not report whether a subscription is active, whether it renewed, or whether a cancellation is pending. The Attribute Schema restricts cancellation timing to immediate or end\_of\_term, requires positive seat limits, and defines the types of every feature value. An Agent can validate and display these Service-defined attributes, but it must not infer behavior that the schema and Service documentation do not define.

### Request current terms

The request-quote Action uses the registered quote relation. Its OpenAPI reference identifies createTeamSubscriptionQuote as the operation that accepts the selected seat count and billing location and returns current terms. The software.example URL is illustrative; a deployed Service must publish an OpenAPI 3.1 document containing exactly one operation with that identifier.

| Field | Value | Meaning |
| --- | --- | --- |
| id | request-quote | The stable Action ID a caller selects explicitly. |
| rel | quote | States that the operation obtains current terms without completing an acquisition. |
| operation\_id | createTeamSubscriptionQuote | Resolves the Action to one operation in the referenced OpenAPI 3.1 document. |
| authentication | required | States that Service authentication is required before the quote operation can succeed. |

Retrieving the Offering does not request a quote. The Agent invokes the Action only after the caller selects it and supplies or approves its inputs. The live Action response remains authoritative for the resulting terms.

### Follow discovery to quote

Discovery gives the Agent enough information to decide whether the plan is relevant and request current terms. This advertised ODP flow ends with the quote response.

01

### Discover the plan

Find the team plan through the Service's advertised Offering operations.

02

### Retrieve the Full Offering

Read the Price Preview, Attribute Schema reference, plan attributes, and available Action.

03

### Interpret the plan

Use the Attribute Schema to present the billing term, renewal behavior, cancellation timing, seat limits, and included features.

04

### Request a quote

After caller selection, authenticate as required and call the advertised quote operation with the caller's configuration.

05

### Continue outside ODP

Follow the Service application's documented next steps for account creation, authorization, billing, and entitlement management. The quote Action does not define those operations.

### Keep the subscription lifecycle outside ODP

ODP 1.0 makes this recurring plan discoverable, but it does not define recurring subscription behavior. The Service application owns the subscription lifecycle. [AEP](https://www.aep.foundation/) may provide Service authentication, while [MPP](https://mpp.dev/) or [x402](https://x402.org/) may provide payment. Those protocols do not define renewal, cancellation, or entitlement state.

| The Offering publishes | The Service application controls |
| --- | --- |
| Plan identity, name, description, and web page | Account creation and customer records |
| A discovery-time Price Preview and billing-term attribute | Invoices, taxes, payment authorization, and recurring charges |
| Descriptive renewal and cancellation attributes | Renewal execution, cancellation requests, and effective state |
| A quote Action and its request contract | Subscription creation, entitlement enforcement, and usage records |

ODP defines no standard subscribe relation, renewal operation, cancellation contract, entitlement record, or recurring billing state. Do not invent those meanings from the Offering. In this example, the selected Action contract governs only the quote request and response. Any later subscription operations follow contracts defined by the Service application.

### Inspect the example artifacts

The published example includes the Full Offering and the Attribute Schema that defines its subscription-specific fields.

- [Generated example](https://www.offeringprotocol.org/examples/digital-subscription/): open the published Digital subscription example and its source files
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/digital-subscription/team-annual-offering.json): inspect the plan identity, price, attributes, and quote Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/digital-subscription/digital-subscription-attributes.schema.json): inspect the types and constraints applied to the plan attributes

### Next steps

Commercial terms

### Describe pricing and payment

Choose an honest Price Preview and understand how it differs from quotes and live payment requirements.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

Execution

### Define the quote operation

Describe the Action that accepts configuration and returns the Service's current terms.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

On this page

- [What this Offering represents](#offering)
- [Connect the price to its term](#price-and-term)
- [Describe the plan with attributes](#attributes)
- [Request current terms](#quote)
- [Follow discovery to quote](#flow)
- [Keep the lifecycle outside ODP](#lifecycle)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
