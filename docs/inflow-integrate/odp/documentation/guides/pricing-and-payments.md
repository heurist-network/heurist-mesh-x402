<!-- source: https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Guides

# Describe price, then follow live payment

Help an Agent compare Offerings during discovery without treating a displayed price as a payment authorization or settlement requirement.

### Preview price during discovery

An Offering's optional price object is a Price Preview. It summarizes commercial context before an Agent invokes an Action, requests a quote, or encounters a payment challenge. This lets callers compare Offerings without beginning execution.

Discovery

### Present an expected price

Use the Price Preview to rank, filter, explain, or request approval for an Offering before calling its Action.

Execution

### Obey the live requirement

Use the Action response, quote, or live payment challenge for the amount and settlement choices that actually apply.

Absence does not mean free

An Offering without price has not advertised a Price Preview. The Agent must not label it free or assume that its subsequent operation requires no payment.

### Choose the correct price type

Every Price Preview has a type discriminator. Choose the type that accurately describes what the Service can state during discovery, not what the Agent hopes the final transaction will cost.

| Type | Required members | Meaning |
| --- | --- | --- |
| free | type | No price is required. |
| fixed | type, amount, currency | One advertised display price. |
| range | type, minimum, maximum, currency | An inclusive advertised display range. |
| starting\_at | type, amount, currency | The lowest advertised starting price. |
| metered | type, amount, currency, unit | An advertised rate per Service-defined unit. |
| quote | type | A later operation determines the price. |

Use free only when no price is required. Use quote when the amount cannot be determined until a later operation. Neither is interchangeable with an omitted Price Preview.

### Publish the required fields

The examples below show Price Previews embedded in terse Offering results. The same price shape has equivalent meaning in a Full Offering.

12345678910111213141516171819202122232425262728293031323334

```
{
  "odp_version": "1.0",
  "items": [
    {
      "id": "research-report",
      "name": "Research report",
      "price": {
        "type": "fixed",
        "amount": "8.50",
        "currency": "USD"
      }
    },
    {
      "id": "gpu-compute",
      "name": "GPU compute",
      "price": {
        "type": "metered",
        "amount": "1.25",
        "currency": "USD",
        "unit": "hour"
      }
    },
    {
      "id": "data-analysis",
      "name": "Data analysis",
      "price": {
        "type": "range",
        "minimum": "25.00",
        "maximum": "100.00",
        "currency": "USD"
      }
    }
  ]
}
```

For a range, minimum must not exceed maximum. For a metered price, unit is a Service-defined display label; specialized unit semantics can be documented in the Offering's attributes and Attribute Schema.

### Encode monetary values safely

Price amounts are non-negative base-10 strings. Do not serialize them as JSON numbers, because binary floating-point handling can change their decimal meaning across implementations.

- [Amount](#monetary-values): use a decimal string such as 8.50, not the JSON number 8.5
- [Currency](#monetary-values): identify the display denomination of the summary
- [Settlement](#payment-support): obtain the actual asset, network, rail, and payment terms from the defining payment protocol

currency does not select MPP, x402, a blockchain, a card rail, or a settlement asset. It tells the caller how the discovery-time amount is denominated.

### Understand what a Price Preview excludes

A core Price Preview excludes taxes, shipping, discounts, buyer-specific terms, fees, availability, and final quote results unless the Offering states those details separately outside the price object.

A Price Preview also does not promise that the Offering remains available, reserve inventory, authorize spending, or represent a completed quote. Use an Action and its response for those domain-specific transitions.

### Distinguish common pricing signals

| Offering state | What the Agent knows | Appropriate next step |
| --- | --- | --- |
| No price | No discovery-time price was advertised. | Inspect the available Action and its live response. |
| free | The Service states that no price is required. | Invoke only after the caller selects the Action and approves its other consequences. |
| quote | A subsequent operation determines current terms. | Invoke the advertised quote Action. |
| Monetary preview | A fixed, range, starting, or metered display value is available. | Use it for comparison, then follow the authoritative live operation. |

### Advertise payment support separately

The Service Document can advertise [MPP](https://mpp.dev/), [x402](https://x402.org/), or both under [protocols.payments](https://www.offeringprotocol.org/documentation/guides/service-documents/#protocols-and-integrations). Each descriptor states whether Service authentication is required before using that protocol.

Optional compatibility labels such as InFlow, Solana, Base, or Tempo help humans and Agents understand broad support. They do not replace the payment protocol's method, scheme, network, chain, asset, or settlement terms.

Payment advertisement is Service-wide and does not guarantee that every ODP operation, Offering, or Action accepts that protocol. Conversely, a live challenge from an unadvertised protocol is still authoritative for the request that produced it.

### Trust the live payment requirement

An Action response, quote response, MPP challenge, or x402 payment requirement is authoritative for execution. When its amount or settlement choices differ from the Price Preview, the Agent uses and presents the live values instead of silently relying on discovery metadata.

A preview is not spending approval

Neither a Price Preview nor advertised payment support authorizes the Agent to pay. The Agent must still apply the caller's approval, spending limits, accepted assets, destination policy, and other payment controls.

### Compose authentication and payment

When a Service requires both AEP authentication and payment, the live exchange proceeds in a defined order. Payment does not begin until authentication succeeds.

01

### Request the Action

Begin in the Agent's current authentication context without paying speculatively.

02

### Satisfy an AEP challenge

Enroll or authenticate when the Service responds with a live AEP challenge, then retry the same operation.

03

### Read the payment challenge

After authentication succeeds, obtain the current MPP or x402 amount and settlement choices from the live response.

04

### Approve, pay, and retry

Apply payment policy and caller approval, satisfy the defining protocol, and preserve the required authentication context on the retry.

A public operation can succeed without AEP, and a payment-only operation can return a payment challenge immediately. A successful response without another challenge means no additional protocol step is required at that point.

### Handle unknown pricing narrowly

When an Agent does not recognize price.type, it treats only the Price Preview as unsupported. The Offering's identity, description, images, attributes, Collection membership, and Actions remain usable.

This narrow failure boundary allows future ODP versions to add Price Preview types without turning otherwise compatible Offerings into unusable resources.

### Next steps

Execution

### Describe what happens next

Connect an Offering to the operation that quotes, reserves, invokes, downloads, or acquires it.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Protocol behavior

### Follow live access requirements

Apply enrollment, authentication, payment, and credential isolation in the correct order.

[Access and composition](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

On this page

- [Preview price during discovery](#discovery-preview)
- [Choose the correct price type](#price-types)
- [Publish the required fields](#publish-price)
- [Encode monetary values safely](#monetary-values)
- [Understand what a Price Preview excludes](#preview-boundary)
- [Distinguish common pricing signals](#pricing-signals)
- [Advertise payment support separately](#payment-support)
- [Trust the live payment requirement](#authoritative-payment)
- [Compose authentication and payment](#composition-flow)
- [Handle unknown pricing narrowly](#unknown-price)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
