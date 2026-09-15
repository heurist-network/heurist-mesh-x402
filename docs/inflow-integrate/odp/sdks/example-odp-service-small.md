<!-- source: https://raw.githubusercontent.com/offering-protocol/odp-node/main/examples/odp-service-small/README.md -->
<!-- fetched: 2026-09-15 -->

# Small ODP Service

This example shows the configuration-first integration for a Service with a small in-memory
catalog. It publishes the required Offering operations and automatically advertises Collection
operations because Collections were configured. The free Offering includes a working download
Action.

Enter the example directory, copy the configuration template, and run the example:

```sh
cd examples/odp-service-small
cp .env.example .env
pnpm build
pnpm start
```

The checked-in `.env.example` selects `http://127.0.0.1:4101`; `PORT` is required. Startup output
identifies the Service document and ODP endpoint base; each request logs its method, path, and
response status.
