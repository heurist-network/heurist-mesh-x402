<!-- source: https://www.offeringprotocol.org/documentation/sdks/rust/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

SDKs

# Rust SDK

Compose focused Rust crates for protocol models, Directory access, Agent discovery, and Service integration.

The official SDK is developed in the [odp-rust GitHub repository](https://github.com/offering-protocol/odp-rust). The [Agent](https://crates.io/crates/odp-agent), [Service](https://crates.io/crates/odp-service), [Directory](https://crates.io/crates/odp-directory), and [Core](https://crates.io/crates/odp-core) crates are published on crates.io with API references on [docs.rs](https://docs.rs/odp-agent/latest/odp_agent/).

### Choose the crates for your role

The odp-rust repository is a Cargo workspace that separates transport-independent protocol behavior from asynchronous Agent and Directory networking and framework-neutral Service integration. Declare only crates whose public types the application names.

| Crate | Use it when |
| --- | --- |
| odp-agent | An asynchronous Agent inspects Services and navigates or searches their catalogs. |
| odp-service | A Service exposes validated operations independently of its web framework. |
| odp-directory | An application searches the canonical Directory directly. |
| odp-core | Protocol tooling needs models, embedded schemas, references, or validation. |

### Install the SDK

Rust 1.85 or newer is required. Agent applications normally select three crates; Service applications select Core and Service. The crates share one release version.

12345

```
# Agent application
[dependencies]
odp-agent = "0.1.1"
odp-core = "0.1.1"
odp-directory = "0.1.1"
```

1234

```
# Service application
[dependencies]
odp-core = "0.1.1"
odp-service = "0.1.1"
```

### Navigate a known Service

ServiceClient validates the Service Document, checks operation advertisement, and provides bounded asynchronous catalog traversal.

12345678910111213141516171819202122232425

```
use odp_agent::{ServiceClient, TraversalOptions};
use odp_core::Representation;

let client = ServiceClient::new("https://demo.inflowpay.ai")?;
let inspection = client.inspect().await?;
println!("{}", inspection.document.name);

let offerings = client
    .list_all_offerings(
        Representation::Terse,
        50,
        TraversalOptions {
            max_items: 10,
            max_pages: 2,
        },
    )
    .await?;

for offering in &offerings {
    println!("{}: {}", offering.id, offering.name);
    let details = client.get_offering_details(&offering.id).await?;
    for action in details.actions {
        println!("Action {}: {:?}", action.id, action.rel);
    }
}
```

The default Rustls-backed transport rejects unsafe network destinations. Full Offering details resolve Attribute Schemas and normalize usable Actions; resolving an Action never invokes it.

### Discover across Services

Agent composes canonical Directory search with bounded concurrent requests to live Services. Filtering for Offering search prevents predictable unsupported-operation events.

1234567891011121314151617181920212223242526272829303132333435363738

```
use odp_agent::{Agent, FederatedSearchRequest};
use odp_core::{OfferingSearchRequest, Operation, VERSION};
use odp_directory::{
    Environment, OperationFilter, SearchRequest, ServiceFilters,
};

let agent = Agent::new(Environment::Sandbox)?;
let events = agent
    .search_offerings_across_services(&FederatedSearchRequest {
        concurrency: 4,
        max_offerings_per_service: 10,
        max_services: 10,
        offerings: OfferingSearchRequest {
            odp_version: VERSION.to_owned(),
            query: "web research".to_owned(),
            ..OfferingSearchRequest::default()
        },
        services: SearchRequest {
            filters: Some(ServiceFilters {
                keywords: vec!["search".to_owned()],
                operations: vec![OperationFilter {
                    authentication: None,
                    name: Operation::SearchOfferings,
                }],
                ..ServiceFilters::default()
            }),
            ..SearchRequest::default()
        },
    })
    .await?;

for event in events {
    if let Some(offering) = event.offering {
        println!("{}: {}", event.service.name, offering.name);
    } else if let Some(issue) = event.issue {
        eprintln!("{}: {}", event.service.service_origin, issue);
    }
}
```

Each returned event contains an Offering or a Service-specific issue. Results retain Directory order even though Service requests execute concurrently.

### Publish a small Service

StaticCatalog validates in-memory resources and supplies bounded, expiring continuations. ServiceBuilder derives the current Service Document and advertised operations from the catalog.

123456789101112131415161718192021

```
use std::sync::Arc;

use odp_core::parse_offering;
use odp_service::{ServiceBuilder, StaticCatalog, StaticCatalogOptions};

let offering = parse_offering(
    br#"{"id":"web-search","name":"Web search","odp_version":"1.0"}"#,
)?;

let catalog = StaticCatalog::new(StaticCatalogOptions {
    collections: Vec::new(),
    offerings: vec![offering],
})?;

let service = ServiceBuilder::new(
    "Example Research Service",
    "Research tools for Agents.",
    "en",
    "/odp",
)
.build(Arc::new(catalog))?;
```

Adapt framework requests into odp\_service::Request, await Service::handle, and translate its response. Authentication, payments, routing, and persistence remain with the host application.

See the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) for the required Service Document and Offering operations represented by this configuration.

### Connect a production catalog

Large Services implement the asynchronous Catalog trait over their repository. The required methods list and retrieve Offerings; optional methods and their matching Operation values must be implemented together.

- [Bounded requests](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): CatalogRequest provides representation, language, limit, cursor, and canonical path
- [Concurrency](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/): the Catalog is Send + Sync and owns the concurrency behavior of its dependencies
- [Operation truth](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/): operations() must report exactly the methods the implementation supports

### Keep application responsibilities separate

Core has no asynchronous runtime or HTTP dependency. Agent and Directory supply injectable asynchronous transport with a Rustls default. Service has no Axum, Actix Web, or other framework dependency.

The application supplies authentication and payment clients after inspecting protocol advertisements. Supporting documents are fetched anonymously and separately from credential-bearing Service requests.

Set a stable cache partition for each authenticated principal and access context so representations fetched with different credentials do not share cached data.

### Run the examples

The odp-rust repository contains a minimal Service adapter and an Agent that injects a mock Directory while sending real HTTP requests to configured Services.

- [Small Service](https://github.com/offering-protocol/odp-rust/tree/main/examples/odp-service-small): publish a static catalog and free download Action through a small HTTP adapter
- [Agent discovery](https://github.com/offering-protocol/odp-rust/tree/main/examples/odp-agent-discovery): inspect reachable Services and navigate Collections, Offerings, and Actions

### Next steps

Agent path

### Discover a Service

Inspect a Service and navigate only the operations it advertises.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Service path

### Design the integration

Map the application's repository and framework boundaries before implementing Catalog.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Choose the crates for your role](#choose-crate)
- [Install the SDK](#install)
- [Navigate a known Service](#agent-client)
- [Discover across Services](#federated-discovery)
- [Publish a small Service](#small-service)
- [Connect a production catalog](#production-catalog)
- [Keep application responsibilities separate](#runtime-boundaries)
- [Run the examples](#examples)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
