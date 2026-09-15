<!-- source: https://www.offeringprotocol.org/documentation/introduction/core-concepts/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Introduction

# Understand the ODP model

Learn how Agents, Services, catalog resources, and Actions fit together.

### Participants

ODP has two protocol roles. An optional Directory can help connect them but is not itself an ODP protocol role.

Protocol role

#### Agent

Discovers and evaluates ODP resources for a user or another principal.

↔

Protocol role

#### Service

Publishes ODP capabilities and remains authoritative for its catalog.

A Directory is an optional source

A Directory can index public metadata and help an Agent find candidate Services. An Agent that already knows a Service origin can begin directly with that Service.

A Service represents a public origin

A Service is an origin that publishes ODP. It can represent a merchant, marketplace, public organization, software system, or another discoverable entity.

### Service Document

Discovery begins with the JSON Service Document published at /.well-known/odp. It describes the Service and advertises the ODP operations that the Service exposes.

- [Service metadata](https://www.offeringprotocol.org/documentation/guides/service-documents/): names, descriptions, keywords, links, branding, and language information
- [Operations](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/): the Collection and Offering capabilities available to the Agent
- [HTTP configuration](https://www.offeringprotocol.org/documentation/guides/service-documents/): the endpoint base and optional OpenAPI document
- [Related protocols](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/): enrollment, payment, trust, and MCP capabilities when applicable

An Agent uses the operations advertised in the current Service Document. Unadvertised ODP paths are not available for the Agent to probe or infer.

### Collections, Offerings, and Actions

A Service can expose Offerings directly or organize them with optional Collections. A Full Offering can then identify Actions that continue beyond discovery.

Service→Offerings→Actions

Collections→Optionally group, navigate, or constrain Offerings

#### [Collections](https://www.offeringprotocol.org/documentation/guides/collections/)

Can be hierarchical, overlapping, independent, or omitted entirely.

#### [Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

Describe something the Service makes available, whether free or paid, physical or digital.

#### [Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Identify subsequent operations such as invoke, purchase, download, reserve, or quote.

An Action describes the next request

An Action identifies where and how a later operation begins. The Agent still authenticates, satisfies any payment requirement, and sends the request to the Action target.

### Service-defined data

Every Offering uses the same ODP fields for its ID, description, images, pricing, and Actions. Specialized domain data belongs in the Offering's attributes object.

An [Attribute Schema](https://www.offeringprotocol.org/documentation/guides/custom-attributes/) describes those attributes with JSON Schema types, constraints, titles, and descriptions. This lets a flight, graphics processor rental, plant, or search API describe its specialized data without adopting a universal product taxonomy.

### Terse and full representations

Collections and Offerings have two views of the same resource. Both use the same field names, locations, types, and meanings.

Lists and search

#### Terse representation

A partial representation designed for navigation, comparison, and efficient catalog traversal.

Individual retrieval

#### Full representation

The complete ODP description that the Service returns for the Agent's request.

A terse representation omits details; it does not create a separate summary model or change the meaning of included fields.

### Identity and references

The Service Origin identifies the Service. Each Collection and Offering also has a stable identifier managed by that Service.

Complete resource identity

Service Origin + resource type + local identifier

An Agent keeps all three parts together. The same local identifier at two different Services does not identify the same resource.

A Resource Reference locates a browser page, image, schema, or subsequent operation. Changing or following a reference does not by itself change the identity of the Collection or Offering that supplied it.

### Next steps

Composition

### Connect related protocols

Understand how discovery works with enrollment, payment, trust, and MCP.

[Protocol composition](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/)

Quick start

### Implement the minimum Service

Publish a Service Document and the required Offering operations.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Participants](#participants)
- [Service Document](#service-document)
- [Collections, Offerings, and Actions](#catalog-resources)
- [Service-defined data](#service-defined-data)
- [Terse and full representations](#representations)
- [Identity and references](#identity-and-references)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
