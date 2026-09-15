<!-- source: https://www.offeringprotocol.org/documentation/sdks/python/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

SDKs

# Python SDK

Use one typed Python distribution with dedicated modules for protocol, Directory, Agent, and Service integration.

The official SDK is developed in the [odp-python GitHub repository](https://github.com/offering-protocol/odp-python) and published as [offering-protocol on PyPI](https://pypi.org/project/offering-protocol/).

### Choose the module for your role

The offering-protocol distribution contains four modules. Applications import the module for the role they implement while sharing one compatible set of protocol models.

| Module | Use it when |
| --- | --- |
| offering\_protocol.agent | An Agent inspects Services, navigates catalogs, or performs federated discovery. |
| offering\_protocol.service | A Service publishes ODP through a framework-neutral request boundary. |
| offering\_protocol.directory | An application searches the canonical Directory directly. |
| offering\_protocol.core | Protocol tooling needs typed models, validation, references, or pagination. |

### Install the SDK

Python 3.11 or newer is required. One package installation supplies all four role modules and their type information.

1

```
python -m pip install offering-protocol
```

### Navigate a known Service

ServiceClient validates the live Service Document and raises UnsupportedOperationError before sending an unadvertised catalog request.

12345678910111213141516171819

```
import asyncio

from offering_protocol.agent import ServiceClient

async def main() -> None:
    async with ServiceClient("https://demo.inflowpay.ai") as service:
        inspection = await service.inspect()
        print(inspection.document.name)

        page = await service.list_offerings()
        for offering in page.items:
            print(offering.id, offering.name)

        if page.items:
            details = await service.get_offering_details(page.items[0].id)
            for action in details.actions:
                print(action.id, action.rel.value)

asyncio.run(main())
```

Use bounded traversal methods when more than one page is needed. Full Offering details resolve Attribute Schemas, validate attributes, and normalize usable Actions while reporting non-fatal issues separately.

### Discover across Services

Agent composes canonical Directory search with live Service catalog search. Restrict candidate Services to the operation the Offering request requires.

123456789101112131415161718192021222324252627282930313233

```
import asyncio

from offering_protocol.agent import Agent, FederatedSearchRequest
from offering_protocol.core import OfferingSearchRequest, Operation
from offering_protocol.directory import (
    Environment,
    OperationFilter,
    SearchRequest,
    ServiceFilters,
)

async def main() -> None:
    filters = ServiceFilters(
        keywords=["search"],
        operations=[OperationFilter(name=Operation.SEARCH_OFFERINGS)],
    )
    async with Agent(Environment.SANDBOX) as agent:
        events = await agent.search_offerings_across_services(
            FederatedSearchRequest(
                services=SearchRequest(filters=filters),
                offerings=OfferingSearchRequest(query="web research"),
                max_services=10,
                max_offerings_per_service=10,
            )
        )

    for event in events:
        if event.offering is not None:
            print(event.service.name, event.offering.name)
        else:
            print(event.service.service_origin, event.issue)

asyncio.run(main())
```

The result is a deterministic list of Offering or issue events. One failing Service does not discard Offerings from the remaining Services.

### Publish a small Service

StaticCatalog validates a bounded in-memory catalog and supplies the required Offering operations. ServiceBuilder derives the advertised operation list from that catalog.

12345678910111213141516171819202122232425

```
from offering_protocol.core import Offering
from offering_protocol.service import (
    ServiceBuilder,
    StaticCatalog,
    StaticCatalogOptions,
)

catalog = StaticCatalog(
    StaticCatalogOptions(
        offerings=(
            Offering(
                id="web-search",
                name="Web search",
                odp_version="1.0",
            ),
        ),
    )
)

service = ServiceBuilder(
    "Example Research Service",
    "Research tools for Agents.",
    "en",
    "/odp",
).build(catalog)
```

Convert the framework request into Request, await service.handle, and copy the returned status, headers, and body into the framework response. The SDK does not depend on FastAPI, Flask, Django, or another web framework.

See the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) for the required Service Document and Offering operations represented by this configuration.

### Connect a production catalog

Large Services implement the typed Catalog protocol over their existing storage and search layer. Required methods provide Offering listing and retrieval; optional methods and their reported operations must be added together.

1234567891011121314151617

```
from application import catalog_repository
from offering_protocol.core import Offering, OfferingPage, Operation
from offering_protocol.service import Catalog, CatalogRequest

class ApplicationCatalog(Catalog):
    def operations(self) -> list[Operation]:
        return [Operation.GET_OFFERING, Operation.LIST_OFFERINGS]

    async def list_offerings(
        self, request: CatalogRequest
    ) -> OfferingPage[Offering]:
        return await catalog_repository.list_offerings(request)

    async def get_offering(
        self, identifier: str, request: CatalogRequest
    ) -> Offering | None:
        return await catalog_repository.get_offering(identifier, request)
```

CatalogRequest contains the normalized representation, language, limit, cursor, and path. The runtime invokes only the selected operation and does not load or index the complete catalog.

### Keep application responsibilities separate

- [Network policy](https://www.offeringprotocol.org/documentation/protocol/security/): the built-in Agent transport validates public destinations; a custom authenticated catalog transport should use a separate credential-free supporting\_transport
- [Caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/): the default memory cache is process-local; authenticated clients need a distinct stable cache\_partition for each principal and access context
- [Action boundary](https://www.offeringprotocol.org/documentation/guides/actions/): resolution returns Action metadata and never enrolls, pays, or invokes the target
- [Service policy](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/): the host application owns authentication, payment middleware, persistence, and deployment lifecycle

### Run the examples

The odp-python repository includes a standard-library HTTP Service adapter and an Agent that inspects the live Service, lists only advertised resources, and retrieves full Offering details without invoking an Action.

- [Service example](https://github.com/offering-protocol/odp-python/blob/main/examples/service.py): publish a static catalog through ThreadingHTTPServer
- [Agent example](https://github.com/offering-protocol/odp-python/blob/main/examples/agent.py): inspect a local or remote Service and navigate only its advertised operations

### Next steps

Agent path

### Discover a Service

Inspect a Service and navigate only the operations it advertises.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Service path

### Design the integration

Map framework requests and catalog operations to the ODP boundary.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Choose the module for your role](#choose-module)
- [Install the SDK](#install)
- [Navigate a known Service](#agent-client)
- [Discover across Services](#federated-discovery)
- [Publish a small Service](#small-service)
- [Connect a production catalog](#production-catalog)
- [Keep application responsibilities separate](#runtime-boundaries)
- [Run the examples](#examples)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
