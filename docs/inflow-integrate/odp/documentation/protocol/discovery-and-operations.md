<!-- source: https://www.offeringprotocol.org/documentation/protocol/discovery-and-operations/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Protocol

# Follow advertised operations

Move from a Service origin to a valid catalog request without guessing which endpoints exist.

### Discovery sequence

An Agent can begin with a known Service origin or obtain a candidate origin from a Directory or another source. It then follows the capabilities declared by the Service.

01

### Select a Service origin

Use a known origin or choose a candidate Service returned by a Directory.

02

### Retrieve the Service Document

GET /.well-known/odp from the selected origin.

03

### Read the advertised operations

Select an operation by its name and declared authentication behavior.

04

### Send the selected operation

Combine the Service origin, endpoint base, and fixed path, then send the request with the operation's assigned method.

### Use the Directory to find a Service

A Directory can index public metadata and return candidate Service origins. That result is not a cross-Service Offering search result and does not replace direct Service inspection.

The Service remains authoritative

Before relying on catalog data, retrieve the current Service Document and catalog representations from the selected Service. [ODP](https://www.offeringprotocol.org/) conformance does not depend on a Directory.

### Operation descriptors

The Service Document's operations array contains no more than seven descriptors. Each descriptor contains exactly a unique name and its authentication requirement.

Every conformant Service advertises and implements list-offerings and get-offering. Collection and search operations are optional and appear only when implemented.

| Operation | Method | Fixed path | Default |
| --- | --- | --- | --- |
| list-collections | GET | collections | Terse items |
| search-collections | POST | collections/search | Terse items |
| get-collection | GET | collections/{collection\_id} | Full Collection |
| list-collection-offerings | GET | collections/{collection\_id}/offerings | Terse items |
| list-offerings | GET | offerings | Terse items |
| search-offerings | POST | offerings/search | Terse items |
| get-offering | GET | offerings/{offering\_id} | Full Offering |

### Construct the operation URL

Remove a trailing slash from http.endpoint\_base, append one slash, and then append the fixed path for the selected operation.

01

### Service origin

https://service.example

02

### Endpoint base

/odp

03

### Fixed operation path

offerings/research-report

### Constructed request URL

https://service.example/odp/offerings/research-report

### Substitute opaque identifiers

A Collection or Offering identifier is created by the Service and remains stable for that resource's lifetime. Collections and Offerings use separate identifier namespaces.

An Agent inserts a valid identifier verbatim into the path placeholder. It does not trim, case fold, parse, percent-encode, percent-decode, or infer meaning from the identifier.

Query parameters modify an operation only where that operation defines them. They do not carry Collection or Offering identifiers and do not become part of Resource Identity.

### Follow the authentication declaration

| Value | Meaning |
| --- | --- |
| not-required | The operation is usable without Service authentication. |
| optional | The operation is usable anonymously, while authentication can expand the visible content. |
| required | The Agent must authenticate to the Service before the operation can succeed. |

optional and required require the Service Document to advertise [AEP](https://www.aep.foundation/) enrollment. The operation descriptor communicates expected access, while the live response remains authoritative.

### Select a representation

Every Collection and Offering operation accepts one optional representation query parameter. terse requests a partial representation for navigation, while full requests every field the Service makes available for that request.

List and search operations default to terse items. Individual Collection and Offering retrieval defaults to a full representation. The operation table above shows each default.

See [Representations and schemas](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/) for field selection, inheritance, and schema behavior.

### Honor the operation contract

Advertising an operation declares its availability and authentication behavior. ODP defines the remaining HTTP requirements. An Agent must preserve the assigned method, path, parameter placement, request representation, and response representation.

| Boundary | Agent behavior |
| --- | --- |
| Method and path | Use the assigned GET or POST method and the fixed path for the selected operation. |
| Identifiers | Place Collection and Offering identifiers only in their path placeholders. Do not move them into query parameters. |
| Representation | Send at most one representation query parameter with the value terse or full. |
| Initial page size | Place limit in the query for a GET operation and in the top-level body of a POST search operation. |
| Search document | Send a POST search body using Content-Type: application/odp+json. |
| Response negotiation | Request application/odp+json with Accept and reject a successful ODP document returned with a different media type. |
| Continuation | Retrieve the supplied next URL with GET. Do not reconstruct the URL or repeat the original search body. |
| Outcomes | Treat an empty items array as a successful search with no matches. Interpret invalid requests and unavailable resources through ODP Problem Details. |

Search semantics, filters, and refinements are described in [Search and filtering](https://www.offeringprotocol.org/documentation/guides/search-and-filtering/). Pagination and continuation behavior are described in [Pagination and caching](https://www.offeringprotocol.org/documentation/protocol/pagination-and-caching/).

### Do not probe for capabilities

Unadvertised means unavailable

An Agent must not construct or invoke an ODP operation that the current Service Document does not advertise. A familiar fixed path is not permission to call it.

When the desired operation is absent, use an advertised operation that can satisfy the request or report that the capability is unavailable. For example, when search-offerings is absent, an Agent can use list-offerings and inspect the returned Offerings within its traversal limit.

### Next steps

Responses

### Interpret returned resources

Understand terse and full catalog documents and their schemas.

[Representations and schemas](https://www.offeringprotocol.org/documentation/protocol/representations-and-schemas/)

Access

### Respect protocol boundaries

Apply authentication requirements without leaking credentials across origins.

[Access and composition](https://www.offeringprotocol.org/documentation/protocol/access-and-composition/)

On this page

- [Discovery sequence](#discovery-sequence)
- [Use the Directory to find a Service](#authority)
- [Operation descriptors](#operation-descriptors)
- [Construct the operation URL](#url-construction)
- [Substitute opaque identifiers](#identifiers)
- [Follow the authentication declaration](#authentication)
- [Select a representation](#representations)
- [Honor the operation contract](#request-boundaries)
- [Do not probe for capabilities](#no-probing)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
