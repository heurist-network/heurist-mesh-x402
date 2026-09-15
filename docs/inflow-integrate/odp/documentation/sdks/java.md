<!-- source: https://www.offeringprotocol.org/documentation/sdks/java/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

SDKs

# Java SDK

Choose role-specific Java modules and the Jackson generation already used by the hosting application.

The official SDK is developed in the [odp-java GitHub repository](https://github.com/offering-protocol/odp-java). Signed modules, the bill of materials, source archives, and Javadoc archives are published on [Maven Central](https://central.sonatype.com/namespace/org.offeringprotocol).

### Choose the modules for your role

The Java SDK separates protocol, Directory, Agent, and Service behavior. Applications import the bill of materials for version alignment, select their role module, and add exactly one JSON provider.

| Module | Use it when |
| --- | --- |
| odp-agent | An Agent discovers Services and navigates their live catalogs. |
| odp-service | A Service publishes its document and implements catalog operations. |
| odp-directory | An application searches the canonical Directory directly. |
| odp-core | Protocol tooling needs models, validation, references, or pagination primitives. |

### Align and install the modules

All artifacts use the org.offeringprotocol group and require Java 17 or newer. Import the bill of materials once; it manages compatible ODP module versions without adding modules or choosing Jackson.

1234567891011

```
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.offeringprotocol</groupId>
      <artifactId>odp-bom</artifactId>
      <version>0.2.1</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

Add the role module and exactly one provider. Use odp-json-jackson2 with Jackson 2 or replace it with odp-json-jackson3 in a Jackson 3 application.

123456789101112131415

```
<!-- Agent application -->
<dependency>
  <groupId>org.offeringprotocol</groupId>
  <artifactId>odp-agent</artifactId>
</dependency>
<!-- Service application -->
<dependency>
  <groupId>org.offeringprotocol</groupId>
  <artifactId>odp-service</artifactId>
</dependency>
<!-- Select exactly one JSON provider -->
<dependency>
  <groupId>org.offeringprotocol</groupId>
  <artifactId>odp-json-jackson2</artifactId>
</dependency>
```

### Navigate a known Service

OdpServiceClient.create retrieves and validates the Service Document once. The client records advertised operations and rejects an unsupported call before sending its catalog request.

1234567891011121314151617181920212223

```
import java.net.URI;
import org.offeringprotocol.odp.agent.OfferingDetails;
import org.offeringprotocol.odp.agent.OdpServiceClient;
import org.offeringprotocol.odp.agent.ServiceInspection;
import org.offeringprotocol.odp.core.OdpOperation;
import org.offeringprotocol.odp.core.Offering;
import org.offeringprotocol.odp.core.Page;

final OdpServiceClient service = OdpServiceClient.create(
        URI.create("https://demo.inflowpay.ai"));

final ServiceInspection inspection = service.inspection();
System.out.println(inspection.document().name());

if (inspection.supports(OdpOperation.LIST_OFFERINGS)) {
    final Page<Offering> page = service.listOfferings("terse", 10, "en");
    for (final Offering offering : page.items()) {
        System.out.println(offering.id() + ": " + offering.name());
        final OfferingDetails details = service.getOfferingDetails(offering.id(), "en");
        details.actions().forEach(action ->
                System.out.println("Action " + action.id() + ": " + action.rel()));
    }
}
```

Recreate the client when the application needs a refreshed Service Document. Use full Offering details to resolve Attribute Schemas and usable Actions; Action resolution never invokes the target.

### Discover across Services

OdpAgent searches the selected canonical Directory and then searches Services that advertise Offering search. Results remain useful when one Service fails because failures are emitted as issue events.

1234567891011121314151617

```
import org.offeringprotocol.odp.agent.OdpAgent;
import org.offeringprotocol.odp.directory.DirectoryClient;
import org.offeringprotocol.odp.directory.DirectoryEnvironment;

final DirectoryClient directory = DirectoryClient.create(
        DirectoryEnvironment.SANDBOX);
final OdpAgent agent = new OdpAgent(directory);

for (final OdpAgent.DiscoveryEvent event :
        agent.searchOfferings("web research", 10, 10)) {
    if (event instanceof OdpAgent.OfferingEvent offering) {
        System.out.println(
                offering.service().name() + ": " + offering.offering().name());
    } else if (event instanceof OdpAgent.IssueEvent issue) {
        System.err.println(issue.service().serviceOrigin() + ": " + issue.message());
    }
}
```

The two numeric limits bound candidate Services and retained Offerings per Service. Applications needing a list fallback can use the Directory and Service clients directly and select the operation from each Service Document.

### Publish a small Service

StaticCatalog validates a bounded in-memory catalog and provides the required Offering operations. OdpService generates the Service Document operation list from its configured endpoints.

123456789101112131415161718192021

```
import java.util.List;
import org.offeringprotocol.odp.core.OdpJson;
import org.offeringprotocol.odp.core.Offering;
import org.offeringprotocol.odp.service.OdpService;
import org.offeringprotocol.odp.service.StaticCatalog;

final Offering offering = OdpJson.parseOffering("""
        {
          "odp_version": "1.0",
          "id": "web-search",
          "name": "Web search"
        }
        """);

final OdpService service = OdpService.builder(
                "Example Research Service",
                "Research tools for Agents.",
                "en",
                "/odp")
        .endpoints(StaticCatalog.create(List.of(offering), List.of()))
        .build();
```

Adapt the host framework request into OdpHttpRequest, call service.handle, and write the returned OdpHttpResponse. The SDK deliberately does not depend on Spring, Jakarta, Netty, or another framework.

See the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) for the required Service Document and Offering operations represented by this configuration.

### Connect a production catalog

Large Services configure an EnumMap<OdpOperation, OdpService.Endpoint> whose handlers query the application's existing storage. Configure only implemented operations; the same map determines what the Service advertises.

- [Validated input](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/): CatalogRequest supplies representation, language, limit, cursor, request body, and the original framework-neutral request
- [Missing resources](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): return null for a missing detail resource and throw OdpServiceException for an intentional Problem Details response
- [Application ownership](https://www.offeringprotocol.org/documentation/quick-start/build-a-service/): the application retains persistence, authorization, indexing, caching headers, and concurrency policy

### Keep application responsibilities separate

The default Agent transport is anonymous. Inject OdpTransport when catalog requests require AEP credentials, MPP, x402, or application-specific HTTP policy. Supporting schemas and OpenAPI documents use a separate anonymous transport so Service credentials are not forwarded.

The application or injected transport owns public-address destination policy. The default Java HTTP client refuses redirects but does not replace the host application's network controls.

The bill of materials aligns ODP artifacts only. It does not add Jackson, select a Jackson generation, or manage the application's framework dependencies. Exactly one ODP JSON provider must be present at runtime.

### Run the examples

The odp-java repository includes a JDK HTTP server adapter and an Agent that uses an explicitly isolated mock Directory while making live requests to reachable Services.

- [Small Service](https://github.com/offering-protocol/odp-java/blob/main/examples/src/main/java/org/offeringprotocol/odp/examples/SmallService.java): publish a static catalog, Offering search, and a free download Action
- [Agent discovery](https://github.com/offering-protocol/odp-java/blob/main/examples/src/main/java/org/offeringprotocol/odp/examples/AgentDiscovery.java): inspect live Services and retrieve terse and full Offerings from mock Directory candidates

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

- [Choose the modules for your role](#choose-module)
- [Align and install the modules](#install)
- [Navigate a known Service](#agent-client)
- [Discover across Services](#federated-discovery)
- [Publish a small Service](#small-service)
- [Connect a production catalog](#production-catalog)
- [Keep application responsibilities separate](#runtime-boundaries)
- [Run the examples](#examples)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
