<!-- source: https://www.offeringprotocol.org/documentation/tools/inflow-cli/ -->
<!-- fetched: 2026-09-15 -->

Docs Menu

Tools

# Navigate ODP from the terminal

Use InFlow to find Services, inspect their advertised capabilities, navigate Collections and Offerings, and hand structured results to an Agent without writing application code.

### Use one interface for people and Agents

The InFlow CLI exposes the same ODP navigation flow in two forms. An interactive terminal receives readable tables and detail views, while an Agent or automation can request a structured result with an explicit output format. Both forms use the same validated ODP client underneath.

Interactive

### Read the catalog

Run commands normally to see Service details, Offering summaries, Action inputs, and continuation instructions arranged for a terminal.

Structured

### Compose an Agent workflow

Set --format to json, toon, yaml, md, or jsonl when another program will consume the result.

### Install the InFlow CLI

The hosted installer selects and verifies the native package for macOS or Linux. Windows users can install through WinGet, and macOS users can alternatively use the Homebrew Cask. The complete platform instructions are available at [inflowcli.ai](https://www.inflowcli.ai/).

12

```
curl -fsSL https://inflowcli.ai/install.sh | bash
inflow --version
```

### Choose the right inspection command

Use the combined inspector when the protocols protecting a URL are unknown. It retrieves discovery metadata and sends a live HTTP probe to the supplied URL using the selected method. It does not enroll or pay, but the probe itself reaches the target, so use a safe URL and method. Use the focused ODP inspector when the goal is to read the Service Document without probing a catalog or Action endpoint.

12

```
inflow inspect https://demo.inflowpay.ai
inflow odp inspect https://demo.inflowpay.ai
```

- [inflow inspect](#inspection): inspect a URL across discovery, enrollment, and payment protocols
- [inflow odp inspect](#inspection): retrieve the ODP Service Document, canonical origin, resolved links, and advertised operations

### Navigate the ODP command groups

Each command group represents a distinct stage of discovery. Directory commands select a Service. Collection and Offering commands query that Service directly. Action resolution describes an executable request but stops before execution.

| Command | Purpose |
| --- | --- |
| inflow odp directory search, inflow odp directory suggest | Find candidate Services or complete a directory keyword prefix. |
| inflow odp inspect | Inspect one Service before choosing a supported catalog operation. |
| inflow odp collections list, inflow odp collections search, inflow odp collections get | Navigate catalog groupings and retrieve a Full Collection. |
| inflow odp offerings list, inflow odp offerings search, inflow odp offerings get | Browse summaries, search supported criteria, and retrieve a Full Offering. |
| inflow odp offerings capabilities | Resolve the filter and sort definitions available for an Offering search. |
| inflow odp offerings discover | Select Services through the Directory and search their catalogs within explicit bounds. |
| inflow odp actions resolve | Resolve one advertised Action into its request contract without invoking it. |

### Follow the Service's advertised operations

Before an initial Collection or Offering request, the CLI inspects the Service and verifies that the required operation is advertised. Action resolution retrieves the Full Offering through get-offering and resolves only an Action advertised by that Offering. The CLI does not construct an endpoint from a familiar path or assume that every Service implements optional search.

Use listing when search is unavailable

If a Service omits a search operation but advertises the corresponding list operation, the CLI returns ODP\_OPERATION\_NOT\_SUPPORTED, shows the operations that are available, and identifies the list command that can continue the workflow.

### Resolve search capabilities before filtering

Text search can be sent directly when search-offerings is advertised. Structured filters, refinements, and sort identifiers come from the Service's effective search-capability catalog and must not be invented from Offering field names.

12

```
inflow odp offerings capabilities https://demo.inflowpay.ai
inflow odp offerings search https://demo.inflowpay.ai web
```

The capabilities command resolves Service-wide definitions and, when --collection-id is supplied, definitions attached to that exact Collection. Use the returned identifiers with repeatable --filter and --refinement flags or with --sort.

### Bound discovery across Services

inflow odp offerings discover first selects Services through the Directory and then sends the Offering query and catalog criteria directly to each selected Service. Use --max-services, --max-offerings-per-service, and --concurrency to bound that fan-out.

Each selected Service can observe the query sent to it. The aggregate CLI result contains successful Offering matches and omits individual Service issue events. Use a direct per-Service command when the caller needs to inspect or report why one selected Service failed.

### Continue without interpreting the cursor

Directory, Collection, and Offering sequences can return an opaque next value. Interactive output prints a ready-to-run continuation command. Structured consumers pass the value through --next exactly as received.

1

```
inflow odp offerings list https://demo.inflowpay.ai --next '<opaque-next-value>'
```

A continuation resumes the operation that produced it. Do not combine it with a new query, limit, Collection, filter, refinement, or sort; start a new search when those inputs change.

### Resolve an Action without invoking it

A Full Offering can advertise one or more Actions. Select an Action by its identifier and resolve it to obtain its method, target, content type, input constraints, and response types. Resolution remains a discovery operation.

1

```
inflow odp actions resolve https://demo.inflowpay.ai search invoke
```

The command does not send the resolved request, perform enrollment, or initiate payment. After reviewing the contract, the caller separately decides whether to construct and execute the request through the protocol protecting the target.

### Begin discovery without a login

Directory search and focused ODP Service inspection are public operations and require no InFlow login. A direct catalog request can also complete anonymously when the Service permits it.

For a protected catalog request, the CLI follows the Service's AEP OpenAPI policy or a live AEP challenge. A known required policy permits authentication on the first request; otherwise, the CLI attempts the request anonymously before responding to a challenge. It can use a compatible stored Service credential or initiate the required AEP grant flow, which can require an InFlow login and human approval.

Credentials remain scoped to the Service that established them. Executing a resolved target and satisfying an MPP or x402 payment requirement remain separate commands and policy decisions.

### Choose output for the next consumer

The default terminal view favors scanning and copying identifiers. An Agent or pipeline should set --format explicitly so the result remains machine-readable even when standard output is redirected or no terminal is attached.

| Consumer | Recommended output | Reason |
| --- | --- | --- |
| Person in a terminal | Default interactive view | Tables and detail sections expose identifiers and next actions directly. |
| Agent or application | --format json | Stable field names support programmatic selection and composition. |
| Language-model context | --format toon or --format yaml | Structured text can be more compact or readable for the receiving model. |

### Keep discovery failures actionable

ODP failures carry a stable error code and a direct explanation. The CLI distinguishes a malformed Service Document, an unsupported operation, a remote HTTP failure, an invalid continuation combination, and a supporting resource such as an Attribute Schema that could not be resolved.

A supporting-resource issue can leave the surrounding Offering usable while identifying the unavailable capability. A failed operation does not cause the CLI to probe another unadvertised endpoint, discard the caller's criteria, or silently convert a protected request into an anonymous result.

### Next steps

Service discovery

### Understand the Directory

Learn what the Directory indexes, how Service-level filters work, and where direct Service navigation begins.

[Directory](https://www.offeringprotocol.org/documentation/tools/directory/)

Implementation evidence

### Validate an ODP implementation

Separate live integration validation from repeatable protocol conformance evidence.

[Validator and conformance](https://www.offeringprotocol.org/documentation/tools/validator-and-conformance/)

On this page

- [Why use the CLI](#why-cli)
- [Install](#install)
- [Inspection](#inspection)
- [Command groups](#command-map)
- [Advertised operations](#advertised-operations)
- [Search capabilities](#search-capabilities)
- [Discovery across Services](#federated-discovery)
- [Pagination](#pagination)
- [Action resolution](#action-resolution)
- [Discovery without login](#access-boundary)
- [Structured output](#structured-output)
- [Failures](#failures)
- [Next steps](#next-steps)

[Authored byInFlow[A]](https://www.inflowpay.ai/)
