<!-- source: https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Quick start

# Validate the deployed Service

Check the publication requirements, exercise the advertised catalog, and correct failures before Agents depend on the integration.

### Validate the publication requirements

Submit the deployed Service origin to the [Directory Validator](https://directory.inflowpay.ai/validate/). It applies the same checks used when a Service is submitted for publication. A local JSON file cannot show whether the public resources are reachable or whether their references work together.

- [Origin](https://directory.inflowpay.ai/validate/): requires a canonical public HTTPS origin
- [ODP Service Document](https://www.offeringprotocol.org/documentation/guides/service-documents/): retrieves and validates the well-known document, required operations, references, and declared capabilities
- [Branding](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): retrieves the advertised icon and logo and checks their supported formats
- [Composed protocols](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/): validates an advertised AEP document and checks payment and trust declarations

A passing result is ready for submission

The Directory Validator deliberately does not invoke catalog operations or attempt enrollment or payment. A passing result confirms the publication gate; the operational checks below confirm that the advertised Service actually works.

### Inspect the Service like an Agent

Use the [InFlow CLI](https://www.inflowcli.ai/) against the public origin. Inspection retrieves and validates the current Service Document. Listing and retrieval then follow the Service's advertised endpoint base and fixed Offering paths.

123

```
inflow odp inspect https://service.example
inflow odp offerings list https://service.example
inflow odp offerings get https://service.example consultation
```

Replace consultation with an identifier returned by the list command. The retrieved Full Offering must repeat that identifier and preserve the meaning of every field included in its terse representation.

### Exercise every advertised operation

The Service Document tells Agents which operations are available. Testing the required Offering operations does not test an advertised Collection or search operation. Send a conformant request to every advertised operation before publishing the document.

| Capability | Validation |
| --- | --- |
| Required Offering operations | List the accessible Offering sequence and, when it is non-empty, retrieve at least one returned identifier. An empty list remains a valid response. |
| Collection operations | List Collections, retrieve returned identifiers, and confirm Collection-scoped Offering navigation when advertised. |
| Search operations | Read the applicable search capabilities, submit accepted queries and filters, and reject unsupported parameters predictably. |

Remove an operation from the Service Document when its deployed endpoint is unavailable or incomplete. Agents must be able to rely on advertisement without probing familiar paths.

### Check the HTTP response

Inspect the HTTP status and headers as well as the decoded JSON. Valid-looking JSON is not sufficient when the response uses the wrong status, media type, or representation.

#### Media type and version

Successful top-level ODP documents use application/odp+json and declare a supported odp\_version in the body.

#### Representation

List and search return terse resources; individual retrieval returns the Full representation that the Service makes available for the request.

#### Continuation

Follow every returned continuation without rebuilding it, and confirm that the final page omits next.

#### Access

The live endpoint behavior must agree with its advertised authentication requirement, while its current challenge remains authoritative.

#### Attribute Schemas

Validate Full Offering attributes against the Attribute Schema. For Terse Offerings, confirm that included values retain their schema-defined types without treating the partial object as a complete instance.

See [Representations and schemas](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/) for media negotiation, partial representations, schema references, and validation boundaries.

### Test predictable failure paths

Test the failure responses that let Agents distinguish invalid input, a missing resource, and a temporary limit.

- [Representation negotiation](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/): return 406 Not Acceptable when an ODP response representation is excluded
- [Invalid input](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): return an ODP Problem Details response with a stable error code and scoped invalid-parameter details
- [Missing identifier](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): distinguish an unknown Collection or Offering from malformed input
- [Limits and retries](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): enforce request bounds and communicate retry behavior when requests are rate limited

Validation and conformance answer different questions

Directory validation checks one deployed Service. The conformance suite is for SDKs, adapters, and reusable protocol implementations.

### Next steps

Publication

### List the validated Service

Submit the public origin after it passes the publication requirements and its advertised operations work.

[Publish to the Directory](https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/)

Agent path

### Verify discovery end to end

Approach the deployed origin as an Agent that has no prior knowledge of its paths.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

On this page

- [Validate the publication requirements](#directory-validator)
- [Inspect the Service like an Agent](#agent-inspection)
- [Exercise every advertised operation](#advertised-operations)
- [Check the HTTP response](#wire-contract)
- [Test predictable failure paths](#failure-paths)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
