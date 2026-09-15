<!-- source: https://www.offeringprotocol.org/documentation/examples/commerce/free-digital-offering/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Examples

# Free digital Offering

See how a Service publishes a free handbook with machine-readable file metadata and an anonymous PDF download. ODP describes the artifact and its download operation; the endpoint delivers the bytes.

### What this Offering represents

The agent-safety-handbook-2 Offering represents release 2.1.0 of the Agent Safety Handbook. An Agent can discover the handbook, present its license and described file representations, and offer the advertised PDF download without enrolling with or paying the Service.

| Field | Value | Purpose |
| --- | --- | --- |
| id | agent-safety-handbook-2 | Gives the handbook a stable Local Resource Identifier. |
| web\_url | /handbooks/agent-safety | Links to the human-facing handbook page at the Service Origin. |
| price | free | Explicitly advertises that no price is required. |
| schema | digital-artifact-2.json | Defines the types and constraints of the artifact metadata. |
| actions | download-pdf | Advertises the operation that returns the PDF representation. |

1234567891011121314151617181920212223242526272829303132333435363738394041424344454647

```
{
  "odp_version": "1.0",
  "id": "agent-safety-handbook-2",
  "name": "Agent Safety Handbook",
  "description": "A free handbook covering bounded network access and credential handling for autonomous agents.",
  "web_url": "/handbooks/agent-safety",
  "price": {
    "type": "free"
  },
  "schema": {
    "url": "https://downloads.example/schemas/digital-artifact-2.json"
  },
  "attributes": {
    "version": "2.1.0",
    "license": "CC-BY-4.0",
    "languages": [
      "en"
    ],
    "files": [
      {
        "media_type": "application/pdf",
        "byte_size": 2487310,
        "sha256": "4a44dc15364204a80fe80e9039455cc1608281820fe2b24a4407e5c2250b079d"
      },
      {
        "media_type": "text/markdown",
        "byte_size": 184220,
        "sha256": "f5ca38f748a1d6e4af726b8a42fb575c3c71b5f0b7d1f4e6f5e5d8b7e3c9a101"
      }
    ]
  },
  "actions": [
    {
      "id": "download-pdf",
      "rel": "download",
      "description": "Download the PDF representation without enrollment or payment.",
      "http": {
        "href": "/artifacts/agent-safety-handbook-2.1.0.pdf",
        "method": "GET",
        "response_content_types": [
          "application/pdf"
        ]
      },
      "authentication": "not-required"
    }
  ]
}
```

### Advertise free explicitly

The free Price Preview states that the Service advertises the Offering without a price. Omitting price would mean only that the Offering provides no Price Preview; it would not mean free.

Price, Action purpose, and authentication are separate declarations. free describes price, download describes what the Action does, and not-required describes access to its target. A download Action is not inherently free or anonymous.

Free discovery does not invoke the download

Retrieving the Offering returns its description and metadata. The Agent waits for the caller to select download-pdf before requesting the file. If the endpoint returns an unexpected authentication or payment challenge, the Agent must surface it rather than ignore it or pay automatically.

### Describe the digital artifact

The Attribute Schema defines metadata for this Service's digital artifacts. These fields are not universal ODP properties, and another Service can use a different schema for its own downloadable content.

| Attribute | Example | Meaning in this schema |
| --- | --- | --- |
| version | 2.1.0 | The publisher-assigned handbook release, not the ODP version. |
| license | CC-BY-4.0 | The license governing use of the artifact. |
| languages | en | BCP 47 language tags represented in the content. |
| files | PDF and Markdown | The file representations included in this release. |

languages describes the handbook's content. It is separate from ODP's standard language field, which identifies the language of human-readable text in an ODP representation.

### Describe each file representation

Each files entry provides a media type, exact byte size, and SHA-256 digest. Applications can display these details before download and use them to check received bytes when appropriate.

| Format | Size | Advertised access |
| --- | --- | --- |
| application/pdf | 2487310 bytes | download-pdf advertises a PDF response. |
| text/markdown | 184220 bytes | No Action or download URL is advertised for this representation. |

File entries are metadata, not download links. ODP does not create an operation from a media type or digest. A Service must advertise an Action or another documented mechanism for every representation it wants an Agent to retrieve.

### Download the PDF

The download-pdf Action uses the registered download relation and a compact HTTP target. It provides the method, target, and expected successful response type for the PDF request.

| Field | Value | Meaning |
| --- | --- | --- |
| rel | download | Retrieves a downloadable representation. |
| href | /artifacts/agent-safety-handbook-2.1.0.pdf | Resolves against the Service Origin. |
| method | GET | Uses safe retrieval semantics and sends no request body. |
| response\_content\_types | application/pdf | Advertises the expected successful response type. |
| authentication | not-required | States that the download is usable without Service authentication. |

The live response remains authoritative. Its Content-Type determines how the Agent interprets a successful response; response\_content\_types describes what the Service expects to return. The Service-defined digest can be compared with the received bytes, but ODP does not require every application to store or verify downloaded files.

### Follow discovery to download

The Offering separates learning about the handbook from retrieving its bytes. Each network operation happens only when the caller reaches the corresponding step.

01

### Discover the handbook

Find the handbook through the Service's advertised Offering operations.

02

### Retrieve the Full Offering

Read its explicit free price, Attribute Schema reference, file metadata, and available Action.

03

### Interpret the metadata

Use the Attribute Schema to validate the release, license, language, format, size, and digest values.

04

### Select the PDF Action

Wait for the caller to choose download-pdf; discovery alone does not authorize the download request.

05

### Retrieve the file

Send the anonymous GET, evaluate the live response, and process the PDF according to the caller's instructions.

### Keep digital delivery outside ODP

ODP describes the artifact and identifies the PDF download operation. The Service application hosts the bytes, returns the correct media type, applies any access policy, and keeps the published version and digest metadata accurate. ODP does not define content storage, license enforcement, update delivery, or local file handling.

### Inspect the example artifacts

The example domains are illustrative. A deployed Service must host the referenced schema and download target.

- [Generated example](https://www.offeringprotocol.org/examples/free-digital-product/): open the published example and its source files
- [Full Offering](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/free-digital-product/free-digital-product-offering.json): inspect the artifact metadata and PDF download Action
- [Attribute Schema](https://github.com/offering-protocol/odp-specs/blob/main/ietf/examples/free-digital-product/digital-product-attributes.schema.json): inspect the types and constraints applied to the attributes

### Next steps

Execution

### Define another operation

Learn when to use a compact HTTP target and when an Action needs OpenAPI.

[Actions](https://www.offeringprotocol.org/documentation/guides/actions/)

Service metadata

### Model another artifact

Publish a schema that gives your own Offering attributes a clear structure.

[Custom attributes](https://www.offeringprotocol.org/documentation/guides/custom-attributes/)

On this page

- [What this Offering represents](#offering)
- [Advertise free explicitly](#free-price)
- [Describe the digital artifact](#attributes)
- [Describe each file representation](#representations)
- [Download the PDF](#download)
- [Follow discovery to download](#flow)
- [Keep digital delivery outside ODP](#delivery)
- [Inspect the example artifacts](#artifacts)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
