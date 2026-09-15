<!-- source: https://www.offeringprotocol.org/documentation/tools/validator-and-conformance/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Tools

# Use the right evidence for the question

Validate a public Service before publication, test protocol behavior before releasing an implementation, and measure whether independently built SDKs work together without treating those results as interchangeable.

### Separate four validation layers

Each layer answers a different question. A result from one layer cannot prove the behavior owned by another.

#### Directory Validator

Does this deployed HTTPS origin pass the checks required for InFlow Directory publication?

#### JSON Schemas

Does this local JSON value have the required structure for the selected ODP document?

#### Conformance harness

Does one Agent or Service implementation produce the expected outcomes for its applicable protocol requirements?

#### Interoperability matrix

Can each official Agent SDK communicate with each official Service SDK over real HTTP?

### Choose the evidence you need

| Tool | Input | Output | Does not prove |
| --- | --- | --- | --- |
| Directory Validator | Public Service origin | Publication checks, warnings, and readiness | Catalog operation behavior or complete role conformance |
| JSON Schema validator | One decoded JSON value and its applicable schema | Structural validation result | HTTP semantics, safe references, or consistency across resources |
| Conformance harness | Role, vector suites, and implementation adapter | Versioned release-evidence report | Compatibility with every other implementation |
| Interoperability matrix | Official Agent and Service SDK checkouts | Pairing results and diagnostics | Exhaustive normative behavior |

### Validate a deployed Service

Submit the canonical public HTTPS origin to the [Directory Validator](https://directory.inflowpay.ai/validate/). It runs the same checks used for Directory publication, so the result reflects the resources available from the deployed origin rather than a local file.

- [Origin and Service Document](https://www.offeringprotocol.org/documentation/guides/service-documents/): retrieve the well-known document and validate its required metadata, operations, endpoint base, and references
- [Branding](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): retrieve the advertised icon and logo and report missing or invalid assets
- [Composed protocols](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/): validate an advertised AEP document and inspect payment, payment-origin, and trust declarations
- [Publication readiness](https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/): distinguish blocking errors from non-blocking warnings before submission

Publication validation is not certification

The validator does not invoke Collection or Offering operations, enroll an Agent, authenticate, make a payment, or certify general ODP conformance. A passing result means the origin satisfies the current InFlow Directory publication gate.

### Use schemas for local document structure

The published [ODP schemas](https://www.offeringprotocol.org/schemas/) validate known document structures, required members, bounds, and discriminated variants. They are useful at authoring boundaries and inside SDK parsers.

Schema success alone cannot prove media negotiation, status codes, redirects, caching, reference resolution, access behavior, or agreement between a terse resource and its Full representation. Those requirements need behavioral tests against the implementation.

### Claim conformance separately by role

ODP defines one required baseline for the Agent role and one for the Service role. It does not define named conformance levels, a reduced minimum profile, or a single claim that automatically covers both roles.

Service role

### Publish and serve the baseline

Provide a valid public Service Document and implement list-offerings and get-offering with their applicable shared requirements.

Agent role

### Consume the baseline safely

Retrieve and validate the Service Document, traverse Offering pages, retrieve Full Offerings, and implement the applicable compatibility and security behavior.

### Test every feature the implementation claims

Collections, search, filters, sorting, refinements, Attribute Schema resolution, Actions, and external protocol composition are not required merely because ODP defines them. Once an implementation advertises, returns, or claims one of those features, it must satisfy the normative requirements for that feature.

A Service must not advertise an operation that its deployed endpoint does not implement. An Agent must not claim support for optional data that it ignores incorrectly or processes only on the successful path.

### Run the shared behavioral vectors

The [language-neutral test vectors](https://www.offeringprotocol.org/test-vectors/) contain positive and negative cases for identity, Service Documents, Offerings, Collections, pagination, representations, search, errors, security, composition, Attribute Schemas, and versioning. Each official SDK runs these same vectors through a language-specific adapter. This keeps case inputs and expected outcomes shared while leaving each SDK responsible for its own implementation.

The ordered vector index identifies the complete input set. The harness derives a revision digest from that index and its parsed vectors so a report identifies the exact evidence used without relying on a separately maintained vector release number.

### Connect the real implementation through an adapter

The harness owns vector selection, sequencing, aggregation, and report generation. The implementation supplies an executable adapter that reads one JSON request per line from standard input and writes one corresponding JSON response per line to standard output. Responses can complete out of order, but every sequence must receive exactly one response.

Clone [odp-specs](https://github.com/offering-protocol/odp-specs) and run the harness from its repository root. Replace ./bin/odp-conformance-adapter with the executable and arguments that start the adapter for the implementation being tested.

123456

```
ruby ietf/scripts/run_conformance.rb \
  --role service \
  --implementation-name my-service \
  --implementation-version 1.0.0 \
  --output conformance-report.json \
  -- ./bin/odp-conformance-adapter
```

Adapter diagnostics belong on standard error. A malformed response, missing or duplicate sequence, or nonzero adapter exit fails the harness. The repository fixture adapter tests only this process contract; it is not an ODP implementation and cannot produce implementation conformance evidence.

See the [conformance harness contract](https://github.com/offering-protocol/odp-specs/tree/main/ietf/conformance) for the adapter request, response, and report schemas.

### Read release evidence precisely

A conformance report identifies the implementation name and version, tested role, singular ODP version, vector revision, selected suites, and passed, failed, and skipped results. It describes evidence for that software release and input set.

The report is not an ODP wire document, is not retrieved during Service discovery, and cannot override current runtime advertisement. ODP defines no secondary conformance manifest or generic capability member to publish beside the Service Document.

### Measure cross-SDK interoperability separately

The manual interoperability workflow starts each official Service SDK and runs every official Agent SDK against it over HTTP. The resulting matrix identifies successful and failed language pairings and preserves diagnostics for a specific set of checkouts.

A successful pairing demonstrates that two implementations communicate for the exercised scenarios. It does not exhaust every normative requirement, and a conformance report for one implementation does not prove compatibility with every peer. The matrix therefore complements role conformance rather than replacing it.

### Resolve contradictions at the normative source

The current Internet-Draft is authoritative. Schemas, examples, test vectors, harness contracts, and generated reports make its requirements easier to implement and verify, but none can override the draft. A contradiction is a specification defect that must be reconciled across every affected artifact.

### Match the workflow to the maintainer

| Maintainer | Primary workflow |
| --- | --- |
| Service integrator | Validate the public origin, exercise every advertised operation, and test its failure paths before publication. |
| Agent developer | Run the Agent-role vectors and test against independently implemented Services. |
| SDK maintainer | Run every applicable role suite through the SDK's real public behavior and retain the generated evidence. |
| Release manager | Confirm repository gates and role evidence against the exact release tree. When cross-SDK evidence is needed, run the separate manual interoperability workflow with exact SDK references. |

### Next steps

Service integration

### Validate a deployed origin

Follow the practical checks that prepare a Service for Directory publication.

[Validate an integration](https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/)

Implementation

### Choose an official SDK

Start with a maintained implementation that runs the shared conformance contract in its repository gates.

[Official SDKs](https://www.offeringprotocol.org/documentation/sdks/nodejs/)

On this page

- [Validation layers](#layers)
- [Comparison](#comparison)
- [Directory Validator](#directory-validator)
- [Schemas](#schemas)
- [Conformance roles](#roles)
- [Optional behavior](#optional-behavior)
- [Test vectors](#vectors)
- [Adapter contract](#adapter)
- [Release evidence](#evidence)
- [Interoperability](#interoperability)
- [Authority](#authority)
- [Workflow](#workflow)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
