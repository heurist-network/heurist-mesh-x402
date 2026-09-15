<!-- source: https://www.offeringprotocol.org/documentation/quick-start/publish-to-directory/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Quick start

# Publish to the Directory

Submit a validated Service origin so Agents can find it, inspect its capabilities, and retrieve its authoritative catalog.

### Publish only a validated Service

Complete the [integration validation](https://www.offeringprotocol.org/documentation/quick-start/validate-an-integration/) before publication. The Directory requires a valid ODP Service Document advertising list-offerings and get-offering.

Before publication, verify separately that every advertised operation is deployed and working.

### Submit the canonical origin

Submit the HTTPS origin that identifies the Service and hosts its well-known document. The origin contains a scheme and host, plus a port only when the Service uses a non-default port. It contains no credentials, path, query, or fragment.

#### Submit this

https://api.example.com

#### Do not submit these

https://api.example.com/.well-known/odp, https://www.example.com/products, or an individual Offering URL.

The origin is the Service identity

Discovery begins at /.well-known/odp relative to the submitted origin. A website URL, endpoint base, or identifier inside the document does not replace that identity.

### Submit through the Directory website

Use the publication form to submit the canonical origin interactively. The form reports field and integration errors before accepting the Service. No InFlow account is required.

[Publish a Service](https://directory.inflowpay.ai/publish/)

### Submit through the API

Agents, deployment scripts, and automated workflows can use the public API instead of the browser form. Send a JSON object containing the canonical origin. The endpoint accepts application/json and returns the canonical origin accepted for indexing.

PublicPOSThttps://directory.inflowpay.ai/v1/services

123

```
curl --request POST https://directory.inflowpay.ai/v1/services \
  --header 'Content-Type: application/json' \
  --data '{\"origin\":\"https://api.example.com\"}'
```

A successful submission returns 202 Accepted with this response:

123

```
{
  "service_origin": "https://api.example.com"
}
```

202 Accepted means that the origin passed the Directory's submission checks and was accepted for indexing. The submission request does not execute every advertised catalog operation.

### What publication provides

The Directory creates or updates one listing for the canonical origin. Once indexed, a valid and visible Service can appear in Directory search and on its public Service page, allowing Agents to find it through the Directory website, API, and InFlow CLI.

- [Service metadata](https://www.offeringprotocol.org/documentation/guides/service-documents/): indexes the Service name, description, keywords, links, protocols, and supported operations
- [Branding](https://www.offeringprotocol.org/documentation/guides/branding-and-localization/): retrieves and prepares the advertised Service icon and logo
- [Directory discovery](https://www.offeringprotocol.org/documentation/tools/directory/): makes the listing available to the Directory website, API, and InFlow CLI

The Service remains authoritative

The Directory helps an Agent find and compare Services. The Agent retrieves current Collections, Offerings, Attribute Schemas, and Actions from the Service origin rather than treating indexed metadata as the authoritative catalog.

### Refresh the listing

The Directory refreshes Service metadata automatically according to the deployed resources and their HTTP caching information. Publish document changes at the same canonical origin so the existing Service identity remains stable.

Submitting the same origin again reuses the existing listing and requests a prompt metadata and branding refresh. Resubmit after changing the Service Document or replacing its icon or logo when you want the Directory to revisit those resources.

### Resolve submission failures

| Result | Meaning |
| --- | --- |
| Invalid origin | The submitted value is not a canonical public HTTPS origin. |
| Invalid Service | The deployed origin does not pass the Directory's submission checks. Run the Directory Validator for the individual findings. |
| Rate limited | Wait for the interval communicated by Retry-After before submitting again. |

The browser form displays field and integration errors on the page. Directory API failures use application/problem+json and identify invalid parameters where applicable. Malformed JSON and unsupported request media types are API request errors. Correct the deployed integration rather than repeatedly resubmitting an unchanged origin.

### Next steps

Agent path

### Discover the published Service

Approach the listing and Service origin as an Agent with no prior knowledge of its catalog.

[Discover a Service](https://www.offeringprotocol.org/documentation/quick-start/discover-a-service/)

Directory

### Understand indexed metadata

Learn what the Directory indexes and what remains authoritative at the Service.

[Directory](https://www.offeringprotocol.org/documentation/tools/directory/)

On this page

- [Publish only a validated Service](#validated-service)
- [Submit the canonical origin](#canonical-origin)
- [Submit through the Directory website](#browser-submission)
- [Submit through the API](#api-submission)
- [What publication provides](#after-acceptance)
- [Refresh the listing](#listing-refresh)
- [Resolve submission failures](#submission-failures)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
