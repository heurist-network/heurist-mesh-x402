<!-- source: https://www.offeringprotocol.org/documentation/resources/governance/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Resources

# How ODP evolves

ODP changes begin with a concrete interoperability problem. Public review, compatibility analysis, and implementation evidence keep the draft, schemas, examples, tests, and SDKs aligned.

### Start with the normative specification

The published Internet-Draft defines ODP's normative protocol requirements: the rules that conforming implementations must follow. Schemas, examples, test vectors, documentation, and SDKs help people implement and verify those requirements, but they do not replace the draft.

When two artifacts disagree, the conflict is repaired everywhere it appears. An implementation does not make its own behavior authoritative by shipping it first, and a schema does not override behavior required by the draft.

| Source | Role |
| --- | --- |
| Internet-Draft | Defines the required request, response, and processing behavior. |
| Schemas and examples | Describe valid structures and demonstrate the protocol without creating new requirements. |
| Test vectors and conformance | Provide repeatable evidence that an implementation follows the specified behavior. |
| Official SDKs | Provide maintained implementations and implementation evidence, not a separate protocol definition. |

The IETF process governs standardization

Decisions made through an IETF working group, IETF Trust terms, and applicable IETF policies take precedence for the affected draft. Repository governance explains how the project prepares, reviews, and maintains that work.

### Match the review to the change

A corrected link does not need the same evidence as a new field that changes what Agents and Services exchange. Classifying the change establishes which artifacts, compatibility questions, and implementation evidence reviewers must examine.

| Change | Examples | Review |
| --- | --- | --- |
| Editorial | Typographical corrections, clearer wording, and repaired links. | Normal review with no change to request or response behavior. |
| Support artifact | Schemas, examples, guides, vectors, and harness checks. | Verify alignment with the draft and run the repository checks. |
| Clarification | Language that resolves an ambiguous requirement without changing its intended behavior. | Review compatibility and every artifact that encodes the clarified rule. |
| Protocol behavior | JSON fields, link relations, errors, algorithms, security rules, and conformance requirements. | Require design review, compatibility analysis, implementation evidence, and test vectors. |

### Propose one concrete change

Open a GitHub issue or discussion before changing public JSON fields, request or response behavior, or conformance rules. Describe the problem through the Agent and Service interaction that exposes it, rather than beginning with a preferred field or implementation.

- [Describe the interaction](https://github.com/offering-protocol/odp-specs/issues): identify the Agent, Service, request, response, and observable problem
- [Analyze the consequences](#compatibility): cover compatibility, migration, versioning, security, privacy, and affected implementations
- [Submit a focused change](https://github.com/offering-protocol/odp-specs/pulls): update the normative prose and every schema, example, vector, registry, or guide that represents the same behavior
- [Provide executable evidence](#evidence): demonstrate the behavior in implementations and conformance tests before treating it as stable

### Evaluate compatibility from observable behavior

Repository history does not determine whether a change is compatible. Review what existing Agents send, what existing Services return, and whether either side must change to preserve correct behavior.

| Change | Effect on odp\_version |
| --- | --- |
| Editorial or non-normative correction | No protocol-version change. |
| Compatible optional behavior | Increment the minor version when the behavior becomes normative. |
| Removal or incompatible redefinition | Increment the major version and publish new versioned resources. |

A draft revision is not a protocol version

An Internet-Draft suffix such as -01 identifies an IETF publication. It does not change odp\_version or establish compatibility by itself.

A revision within the same major version can deprecate a field, value, operation, or behavior without removing it from that major-version family. The draft records the deprecation and its migration guidance. Removing or incompatibly reusing the deprecated behavior requires a new major version.

[Read the versioning rules](https://www.offeringprotocol.org/documentation/protocol/versioning-and-extensibility/)

### Require evidence before declaring behavior stable

A normative behavior needs executable evidence in the Node.js reference implementation and conformance evidence from an independent implementation. This checks both that the rule can be implemented and that separate implementations interpret it consistently.

The pull request also updates every affected schema, example, test vector, conformance rule, registry, and guide. Security-sensitive changes receive an explicit threat and privacy review instead of relying only on successful examples.

Existing test vectors change only to correct an error or to represent an approved compatibility decision. A proposed behavior does not rewrite existing evidence merely to make an implementation pass.

[Validation and conformance](https://www.offeringprotocol.org/documentation/tools/validator-and-conformance/)

### Publish snapshots and revisions for different purposes

Repository deployments, Git tags, Internet-Draft revisions, implementation releases, and odp\_version identify different things. A publication process must not treat them as interchangeable version numbers.

In the specification repository, ietf/ contains the source documents and support material, while docs/ contains the published website. Repository checks reproduce the rendered files and reject generated output that has drifted from its source.

Current snapshot

### Use latest for convenience

Each successful deployment replaces the latest GitHub release with rendered artifacts from the deployed main commit. The snapshot is useful for current work, but it is not immutable.

Submitted draft

### Keep published revisions immutable

A submitted Internet-Draft receives a tag and release matching its full document name. A correction is published as the next draft revision instead of moving that tag.

Stable URLs for schemas and other published resources remain available for the major-version family they identify. An incompatible resource receives a new versioned URL rather than changing the meaning of an existing stable URL.

### Use the right channel

Public technical proposals belong in the ODP specification repository. Vulnerabilities and security-sensitive specification defects use the private reporting channel so maintainers can coordinate a fix before publishing exploitable details.

- [Governance policy](https://github.com/offering-protocol/odp-specs/blob/main/GOVERNANCE.md): read the complete authority, compatibility, evidence, and publication policy
- [Contribution guide](https://github.com/offering-protocol/odp-specs/blob/main/CONTRIBUTING.md): follow the branch, pull-request, repository-check, and draft-publication workflow
- [Specification questions](mailto:nas@inflowpay.ai): contact the maintainers about standards or specification interpretation
- [Security reports](https://github.com/offering-protocol/odp-specs/security/policy): report vulnerabilities privately instead of opening a public issue

### Next steps

Protocol

### Read the specification

Use the normative draft when implementing or reviewing ODP behavior.

[ODP specification](https://www.offeringprotocol.org/protocol/)

Contribution

### Propose a change

Bring a concrete Agent and Service interoperability problem to the public repository.

[Open GitHub](https://github.com/offering-protocol/odp-specs)

On this page

- [Authority](#authority)
- [Change classes](#change-classes)
- [Proposal workflow](#proposal-workflow)
- [Compatibility](#compatibility)
- [Evidence](#evidence)
- [Publication](#publication)
- [Participation](#participation)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
