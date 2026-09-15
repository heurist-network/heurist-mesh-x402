<!-- source: https://www.offeringprotocol.org/documentation/sdks/nodejs/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

SDKs

# Node.js SDK

Use the official TypeScript packages to discover Services, navigate catalogs, or publish an ODP Service from Node.js.

The official SDK is developed in the [odp-node GitHub repository](https://github.com/offering-protocol/odp-node). Its [Agent](https://www.npmjs.com/package/@offering-protocol/agent), [Service](https://www.npmjs.com/package/@offering-protocol/service), [Directory](https://www.npmjs.com/package/@offering-protocol/directory), and [Core](https://www.npmjs.com/package/@offering-protocol/core) packages are published on npm.

### Choose the package for your role

The Node.js implementation separates Agent, Service, Directory, and shared protocol code into different packages. Install the package for the role your application implements instead of treating the repository as one combined client.

| Package | Use it when |
| --- | --- |
| @offering-protocol/agent | An Agent inspects a known Service, navigates its catalog, or discovers Offerings across Directory results. |
| @offering-protocol/service | A Service publishes its document and implements ODP catalog operations. |
| @offering-protocol/directory | An application searches the canonical Directory without the Agent orchestration layer. |
| @offering-protocol/core | An ODP implementation or validation tool needs protocol types, schemas, references, or pagination primitives. |

### Install the SDK

The packages require Node.js 22 or newer, include TypeScript declarations, and publish ESM-first builds with CommonJS entry points. Run only the installation command for the role selected above; npm installs its required ODP dependencies.

12345678

```
# Agent application
npm install @offering-protocol/agent
# Service application
npm install @offering-protocol/service
# Direct Directory access
npm install @offering-protocol/directory
# Protocol models and validation
npm install @offering-protocol/core
```

The same packages can be installed with pnpm or Yarn when those package managers own the application lockfile.

### Navigate a known Service

createOdpServiceClient inspects one Service origin and rejects an operation before sending its request when the current Service Document does not advertise it. Collection and Offering sequences are lazy asynchronous iterables, so the caller can bound traversal without loading an entire catalog.

1234567891011

```
import { createOdpServiceClient } from "@offering-protocol/agent";

const odp = createOdpServiceClient({
  serviceUrl: "https://demo.inflowpay.ai"
});

const inspection = await odp.inspect();
console.log(inspection.document.name, inspection.capabilities.operations);
for await (const offering of odp.listOfferings({ maxItems: 10 }).items) {
  console.log(await odp.getOffering(offering.id));
}
```

Inspection validates the well-known document before catalog navigation. The client preserves Offering identity from the terse list item through Full retrieval and resolves supporting Attribute Schemas when the Full Offering references one.

### Discover across Services

createOdpAgent composes canonical Directory search with live per-Service Offering search. The Directory selects candidate Services; each Service remains authoritative for its current catalog.

123456789101112131415

```
import { createOdpAgent } from "@offering-protocol/agent";

const agent = createOdpAgent({ environment: "sandbox" });

for await (const event of agent.searchOfferingsAcrossServices({
  services: {
    filters: { keywords: ["search"], operations: [{ name: "search-offerings" }] }
  },
  offerings: { query: "web research" },
  maxServices: 10,
  maxOfferingsPerService: 10
})) {
  if (event.type === "offering") console.log(event.service.name, event.offering);
  else console.error(event.service.service_origin, event.issue.message);
}
```

The environment selects a fixed production or sandbox Directory. Service requests run with bounded concurrency, and a failed Service produces an issue event without discarding Offerings returned by other Services.

### Publish a small Service

createOdpService implements the well-known document, fixed operation routes, request validation, representation negotiation, response validation, and ODP Problem Details. createStaticCatalog supplies the required Offering operations for a bounded in-memory catalog.

12345678910111213141516171819202122

```
import { createOdpService, createStaticCatalog } from "@offering-protocol/service";

const odp = createOdpService({
  document: {
    name: "Example Research Service",
    description: "Research tools for Agents.",
    language: "en",
    localizations: ["en"],
    http: { endpoint_base: "/odp" }
  },
  catalog: createStaticCatalog({
    offerings: [{
      odp_version: "1.0",
      id: "web-search",
      name: "Web search"
    }]
  })
});

export function handleOdp(request: Request): Promise<Response> {
  return odp.fetch(request);
}
```

The Service derives its advertised operations from the configured catalog handlers, so the document does not maintain a separate operation list. Its fetch(Request) interface uses Web-standard requests and responses; the application connects that interface through its own Node.js server or framework bridge.

See the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) for the required Service Document and Offering operations represented by this configuration.

### Connect a production catalog

Large or application-backed catalogs implement OdpCatalog directly. Each handler receives validated representation, language, limit, cursor, and Request context and translates that bounded input into the application's storage query.

12345678910111213

```
import {
  createOdpService,
  type OdpCatalog
} from "@offering-protocol/service";
import { database } from "./database.js";
import { serviceDocument } from "./service-document.js";

const catalog = {
  listOfferings: (request) => database.listOfferings(request),
  getOffering: (id, request) => database.getOffering(id, request)
} satisfies OdpCatalog;

const odp = createOdpService({ document: serviceDocument, catalog });
```

The Service runtime does not copy, sort, or index the complete catalog. The application owns persistence, authorization, tenant boundaries, stable cursors, and the consistency of the data returned by each handler.

### Respect the runtime boundaries

The SDK validates ODP data and enforces protocol navigation rules, but the surrounding application still owns its security and persistence policy.

- [Validation](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/): use throwing parsers for required-valid input and non-throwing parsers when invalid peer data is an expected outcome
- [Network policy](https://www.offeringprotocol.org/documentation/protocol/security/): the default Agent transport rejects non-public destinations, unsafe redirects, and cross-origin continuations
- [Authenticated caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/): a custom authenticated transport needs a stable cache partition for each access context
- [Action boundary](https://www.offeringprotocol.org/documentation/guides/actions/): Action resolution validates and describes the selected request but never invokes it automatically

### Run the examples

The odp-node repository contains runnable applications for public discovery, large catalogs, and composed authentication and payment flows. Each example documents its environment and startup commands.

- [Small public Service](https://github.com/offering-protocol/odp-node/tree/main/examples/odp-service-small): configure a bounded in-memory catalog and a working download Action
- [Marketplace catalog](https://github.com/offering-protocol/odp-node/tree/main/examples/odp-service-marketplace): connect storage-style handlers to a catalog containing millions of virtual Offerings
- [Agent discovery](https://github.com/offering-protocol/odp-node/tree/main/examples/odp-agent-discovery): exercise two-stage discovery with an in-process mock Directory and reachable Services
- [AEP and MPP](https://github.com/offering-protocol/odp-node/tree/main/examples/odp-service-aep-mpp): publish a public catalog whose Action requires AEP authentication and MPP payment
- [x402](https://github.com/offering-protocol/odp-node/tree/main/examples/odp-service-x402): publish a public catalog whose Action is protected by x402

### Next steps

Agent path

### Discover a Service

Inspect a Service and navigate only the operations it advertises.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Service path

### Design the integration

Map the application catalog and connect the required operations before selecting optional capabilities.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Choose the package for your role](#choose-package)
- [Install the SDK](#install)
- [Navigate a known Service](#agent-client)
- [Discover across Services](#federated-discovery)
- [Publish a small Service](#small-service)
- [Connect a production catalog](#production-catalog)
- [Respect the runtime boundaries](#runtime-boundaries)
- [Run the examples](#examples)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
