<!-- source: https://www.aep.foundation/ -->
<!-- fetched: 2026-09-15 -->

# AEP Foundation Specifications

Internet-Draft sources and rendered specifications for the Agent
Enrollment Protocol.

## Current Drafts

The current set contains the independently implementable core
protocol and companion documents for Claims, `did:web`
identity, Platform Hosted Identity, and three session-credential
formats. The companion drafts define optional interoperable behavior
that Services advertise when applicable.

| Draft | Description | Formats |
| --- | --- | --- |
| draft-kavian-aep-claims-01 | This document defines a claim-value catalog for the Agent Enrollment Protocol (AEP). | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-claims/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-claims-01.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-claims-01.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-claims-01.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-claims-01.pdf) |
| draft-kavian-agent-enrollment-protocol-04 | The Agent Enrollment Protocol (AEP) defines an HTTP-based mechanism for autonomous agents to discover service enrollment requirements, enroll an agent identity, obtain optional session credentials, revoke those credentials, and query enrollment status. | [IETF](https://datatracker.ietf.org/doc/draft-kavian-agent-enrollment-protocol/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-agent-enrollment-protocol-04.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-agent-enrollment-protocol-04.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-agent-enrollment-protocol-04.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-agent-enrollment-protocol-04.pdf) |
| draft-kavian-aep-api-key-session-credential-04 | This document defines the API-key session-credential grant type for the Agent Enrollment Protocol (AEP). | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-api-key-session-credential/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-api-key-session-credential-04.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-api-key-session-credential-04.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-api-key-session-credential-04.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-api-key-session-credential-04.pdf) |
| draft-kavian-aep-basic-session-credential-04 | This document defines the Basic session-credential grant type for the Agent Enrollment Protocol (AEP). | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-basic-session-credential/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-basic-session-credential-04.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-basic-session-credential-04.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-basic-session-credential-04.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-basic-session-credential-04.pdf) |
| draft-kavian-aep-oauth-session-credential-04 | This document defines the OAuth Bearer session-credential grant type for the Agent Enrollment Protocol (AEP). | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-oauth-session-credential/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-oauth-session-credential-04.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-oauth-session-credential-04.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-oauth-session-credential-04.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-oauth-session-credential-04.pdf) |
| draft-kavian-aep-did-web-identity-method-00 | This document defines the `did:web` identity method for the Agent Enrollment Protocol (AEP). | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-did-web-identity-method/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-did-web-identity-method-00.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-did-web-identity-method-00.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-did-web-identity-method-00.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-did-web-identity-method-00.pdf) |
| draft-kavian-aep-platform-hosted-identity-01 | This document defines interoperable hosted identity behavior for Agent Enrollment Protocol (AEP) Platforms. | [IETF](https://datatracker.ietf.org/doc/draft-kavian-aep-platform-hosted-identity/) [HTML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-platform-hosted-identity-01.html) [TXT](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-platform-hosted-identity-01.txt) [XML](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-platform-hosted-identity-01.xml) [PDF](https://github.com/aep-foundation/aep-specs/releases/latest/download/draft-kavian-aep-platform-hosted-identity-01.pdf) |

## Software Development Kits

Official SDKs provide Core protocol support and Agent, Service, and
Platform integrations. See the
[SDK support policy](https://github.com/aep-foundation/aep-specs/blob/main/SDK_SUPPORT.md)
for compatibility, maintenance, release, and conformance details.

| Language | Repository | Distribution |
| --- | --- | --- |
| Node.js | [aep-node](https://github.com/aep-foundation/aep-node) | [npm](https://www.npmjs.com/org/aep-foundation) |
| Go | [aep-go](https://github.com/aep-foundation/aep-go) | [Go Packages](https://pkg.go.dev/github.com/aep-foundation/aep-go) |
| Java | [aep-java](https://github.com/aep-foundation/aep-java) | [Maven Central](https://central.sonatype.com/namespace/foundation.aep) |
| Python | [aep-python](https://github.com/aep-foundation/aep-python) | [PyPI](https://pypi.org/project/agent-enrollment-protocol/) |
| Rust | [aep-rust](https://github.com/aep-foundation/aep-rust) | [crates.io](https://crates.io/search?q=aep-) |

## Conformance

| Resource | Description | Source |
| --- | --- | --- |
| Conformance model | Role and profile model for the active AEP draft set. | [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/conformance/README.md) |
| Test vectors | Deterministic fixtures for Agent, Service, and Platform behavior. | [JSON](https://github.com/aep-foundation/aep-specs/tree/main/ietf/test-vectors) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/test-vectors/README.md) |
| Conformance contracts | Language-neutral capability manifest, process adapter, vector index, and report schemas. | [JSON](https://www.aep.foundation/conformance/) [Markdown](https://github.com/aep-foundation/aep-specs/tree/main/ietf/conformance) |
| JSON Schemas | Validation schemas for stable wire objects used by the current test vectors. | [JSON](https://www.aep.foundation/schemas/) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/schemas/README.md) |

## Guides

| Guide | Description | Source |
| --- | --- | --- |
| Implementer guide | Non-normative guidance for command sequencing, idempotency, client assertions, credential choice, and revocation strategy. | [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/guides/implementer-guide.md) |

## Governance

| Resource | Description | Source |
| --- | --- | --- |
| Project governance | Versioning, compatibility, artifact publication, review, and change management guidance. | [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/GOVERNANCE.md) |
| Extension registration | Non-normative guidance for extension identifiers, grant types, and support artifacts before formal IANA registries exist. | [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/governance/extension-registration.md) |
| Extension registry | Repository-local machine-readable registry entries for current AEP grant-type extensions. | [JSON](https://github.com/aep-foundation/aep-specs/tree/main/ietf/registry) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/registry/README.md) |

## Examples

| Example | Description | Source |
| --- | --- | --- |
| Complete Inspect document | A Service advertising the baseline HTTP binding, did:web, and the initial Grant credential types. | [HTML](https://www.aep.foundation/examples/inspect-document.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/inspect-document.md) |
| Enroll, Grant, and Revoke transcript | A minimal successful flow from enrollment through session credential issuance and revocation. | [HTML](https://www.aep.foundation/examples/enroll-grant-revoke-transcript.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/enroll-grant-revoke-transcript.md) |
| Pending Enroll and Status polling | A pending enrollment flow followed by Status polling until the identity becomes active. | [HTML](https://www.aep.foundation/examples/pending-enroll-status.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/pending-enroll-status.md) |
| Status states | Representative Status responses for pending, unavailable, suspended, terminated, and rejected identities. | [HTML](https://www.aep.foundation/examples/status-states.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/status-states.md) |
| API-key Grant and Revoke | API-key session credential issuance, presentation, per-credential Revoke, and grant-type Revoke. | [HTML](https://www.aep.foundation/examples/api-key-grant-revoke.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/api-key-grant-revoke.md) |
| Basic Grant and Revoke | Basic session credential issuance, presentation, per-credential Revoke, and grant-type Revoke. | [HTML](https://www.aep.foundation/examples/basic-grant-revoke.html) [Markdown](https://github.com/aep-foundation/aep-specs/blob/main/ietf/examples/basic-grant-revoke.md) |

## Source

Draft sources and contribution guidelines are maintained in the
[aep-foundation/aep-specs](https://github.com/aep-foundation/aep-specs)
repository.
