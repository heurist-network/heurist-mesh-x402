<!-- source: https://www.offeringprotocol.org/documentation/examples/specialized-catalogs/gpu-rental/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# GPU rental

See how a compute Service describes one rentable graphics processing unit configuration and directs an Agent to an authenticated quote operation. ODP makes the configuration discoverable; the compute Service confirms capacity, returns current terms, allocates resources, and manages the rental.

### What this Offering represents

The a100-80gb-us-west Offering describes one dedicated NVIDIA A100 accelerator with 80 gibibytes of memory in the us-west-2 region. It is a rentable configuration, not an active compute instance, capacity reservation, or running workload.

| Field | Value | Purpose |
| --- | --- | --- |
| id | a100-80gb-us-west | Identifies this rentable configuration within the Service. |
| web\_url | /gpu/a100-80gb-us-west | Links to the human-facing configuration page at the Service Origin. |
| price | 2.40 USD per gpu-hour | Provides a discovery-time metered rate. |
| schema | gpu-rental-1.json | Defines the types, constraints, and units of the compute attributes. |
| actions | request-quote | Identifies the operation that returns current capacity and price. |

123456789101112131415161718192021222324252627282930313233343536373839404142434445464748495051

```
{
  "odp_version": "1.0",
  "id": "a100-80gb-us-west",
  "name": "Dedicated NVIDIA A100 80 GB rental",
  "description": "One dedicated A100 accelerator in the us-west-2 region, rented in one-minute increments.",
  "web_url": "/gpu/a100-80gb-us-west",
  "price": {
    "type": "metered",
    "amount": "2.40",
    "currency": "USD",
    "unit": "gpu-hour"
  },
  "schema": {
    "url": "https://compute.example/schemas/gpu-rental-1.json"
  },
  "attributes": {
    "accelerator": {
      "manufacturer": "NVIDIA",
      "model": "A100",
      "count": 1,
      "memory_per_device_gib": 80
    },
    "region": "us-west-2",
    "rental": {
      "minimum_duration_seconds": 600,
      "billing_increment_seconds": 60
    },
    "network_egress_gbps": 25
  },
  "actions": [
    {
      "id": "request-quote",
      "rel": "quote",
      "description": "Request current capacity and price for a requested rental interval.",
      "http": {
        "href": "/quotes",
        "method": "POST",
        "request": {
          "content_type": "application/json",
          "schema": {
            "url": "https://compute.example/schemas/gpu-quote-request-1.json"
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

### Identify each rentable configuration

Publish a separate Offering when an accelerator model, device count, memory size, region, or other configuration can be independently retrieved, quoted, reserved, or rented. An Agent then selects the complete configuration before choosing one of its Actions.

Keep request choices in the quote

A caller's desired start time and rental duration describe a request for this configuration; they do not identify a different catalog item. Those values belong in the quote request unless the Service publishes them as independently actionable Offerings.

### Describe the accelerator

ODP does not define universal compute fields. This Service uses an Attribute Schema to define a nested accelerator object and the other properties of its rental configuration.

| Attribute | Example | Meaning in this schema |
| --- | --- | --- |
| manufacturer | NVIDIA | The accelerator manufacturer. |
| model | A100 | The accelerator model. |
| count | 1 | The number of accelerator devices in the configuration. |
| memory\_per\_device\_gib | 80 GiB | The usable memory on each accelerator device. |
| region | us-west-2 | The Service-defined deployment region. |

The Offering name uses the familiar label “80 GB,” while the machine-readable attribute and schema specify 80 gibibytes. An Agent relies on the attribute's declared unit when it needs the precise value.

An Agent should validate the attributes against this schema before relying on them. If the schema is unavailable, invalid, unsupported, or does not match the attributes, the Agent treats the attributes as uninterpretable while retaining the Offering's identity, description, Price Preview, web page, and Actions.

### State units explicitly

The example schema associates device count, memory, duration, billing increments, and network egress with explicit units. This prevents an Agent from having to infer whether a number represents devices, seconds, gibibytes, or network throughput.

| Value | Unit hint | Meaning |
| --- | --- | --- |
| Accelerator count | device | Number of accelerator devices |
| Memory per device | GiBy | Gibibytes of usable memory |
| Rental durations | s | Seconds |
| Network egress | Gbit/s | Gigabits per second |

x-odp-unit and x-odp-comparison are exploratory schema annotations used by these examples. They are presentation and comparison hints, not protocol-owned compute fields or requirements for every ODP Service.

These attribute annotations are separate from the unit field in a metered Price Preview. The Price Preview uses gpu-hour to name the Service-defined unit associated with its advertised rate.

### Separate duration from billing increments

minimum\_duration\_seconds: 600 states that a requested rental must last at least ten minutes. billing\_increment\_seconds: 60 states that the Service measures billable time in one-minute increments. These fields answer different questions and must not be collapsed into one duration.

Neither value confirms that an accelerator is available for the requested interval or determines the final charge. The quote operation applies the requested timing, current capacity, and current commercial terms.

### Qualify network capacity

network\_egress\_gbps: 25 advertises a maximum network egress value of 25 gigabits per second for this configuration. It does not guarantee that every workload will continuously receive that throughput.

The compute Service defines the conditions that affect actual throughput, including shared infrastructure, destination, traffic policy, and the allocated runtime environment.

### Present a metered price

The metered Price Preview advertises 2.40 USD per Service-defined gpu-hour. It provides a rate for discovery and comparison; it is not a final charge, capacity reservation, or promise that the configuration remains available.

Use the quote for the final charge

An Agent can use the advertised rate and a requested duration to present an estimate. The Price Preview does not establish discounts, fees, availability, or final settlement terms. The live quote and any later payment requirement provide the authoritative values.

### Request current capacity and price

The caller explicitly selects the request-quote Action before the Agent invokes its compact HTTP target. The Action sends a JSON request to POST /quotes and expects a successful JSON response containing current terms.

| Field | Value | Meaning |
| --- | --- | --- |
| rel | quote | Requests current terms without allocating the accelerator. |
| href | /quotes | Resolves against the Service Origin. |
| method | POST | Submits the caller-approved quote request. |
| content\_type | application/json | Declares the request-body media type. |
| authentication | required | Requires Service authentication before the quote can succeed. |

### Validate the quote request

The Action's JSON Schema reference describes the quote request body. An Agent retrieves that schema anonymously, validates caller-supplied input against it, and sends a request body only when the caller supplies one or the operation definition supplies a complete value.

The gpu-quote-request-1.json URL is illustrative, and that schema is not included with this example. A deployed Service must publish the referenced schema. If the schema cannot be used, only this Action becomes unusable; the Offering and its other fields remain available.

### Follow live access and payment requirements

authentication: required tells the Agent that the quote operation cannot succeed anonymously. The Agent begins the request in its current authentication context and follows a live [AEP](https://www.aep.foundation/) challenge when the Service requires enrollment or authentication.

If the endpoint requires payment, its live [MPP](https://mpp.dev/) or [x402](https://x402.org/) challenge provides the authoritative payment requirements and settlement choices. The ODP Price Preview does not authorize that payment.

### Follow discovery to quote

The advertised ODP flow ends with current capacity and price. It does not allocate a GPU or start a workload.

01

### Discover the configuration

Find the GPU rental through the Service's advertised Offering operations.

02

### Retrieve the Full Offering

Read the accelerator, region, rental constraints, network capacity, Price Preview, Attribute Schema reference, and quote Action.

03

### Interpret the attributes and units

Use the Attribute Schema to validate and present the Service-defined compute fields.

04

### Prepare the quote request

Validate the caller's requested rental interval against the advertised request schema.

05

### Request current terms

After caller selection, satisfy live access requirements, submit the approved input, and present the quote response.

### Keep compute execution outside ODP

ODP publishes the rentable configuration and identifies how to request current terms. The compute Service owns capacity allocation, runtime credentials, workload execution, storage, networking, data transfer, usage measurement, payment, termination, and cleanup.

A successful quote does not allocate the accelerator, start a workload, transfer data, establish a network, or authorize payment. Those effects require separate Service operations and explicit caller decisions.

### Inspect the example artifacts

The Service name, domains, region, capacity, and price are illustrative. A deployed Service supplies current Offerings and hosts every referenced schema, web page, and Action target.

- [Generated example](https://www.offeringprotocol.org/examples/gpu-rental/): open the published GPU rental example and its source files
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/gpu-rental/gpu-rental-offering.json): inspect the compute configuration, Price Preview, and quote Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/gpu-rental/gpu-rental-attributes.schema.json): inspect the compute field definitions, constraints, units, and comparison hints

### Next steps

Domain data

### Define custom attributes

Describe compute-specific fields with a retrievable Attribute Schema.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Commercial terms

### Explain metered pricing

Keep discovery-time rates separate from quotes and live payment requirements.

[Pricing and payments](https://www.offeringprotocol.org/documentation/guides/pricing-and-payments/)

Execution

### Define the quote operation

Describe a compact Action request and its successful response types.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

On this page

- [What this Offering represents](#offering)
- [Identify each rentable configuration](#configuration)
- [Describe the accelerator](#accelerator)
- [State units explicitly](#units)
- [Separate duration from billing increments](#rental)
- [Qualify network capacity](#network)
- [Present a metered price](#price)
- [Request current capacity and price](#quote)
- [Validate the quote request](#request-schema)
- [Follow live access and payment requirements](#access)
- [Follow discovery to quote](#flow)
- [Keep compute execution outside ODP](#boundaries)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
