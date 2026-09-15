<!-- source: https://directory.inflowpay.ai/publish/ -->
<!-- fetched: 2026-09-15 -->

# Publish your Service

The live page is a guided form: [https://directory.inflowpay.ai/publish/](https://directory.inflowpay.ai/publish/). No InFlow account is required.

The directory runs Service integration validation before accepting the origin for indexing.

## ODP is required

Your Service must return a valid ODP Service Document with the ODP media type (`application/odp+json`) at `/.well-known/odp` before it can be submitted.

## Origin rules

Submit the canonical origin only. Do **not** submit the ODP document URL, a product URL, or any path beneath the origin.

| Submit | Do not submit |
| --- | --- |
| `https://api.example.com` | `https://api.example.com/.well-known/odp` |
| `https://api.example.com:8443` (non-default port only) | `https://www.example.com/products` |
| | An individual Offering URL |

Discovery always starts at `/.well-known/odp` relative to that origin.

## API (same payload as the form)

```bash
curl --request POST https://directory.inflowpay.ai/v1/services \
  --header 'Content-Type: application/json' \
  --data '{"origin":"https://api.example.com"}'
```

Success: `202 Accepted`

```json
{ "service_origin": "https://api.example.com" }
```

202 means the origin passed submission checks and was accepted for indexing. It does not execute every advertised catalog operation.

Full sequence: [../odp/documentation/quick-start/publish-to-directory.md](../odp/documentation/quick-start/publish-to-directory.md).
