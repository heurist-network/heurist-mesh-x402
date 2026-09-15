<!-- source: https://www.offeringprotocol.org/documentation/protocol/security/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Treat every advertised resource as untrusted

ODP lets Services describe resources and destinations that an Agent can follow. Secure implementations validate that data and require separate authorization before connecting, sending credentials, or invoking an Action.

### Treat Service content as untrusted data

Every ODP representation, string, URL, cursor, Attribute Schema, OpenAPI document, MCP endpoint, and Action is untrusted network input. An Agent validates a representation before using its fields or following its references.

Names, descriptions, keywords, examples, schema annotations, and extension fields can help a caller understand a Service, but they cannot override caller intent, implementation policy, protocol requirements, or higher-priority Agent instructions. Render untrusted strings safely for their output context and never interpret terminal control sequences, markup, code fragments, schema keywords, media-type parameters, or OpenAPI extensions as executable instructions.

Validation does not establish trust

A document that conforms to its JSON Schema has the expected structure. It does not prove that its descriptions are truthful, its linked resources are safe, or its Actions match the caller's intent.

### Validate every destination before connecting

A Resource Reference can begin at another origin only when it contains an explicit absolute HTTPS URL. That flexibility does not grant general access to the Agent's local network. Apply the same destination policy to ODP resources, Attribute Schemas, OpenAPI documents, images, Actions, and MCP endpoints.

01

### Resolve the target host

Resolve every address that can be used for the connection instead of validating only one preferred result.

02

### Reject non-public results

Reject the destination when any result is loopback, private-use, link-local, multicast, unspecified, reserved, documentation-only, or otherwise non-public.

03

### Connect within the validated set

Do not let a proxy, custom resolver, or connection pool bypass the address policy applied to the request.

04

### Verify the connected peer

Confirm that the actual peer address belongs to the public address set validated for that request.

### Repeat validation for every connection

Resolve and validate the destination again for each new connection, retry, and redirect. Reusing an earlier DNS decision after the destination changes creates a time-of-check and time-of-use gap that can redirect a permitted request toward a private system.

Local HTTP access is a deliberate development exception, not an alternate production policy. It applies only when local development is explicitly enabled and the URL host is syntactically localhost, 127.0.0.1, or [::1]. A DNS name that resolves to loopback does not qualify, and production defaults keep local-network access disabled. Implementations can enforce stricter port, domain, origin, network, or enterprise egress allowlists.

### Keep redirects on the current origin

Every redirect retains the scheme, host, and effective port of the preceding request. Reject cross-origin redirects, transport-security downgrades, redirect loops, and any destination that fails the public-address checks.

An explicit cross-origin Resource Reference can start a separately validated request at its stated origin. That resource cannot use a redirect or DNS change to transfer the request to another origin or a non-public destination. The exact redirect count and failure behavior are documented under [Errors and limits](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/#redirect-limits).

### Send credentials only to their authorized destination

A link does not authorize credential forwarding. Before following it, classify the destination independently and send only credentials obtained or approved for that origin and request.

Supporting resources

### Retrieve metadata anonymously

Fetch JSON Schemas, OpenAPI documents, branding, and images without cookies, AEP credentials, payment proofs, caller authorization fields, or secrets copied from the referring request.

Executable destinations

### Authorize the target independently

Begin a cross-origin Action or MCP connection without credentials belonging to the Offering Service. Follow only the target origin's applicable protocol and live challenge rules.

Before a separately authorized request begins, redirect processing strips all sensitive fields inherited from the referring request. Advertising payment\_origins, a protocol, a Price Preview, an Action relation, or OpenAPI security metadata does not prove control of another origin or authorize enrollment, authentication, payment, or execution.

### Separate discovery from execution

Discovering, parsing, validating, or resolving an Action must not invoke its target. Retrieving a separately identified request schema or OpenAPI document also does not invoke the Action. An Agent invokes an Action only after the caller selects its id and supplies or approves its required inputs. Unknown relations are never selected automatically, and Action targets are not prefetched as an optimization.

A Service implements a compact GET Action with safe HTTP semantics. AEP, MPP, and x402 challenge-response retries remain governed by their defining protocols and preserve the exact request binding those protocols require.

A live authentication or payment challenge defines the protocol mechanics for the request, but it does not replace caller approval, spend limits, accepted assets, destination policy, or other Agent controls. If an authoritative amount or settlement choice differs from discovery metadata, return the changed requirement to the policy layer instead of silently proceeding.

Do not guess after an ambiguous outcome

Do not automatically retry a state-changing Action when the first outcome is unknown unless the operation defines an applicable idempotency mechanism and the retry preserves it.

### Treat MCP advertisements as locations, not assurances

An advertised MCP endpoint identifies an untrusted network destination. It does not prove authentication state, supported capabilities, tool safety, or the behavior of any tool the MCP server may expose.

A client that elects to connect applies the same destination, redirect, and credential-isolation rules used for every Resource Reference. It then follows MCP's current transport and authorization requirements rather than inferring them from the ODP descriptor.

### Bound work before exposing a result

Untrusted schemas, regular expressions, recursive references, OpenAPI extensions, pages, and compressed responses can consume excessive memory, processor time, network capacity, or concurrency. Apply documented time, memory, recursion, evaluation, elapsed-time, and parallel-work limits before returning the result to the Agent. Never load executable code to process a schema or OpenAPI extension.

A complete document must fit within its decoded-size and nesting limits. Compression does not enlarge those limits, and a truncated representation is never treated as valid. Cursors and Service-defined identifiers remain untrusted input; possessing one does not authorize access to the referenced resource or continuation.

Services should also apply request-rate, query-complexity, and concurrency controls without using distinguishable failures to reveal private catalog content. See [Errors and limits](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/#resource-limits) for the required resource limits.

### Separate cache entries by request context

Scope cache entries by effective request URL, method, representation and localization inputs, and authentication context. Never reuse an authenticated or private response as a public response, and never use a validator from one URL or origin to validate another resource.

Cached discovery metadata, Attribute Schemas, and OpenAPI documents can become stale or mutually inconsistent. They can describe a possible request, but they never authorize access, payment, or Action execution. When cached metadata contradicts live resource state, fail the smallest affected capability or revalidate it rather than merging incompatible representations.

### Minimize what discovery reveals

Search terms, filters, location constraints, and retrieved resources can reveal a person's interests, intended purchases, or business plans. Send only the context needed for the requested operation and retrieve cross-origin supporting resources only when the caller's task requires them. Each retrieval can disclose the Agent's network address, timing, and interest in the referring Service or Offering to another operator.

- [Queries](#discovery-privacy): keep sensitive values out of Resource Reference query strings and avoid unnecessary user-specific search context
- [Operational data](#discovery-privacy): exclude secrets from logs, telemetry, shared cache keys, and Problem Details intended for another party
- [Representations](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/#two-representations): minimize data in Terse Representations and apply access control before disclosing protected Offering attributes
- [Directories](https://www.offeringprotocol.org/documentation/tools/directory/): index public Service metadata and disclose the directory's retention and refresh policy

### Do not reveal protected catalog shape

auth\_expands: true reveals only that authentication can expand the current result. It must not identify, count, or characterize what an unauthorized principal cannot access.

Services must not use detail\_fields, result counts, identifiers, refinement counts, errors, timing differences, or other metadata to disclose the nature or quantity of protected content. Apply access control before constructing those observable values, not only before returning the underlying Offering.

### Apply every protection together

- [Validate](#untrusted-content): treat every representation and human-readable field as untrusted data rather than Agent instructions
- [Resolve](#destination-validation): reject non-public destinations and verify the actual connected peer for every request
- [Isolate](#credential-isolation): start each destination with the credentials and authority explicitly established for that origin
- [Control](#discovery-and-execution): require caller selection before invoking an Action and preserve idempotency across any permitted retry
- [Bound](#bounded-processing): limit decoded input, recursive evaluation, elapsed time, retries, and concurrent work before exposing a result
- [Partition](#cache-safety): scope caches and validators to the complete request and authentication context
- [Minimize](#discovery-privacy): avoid disclosing sensitive intent, operational data, or protected catalog structure

### Next steps

Defensive limits

### Handle bounded failures

Apply exact response limits, Problem Details, redirect bounds, and retry policy.

[Errors and limits](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/)

Compatible evolution

### Handle unfamiliar data safely

Distinguish additive extensions from ambiguity that requires the affected capability to fail closed.

[Versioning and extensibility](https://www.offeringprotocol.org/documentation/protocol/versioning-and-extensibility/)

On this page

- [Untrusted content](#untrusted-content)
- [Destination validation](#destination-validation)
- [DNS rebinding](#dns-rebinding)
- [Redirect boundary](#redirect-boundary)
- [Credential isolation](#credential-isolation)
- [Discovery and execution](#discovery-and-execution)
- [MCP endpoints](#mcp-endpoints)
- [Bounded processing](#bounded-processing)
- [Cache safety](#cache-safety)
- [Discovery privacy](#discovery-privacy)
- [Protected catalogs](#protected-catalogs)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
