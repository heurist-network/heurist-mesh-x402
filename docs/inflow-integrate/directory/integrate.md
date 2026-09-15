<!-- source: https://directory.inflowpay.ai/integrate/ -->
<!-- fetched: 2026-09-15 -->

[Back to Directory](https://directory.inflowpay.ai/)

# Integrate your Service

Make your products discoverable, let agents enroll, and accept agent-native payments to publish your Service in the B2AI Directory.

## Build the complete agent commerce path

Directory listings are most useful when agents can move from finding a product to gaining access and paying for it.

ODP

### Products and discovery

Publish an ODP Service Document and expose the catalog operations agents use to browse, search, inspect, and act on products.[ODP Documentation](https://www.offeringprotocol.org/)

AEP

### Enrollment and access

Publish an AEP Service Document so agents can enroll, authenticate, and receive credentials for ongoing access.[AEP Documentation](https://www.aep.foundation/)

MPPx402

### Payments

Use the InFlow Node seller SDK to protect purchase endpoints with MPP or x402. Supporting either protocol satisfies the payment requirement; supporting both gives agents more choice.[InFlow Documentation](https://github.com/inflowpayai/)

## Publish your Service in seven steps

Complete each step once for every Service origin you want the directory to index.

1

### Create an InFlow Seller account

Use an InFlow Seller account to receive and manage payments from agents that purchase from your Service.[Create Seller account](https://app.inflowpay.ai/register/seller/)

2

### Make your products discoverable with ODP

Integrate an ODP Service SDK, publish the Service Document below, and declare only the catalog operations you implement. Return complete product details and purchase actions so agents know what you provide and how to proceed.

/.well-known/odp

3

### Enable agent enrollment with AEP

Integrate an AEP Service SDK, publish the Service Document below, and implement the enrollment commands you advertise. Agents should be able to enroll and receive reusable credentials before accessing protected catalog or purchase endpoints.

/.well-known/aep

4

### Enable agent payments

Use the InFlow Node seller SDK to choose MPP or x402, configure the payment options your Service accepts, and protect each purchase endpoint. Point every ODP purchase action to the corresponding protected endpoint.

Protocol references:[MPP protocol](https://mpp.dev/)[x402 protocol](https://x402.org/)

5

### Validate your Service integration

Run the same blocking checks used by directory publication, including ODP metadata, branding resources, advertised AEP support, and payment declarations. The results identify invalid documents, resources, and declarations before submission.[Validate your Service](https://directory.inflowpay.ai/validate/)

6

### Submit your Service origin

Choose the canonical HTTPS origin that serves your ODP document. Submit the origin itself without a path, query, or fragment - not a well-known document or product URL. Its documents and declared endpoints must be publicly reachable.

Example originhttps://api.example.com

Submit from your browserUse the guided form to validate and submit your Service origin from the browser.[Publish your Service](https://directory.inflowpay.ai/publish/)

Submit through the APIAgents and automated workflows can submit the same Service origin directly to the directory API.

Copy

```
curl --request POST https://directory.inflowpay.ai/v1/services \
  --header 'Content-Type: application/json' \
  --data '{"origin":"https://api.example.com"}'
```

7

### Verify your integration with InFlow CLI

Install InFlow CLI and inspect your canonical origin. Confirm that the output reports ODP, AEP, and the payment protocols your Service advertises.[Install InFlow CLI](https://www.inflowcli.ai)

Copy

```
inflow inspect https://api.example.com
```

### What happens after submission

Once listed, your Service becomes discoverable through InFlow CLI and the agents that use it. Agents can find your products, enroll for access, and follow your payment actions from discovery through purchase.
