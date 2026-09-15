<!-- source: https://www.offeringprotocol.org/documentation/quick-start/build-a-service/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Quick start

# Build an ODP Service

Expose an existing catalog through a public Service Document and the ODP operations your application implements.

### Choose the Service origin

Begin with the HTTPS origin that will publish the Service Document and ODP resources. The origin from which the final Service Document is retrieved identifies the Service; a field inside the document does not replace it.

Generate ODP responses from the same catalog data used by the application. This keeps discovery results consistent with what the application currently offers.

Local development is explicit

Plain HTTP is permitted only for localhost, 127.0.0.1, or [::1]. Other host names require HTTPS even when they resolve to a loopback address.

### Map the existing catalog

Map what the application already makes available into ODP resources. Preserve the application's identifiers and meanings; ODP adds standard discovery resources without replacing the application's data model.

#### [Offerings](https://www.offeringprotocol.org/documentation/guides/offerings/)

Represent the products, services, content, capacity, or other items an Agent can discover.

#### [Collections](https://www.offeringprotocol.org/documentation/guides/collections/)

Add optional groupings only when they provide a useful navigation path through the Offerings.

#### [Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

Keep specialized fields in attributes and describe them with an Attribute Schema.

#### [Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Identify the operations available after discovery without performing those operations inside ODP.

### Start from the minimum service

Use the [Minimum service](https://www.offeringprotocol.org/documentation/examples/foundations/minimum-service/) as the protocol baseline. It provides the complete Service Document, Offering page, and Full Offering required before optional capabilities are introduced.

Replace the example origin, identifiers, and catalog data with the application's real values. Publish the well-known document at the Service origin, select an endpoint base, and implement the two operations it advertises.

### Connect the required operations

list-offerings and get-offering must read from the application's current catalog. The list operation exposes accessible terse representations; the retrieval operation resolves one returned identifier to its Full representation.

- [List Offerings](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/): return a deterministic sequence, paginate when necessary, and omit next from the final page
- [Get an Offering](https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/): treat the path identifier as opaque and return the Full Offering associated with it
- [Preserve representations](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/): keep the identifier and meaning consistent between terse and Full representations
- [Handle missing resources](https://www.offeringprotocol.org/documentation/protocol/errors-and-limits/): return an ODP Problem Details response when an Offering identifier does not exist

An empty Offering list is valid and means that the current request returned no Offerings.

### Implement the HTTP contract

Serve each successful top-level ODP document with a Content-Type whose media-type essence is application/odp+json. Each response body declares the ODP version it implements.

#### Representation negotiation

Honor Accept: application/odp+json and return 406 Not Acceptable when the request excludes the ODP representation.

#### Stable identifiers

Keep Offering identifiers stable for their lifetime and use the exact value returned by list operations during retrieval.

#### Bounded responses

Apply the protocol's document, collection, page, and string limits before returning a representation.

#### Structured failures

Return ODP Problem Details with stable error codes and parameter details when a request cannot be satisfied.

### Advertise only implemented capabilities

The Service Document tells Agents which operations are available. Advertise an operation only after its fixed path, request method, representation behavior, and declared authentication requirement are implemented.

Search, Collections, Actions, custom attributes, enrollment, and payment are optional capabilities with their own requirements. Add each capability only with the operations, schemas, or protocol advertisements it requires. When an operation requires or can expand content through Service authentication, advertise [AEP](https://www.aep.foundation/) and declare the operation's expected authentication behavior. Live endpoint challenges remain authoritative.

### Verify the deployed path

Request the deployed Service Document, follow its endpoint base to the Offering list, and retrieve an identifier returned by that list. Inspect the HTTP headers and decoded representations rather than validating source files in isolation.

1234567891011

```
curl --include \
  --header 'Accept: application/odp+json' \
  https://service.example/.well-known/odp

curl --include \
  --header 'Accept: application/odp+json' \
  https://service.example/odp/offerings

curl --include \
  --header 'Accept: application/odp+json' \
  https://service.example/odp/offerings/consultation
```

Replace consultation with an identifier returned by the deployed Service. Confirm that all three responses use the ODP media type, declare odp\_version, and preserve the Offering identity across representations.

### Next steps

Readiness

### Check the integration

Validate the deployed Service and every capability it advertises.

[Validate an integration](https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/)

Publication

### Make the Service discoverable

Submit the validated origin so Agents can locate the Service through the Directory.

[Publish to the Directory](https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/)

On this page

- [Choose the Service origin](#service-boundary)
- [Map the existing catalog](#catalog-model)
- [Start from the minimum service](#minimum-reference)
- [Connect the required operations](#required-operations)
- [Implement the HTTP contract](#http-contract)
- [Advertise only implemented capabilities](#capabilities)
- [Verify the deployed path](#verify-deployment)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
