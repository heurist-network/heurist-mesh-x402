<!-- source: https://www.offeringprotocol.org/documentation/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Introduction

# Make Services discoverable to Agents

ODP lets Agents inspect a Service, find its Offerings, and identify the operations available after discovery.

### Overview

The Offering Discovery Protocol (ODP) is an open protocol for discovering what a Service makes available. It gives Agents consistent, machine-readable resources for exploring a catalog before choosing an Offering or continuing to another operation.

ODP supports catalogs of different sizes and business models. A Service can publish a few Offerings or a marketplace-scale catalog, and those Offerings can describe physical goods, digital services, content, capacity, or other available resources.

### How discovery works

The Service Document tells an Agent which operations the Service supports and where those operations are located.

01

### Find a Service

Begin with a known origin or locate a candidate Service through a Directory.

02

### Inspect the Service

Retrieve the Service Document from /.well-known/odp at the Service origin.

03

### Read its capabilities

Use only the Collection and Offering operations advertised by the Service.

04

### Explore the catalog

List, search, or retrieve authoritative catalog data directly from the Service.

05

### Continue through an Action

Select an advertised Action, then satisfy any authentication or payment requirements enforced by its target before invoking it.

The Service remains authoritative

A Directory helps an Agent locate Services and compare indexed metadata. The Agent retrieves current catalog data from the Service itself.

### Stable structure, flexible Offerings

ODP defines a small set of recognizable resources while allowing each Service to describe its own domain.

#### [Service](https://www.offeringprotocol.org/documentation/introduction/core-concepts/)

The organization or application being discovered.

#### [Collections](https://www.offeringprotocol.org/documentation/introduction/core-concepts/)

Optional groupings that help an Agent navigate a catalog.

#### [Offerings](https://www.offeringprotocol.org/documentation/introduction/core-concepts/)

Descriptions of what the Service makes available.

#### [Actions](https://www.offeringprotocol.org/documentation/introduction/core-concepts/)

The operations an Agent can perform next.

#### [Attribute Schemas](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Service-defined structure for specialized Offering data.

### Protocol composition

ODP describes what is available and where the next operation begins. Complementary protocols handle the responsibilities that follow discovery.

#### [AEP](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/)

Enrolls Agents and provides reusable Service credentials.

#### [MPP and x402](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/)

Handle payment for protected resources.

#### [Trust protocols](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/)

Communicate trust-related capabilities.

#### [MCP](https://www.offeringprotocol.org/documentation/introduction/protocol-composition/)

Exposes agent-oriented tools through advertised endpoints.

### Choose your path

Agent developers

### Consume ODP

Start with a Service origin, inspect its capabilities, and navigate the operations it advertises.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Service developers

### Publish ODP

Publish a Service Document and expose the catalog operations your Service supports.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

New to the terminology? Start with [Core concepts](https://www.offeringprotocol.org/documentation/introduction/core-concepts/).

On this page

- [Overview](#overview)
- [How discovery works](#discovery-flow)
- [Stable structure, flexible Offerings](#flexible-offerings)
- [Protocol composition](#protocol-composition)
- [Choose your path](#choose-path)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
