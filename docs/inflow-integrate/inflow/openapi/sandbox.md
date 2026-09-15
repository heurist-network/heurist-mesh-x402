<!-- source: converted from sandbox.json -->
<!-- fetched: 2026-09-15 -->

# InFlow API Reference (sandbox)

**Title:** InFlow API Reference
**Version:** 1.0
**Description:** API for interacting with the InFlow platform.

## Servers

- `https://sandbox.inflowpay.ai/`

## Auth schemes

- **API Key Authentication**: `apiKey` in `header` name `X-API-Key` — 

## Endpoints

### `POST /v1/users/agentic`

Create an agentic user

Creates a new agentic user and returns a private key. This private key is used for authentication by passing it in the `X-API-Key` header. The private key should be stored securely.

Request body content types: application/json

```json
{
  "$ref": "#/components/schemas/AgenticUserRequest"
}
```

Responses:
- `400`: Bad Request
- `404`: Not Found
- `200`: OK

