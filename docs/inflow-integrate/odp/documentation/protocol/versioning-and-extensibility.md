<!-- source: https://www.offeringprotocol.org/documentation/protocol/versioning-and-extensibility/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Evolve ODP without guessing

Use an explicit document version for the core protocol, preserve compatible additive data, and disable only the capability whose unfamiliar meaning cannot be determined safely.

### Declare every top-level document's version

Every ODP Top-Level Document in a request or response contains odp\_version. Its value is a JSON string in MAJOR.MINOR form, where both components are unsigned decimal integers without leading zeroes except for 0. This specification defines exactly 1.0.

Nested objects do not repeat odp\_version unless another specification defines that object as an independently processable Top-Level Document. Terse items embedded in a list or search response inherit the version declared by their containing document.

Version syntax does not imply compatibility

MAJOR.MINOR defines how a version is written. It does not make another minor version automatically compatible. The specification defining another version establishes what support for that version means.

### Keep version context within one document

Each request and response Top-Level Document declares the version governing that document. A version is not inherited from the Service Document, a preceding response, or another HTTP exchange.

Contained representation

### Inherit within the document

An embedded Collection or Offering uses the version declared by its containing page and does not repeat top-level metadata.

Independent exchange

### Declare the version again

A later search request, page response, or individual resource response is a new Top-Level Document with its own version declaration.

### Reject an unsupported document version

An implementation rejects a Top-Level Document whose odp\_version it does not support. It does not process recognizable fields from that document, reinterpret it as a nearby version, or apply the narrow-failure rules used for an unfamiliar optional capability.

Support for 1.0 establishes support for 1.0 only. The specification defining another ODP version determines its compatibility rules and the behavior required from implementations that claim to support it.

### Use odp\_version as the sole authority

ODP does not negotiate its protocol version through a media-type parameter or a separate version header. The application/odp+json media type has no version parameter, and syntactically valid parameters do not select or modify the protocol version.

An Agent decides whether it can process a received Top-Level Document from that document's odp\_version and the compatibility rules defined for the declared version. The version of the SDK, an earlier response, or an enclosing application cannot replace the declaration on the wire.

### Ignore additive members without changing core meaning

An Agent ignores JSON object members it does not understand unless a specific rule requires the containing object or capability to be rejected. This lets a compatible revision attach new information while older implementations continue to process the stable fields they understand.

A Service cannot use an unknown member to redefine a core member, alter an operation's established semantics, or make otherwise required data optional. Additive extensibility supplies additional information; it does not create a private replacement for the core protocol.

### Isolate the smallest unfamiliar capability

An unknown enum or discriminator is not replaced with a familiar value and does not acquire invented fallback semantics. The Agent treats the smallest capability, resource, or operation whose interpretation depends on that value as unsupported while preserving unrelated data.

After filtering unknown values from a list, recognized entries remain subject to all of their normal requirements. When no recognized entries remain, the list is treated as absent rather than as an explicitly supported empty capability.

### Apply the rule defined for each value

The correct response to an unknown value depends on the field. Apply the rule defined for that field instead of using one fallback for every unknown value.

| Unknown value | Result |
| --- | --- |
| Operation name | Remove that Operation Descriptor from the advertised operation list. |
| Payment option or protocol name | Remove the unfamiliar descriptor or option while retaining recognized entries. |
| Resource Image type | Remove that image descriptor from its containing images list. |
| Service Branding Image type | Treat the complete optional branding object as absent when either icon or logo has an unknown type. |
| Authentication value | Treat only the containing operation, payment descriptor, or Action as unsupported when the value is a syntactically valid string. A malformed required member remains invalid. |
| Price Preview type | Omit the price object and preserve the rest of the Offering. |
| Action relation | Retain the Action for explicit selection by id, but do not select it automatically by relation. |
| Action HTTP method | Remove the unusable Action from the containing Offering. |
| MCP endpoint type | Remove that endpoint without invalidating the Service Document. |
| Filter type, operator, or unit system; Sort direction or missing-value placement | Treat only the affected definition as unsupported. |
| Resource Identity type | Reject the Resource Identity as invalid because its identity semantics cannot be determined. |
| Problem Details code | Use the HTTP status and standard Problem Details members without substituting a familiar ODP code. |

An Agent also ignores an unknown additive Problem Details member and an invalid-parameter entry whose in value it does not recognize. These compatibility rules preserve the surrounding failure rather than converting it into success.

### Fail closed when interpretation controls safety

Narrow failure applies only when the remaining behavior is still unambiguous. An Agent does not execute an operation when an unknown field or value prevents it from determining identity, authorization, payment, request semantics, or security consequences.

Do not turn uncertainty into permission

Preserving unrelated Offering data is compatible evolution. Guessing how to authenticate, what to pay, where to send a request, or whether a state-changing operation is safe is not.

### Extend catalog vocabulary through Attribute Schemas

ODP keeps the common ODP fields needed for discovery and navigation stable. A Service places domain-specific Offering data in the attributes object and identifies its structure, types, and constraints with an Attribute Schema using JSON Schema Draft 2020-12.

This design lets travel, compute, media, retail, and other Services describe unfamiliar data without requiring ODP to define a universal catalog taxonomy. Multiple Offerings can share one schema, while Collection-specific or large sets of definitions remain with the operation where they apply instead of expanding the Service Document.

[Design custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

### Advertise support through the protocol itself

An implementation claims conformance separately for the Agent and Service roles. ODP defines one required baseline for each role, and each advertised or returned optional feature brings its applicable requirements into that implementation's conformance scope.

ODP defines no generic capabilities member, secondary runtime conformance manifest, named conformance levels, profiles, or minimum capability. A parallel claim could contradict the fields an Agent actually uses to navigate the Service.

- [Protocol version](#version-declaration): odp\_version identifies the exact ODP version governing the current Top-Level Document
- [Catalog operations](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/): operations identifies the list, retrieval, and search operations the Service supports
- [Protocol composition](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/): protocols and mcp advertise external protocol and MCP integration points
- [Search behavior](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/): search\_capabilities and associated definitions describe the supported query vocabulary
- [Offering behavior](https://www.offeringprotocol.org/documentation/guides/offerings/): schema and actions describe the optional capabilities attached to a resource

### Keep conformance evidence outside the wire protocol

A conformance harness can produce release evidence naming the implementation and version, role, ODP version tested, vector revision, suites executed, and their results. That report documents testing performed for one software release.

Conformance evidence is not an ODP wire document, is not retrieved during discovery, and cannot override runtime advertisements or normative requirements. Directory behavior is outside ODP conformance. Examples, guides, schemas, and test vectors support implementation and testing, but the Internet-Draft remains authoritative when those materials disagree.

### Evolve without weakening the contract

- [Declare](#version-declaration): include the supported version in every Top-Level Document and inherit it only within that document
- [Reject](#unsupported-versions): reject an unsupported document version before consuming any otherwise familiar fields
- [Ignore](#additive-members): preserve understood core fields when an additive object member has no effect on their meaning
- [Isolate](#narrow-failure): disable only the smallest capability whose unfamiliar value prevents correct interpretation
- [Protect](#fail-closed): stop rather than guess when identity, authorization, payment, request semantics, or security is uncertain
- [Advertise](#runtime-advertisement): express runtime support through the authoritative ODP fields instead of a parallel capability claim

### Next steps

Specialized vocabulary

### Model Service-defined data

Define domain attributes without extending or redefining the common ODP fields.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Release evidence

### Validate an implementation

Distinguish integration validation from normative conformance evidence.

[Validator and conformance](https://www.offeringprotocol.org/documentation/tools/validator-and-conformance/)

On this page

- [Version declaration](#version-declaration)
- [Document context](#document-context)
- [Unsupported versions](#unsupported-versions)
- [Version authority](#version-authority)
- [Additive members](#additive-members)
- [Narrow failure](#narrow-failure)
- [Unknown values](#unknown-values)
- [Fail closed](#fail-closed)
- [Service-defined data](#service-defined-data)
- [Runtime advertisement](#runtime-advertisement)
- [Conformance evidence](#conformance-evidence)
- [Implementation checklist](#implementation-checklist)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
