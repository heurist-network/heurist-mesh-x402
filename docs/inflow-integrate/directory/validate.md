<!-- source: https://directory.inflowpay.ai/validate/ -->
<!-- fetched: 2026-09-15 -->

# Validate your Service

The live page is a browser form: [https://directory.inflowpay.ai/validate/](https://directory.inflowpay.ai/validate/).

Enter the **canonical HTTPS origin** that serves protocol documents. No path, query, fragment, or credentials.

## What the validator actually checks

Same blocking checks used at publication. It does **not** invoke catalog operations, enrollment, or payment.

| Check | Requirement |
| --- | --- |
| Origin | Public HTTPS origin that identifies the Service |
| ODP Service Document | Retrieves `/.well-known/odp`, validates required operations, references, declared capabilities |
| Branding | Retrieves advertised icon/logo; supported formats only |
| Composed protocols | If AEP is advertised, validates `/.well-known/aep`; checks payment and trust declarations |

A pass means the **publication gate** is green. You still need to exercise advertised ops yourself (see [../odp/documentation/quick-start/validate-an-integration.md](../odp/documentation/quick-start/validate-an-integration.md)).

```bash
inflow odp inspect https://service.example
inflow odp offerings list https://service.example
inflow odp offerings get https://service.example <offering-id>
```
