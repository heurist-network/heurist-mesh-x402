<!-- source: https://www.offeringprotocol.org/documentation/sdks/go/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

SDKs

# Go SDK

Use idiomatic Go packages to discover Services, navigate catalogs, or publish ODP through the standard HTTP stack.

The official SDK is developed in the [odp-go GitHub repository](https://github.com/offering-protocol/odp-go). The module and its API reference are published on [pkg.go.dev](https://pkg.go.dev/github.com/offering-protocol/odp-go).

### Choose the package for your role

One Go module contains four packages with narrow responsibilities. Import only the role packages the application uses; each role depends on the root protocol package as needed.

| Package | Use it when |
| --- | --- |
| odp | Protocol models, validation, references, identities, and pagination are needed directly. |
| agent | An Agent inspects Services, navigates catalogs, or discovers Offerings across Directory results. |
| directory | An application searches the fixed production or sandbox Directory directly. |
| service | A Service publishes its document and catalog through net/http. |

### Install the SDK

The module requires Go 1.25 or newer. One module dependency supplies the root, Agent, Directory, and Service packages at a compatible version.

1

```
go get github.com/offering-protocol/odp-go@latest
```

### Navigate a known Service

agent.ServiceClient validates the well-known document and checks each advertised operation before sending a catalog request. Lazy Go iterators allow the caller to stop traversal without loading the complete catalog.

12345678910111213141516171819202122232425262728293031323334

```
import (
	"context"
	"fmt"

	"github.com/offering-protocol/odp-go/agent"
)

ctx := context.Background()
client, err := agent.NewServiceClient(agent.ServiceClientOptions{
	ServiceURL: "https://demo.inflowpay.ai",
})
if err != nil {
	return err
}

inspection, err := client.Inspect(ctx)
if err != nil {
	return err
}
fmt.Println(inspection.Document.Name)

for offering, err := range client.ListOfferings(ctx, agent.ListOptions{MaxItems: 10}) {
	if err != nil {
		return err
	}
	fmt.Println(offering.ID, offering.Name)
	details, err := client.GetOfferingDetails(ctx, offering.ID)
	if err != nil {
		return err
	}
	for _, action := range details.Actions {
		fmt.Println("Action", action.ID, action.Rel)
	}
}
```

Use the page methods when continuation links, refinements, or other page metadata are needed. Full Offering details resolve Attribute Schemas and normalize usable Actions without invoking them.

### Discover across Services

agent.Agent searches the canonical Directory and queries live Service catalogs with bounded concurrency. Filter candidate Services by the operation the Offering request will use.

12345678910111213141516171819202122232425262728293031323334353637383940

```
import (
	"context"
	"fmt"

	odp "github.com/offering-protocol/odp-go"
	"github.com/offering-protocol/odp-go/agent"
	"github.com/offering-protocol/odp-go/directory"
)

ctx := context.Background()
odpAgent, err := agent.New(agent.AgentOptions{
	Environment: directory.Sandbox,
})
if err != nil {
	return err
}

request := agent.FederatedSearchRequest{
	Services: directory.SearchRequest{
		Filters: &directory.ServiceFilters{
			Keywords: []string{"search"},
			Operations: []directory.OperationFilter{{
				Name: odp.OperationSearchOfferings,
			}},
		},
	},
	Offerings: agent.OfferingSearchOptions{Query: "web research"},
}

for event, err := range odpAgent.SearchOfferingsAcrossServices(ctx, request) {
	if err != nil {
		return err
	}
	switch event.Type {
	case agent.DiscoveryOffering:
		fmt.Println(event.Service.Name, event.Offering.Name)
	case agent.DiscoveryIssue:
		fmt.Println(event.Service.ServiceOrigin, event.Err)
	}
}
```

Results preserve Directory order. An unavailable or incompatible Service becomes an issue event without discarding successful Offerings from other Services.

### Publish a small Service

service.NewStaticCatalog provides the required Offering operations for a bounded in-memory catalog. service.Service implements http.Handler and derives its advertised operations from the configured catalog functions.

1234567891011121314151617181920212223242526272829303132333435

```
import (
	"net/http"

	odp "github.com/offering-protocol/odp-go"
	"github.com/offering-protocol/odp-go/service"
)

catalog, err := service.NewStaticCatalog(service.StaticCatalogOptions{
	Offerings: []odp.Offering{{
		ID:         "web-search",
		Name:       "Web search",
		ODPVersion: odp.Version,
	}},
})
if err != nil {
	return err
}

odpService, err := service.New(service.Options{
	Catalog: catalog,
	Document: odp.ServiceDocument{
		Description:   "Research tools for Agents.",
		HTTP:          odp.HTTPConfiguration{EndpointBase: "/odp"},
		Language:      "en",
		Localizations: []string{"en"},
		Name:          "Example Research Service",
	},
})
if err != nil {
	return err
}

mux := http.NewServeMux()
mux.Handle("/.well-known/odp", odpService)
mux.Handle("/odp/", odpService)
```

Mount the same handler at /.well-known/odp and the configured endpoint base. Authentication, payments, authorization, and rate limiting remain ordinary middleware around that handler.

See the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) for the required Service Document and Offering operations represented by this configuration.

### Connect a production catalog

Application-backed Services provide catalog functions that translate validated request context into storage queries. The configured optional functions also determine which optional operations the Service advertises.

1234567891011121314151617

```
import (
	odp "github.com/offering-protocol/odp-go"
	"github.com/offering-protocol/odp-go/service"
	"example.com/application/catalog"
)

func newService(repository *catalog.Repository, document odp.ServiceDocument) (*service.Service, error) {
	operations := service.Catalog{
		ListOfferings:   repository.ListOfferings,
		GetOffering:     repository.GetOffering,
		SearchOfferings: repository.SearchOfferings,
	}
	return service.New(service.Options{
		Catalog:  operations,
		Document: document,
	})
}
```

Each function receives cancellation, the original HTTP request, representation, language, limit, and cursor. The ODP runtime invokes only the function required for the incoming operation and never materializes the complete catalog.

### Keep application responsibilities separate

- [Network policy](https://www.offeringprotocol.org/documentation/protocol/security/): the default Agent transport rejects non-public destinations and unsafe redirects; an injected HTTP client owns equivalent protection
- [Authenticated caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/): set a stable cache partition for each authenticated principal and access context
- [Action boundary](https://www.offeringprotocol.org/documentation/guides/actions/): Action resolution returns validated metadata and never performs the Action
- [Service lifecycle](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/): the hosting server owns shutdown, telemetry, persistence, and middleware

### Run the examples

The odp-go repository includes a small public Service and an Agent that uses an explicitly labeled mock Directory while making real requests to reachable ODP Services.

- [Small Service](https://github.com/offering-protocol/odp-go/tree/main/examples/odp-service-small): publish an in-memory catalog and a working free download Action through net/http
- [Agent discovery](https://github.com/offering-protocol/odp-go/tree/main/examples/odp-agent-discovery): inspect live Services and retrieve terse and full Offerings through mock Directory results

### Next steps

Agent path

### Discover a Service

Inspect a Service and navigate only the operations it advertises.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Service path

### Design the integration

Map the existing catalog before selecting static or storage-backed integration.

[Build a Service](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/)

On this page

- [Choose the package for your role](#choose-package)
- [Install the SDK](#install)
- [Navigate a known Service](#agent-client)
- [Discover across Services](#federated-discovery)
- [Publish a small Service](#small-service)
- [Connect a production catalog](#production-catalog)
- [Keep application responsibilities separate](#runtime-boundaries)
- [Run the examples](#examples)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
