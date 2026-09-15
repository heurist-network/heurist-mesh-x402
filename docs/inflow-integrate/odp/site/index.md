<!-- source: https://www.offeringprotocol.org/ -->
<!-- fetched: 2026-09-15 -->

[Authored byInFlow[A]](https://www.inflowpay.ai/)

Offering Discovery Protocol

# A protocol for agents to discover products and services

### ODP is the most agent-compatible, deterministic way for agents to find offerings, then [onboard](https://www.aep.foundation/) and [pay](https://github.com/inflowpayai/).

[Search for Offerings[P]](https://directory.inflowpay.ai/)[Get Listed on ODP[L]](https://directory.inflowpay.ai/integrate/)

[Agent](https://directory.inflowpay.ai/)

How ODP works

### From a task, to a search, to an action

### Given only a task, an agent finds the right services and ends up with an action it can take

Pre-ODP

### Search the B2AI Directory

An agent, given a task without a Service address explicitly provided, queries the B2AI directory by keyword and receives a shortlist of matching Services to evaluate.

[Go to Directory](https://directory.inflowpay.ai/)

Directory search

A shortlist of matching services

1--4

### Read the Service Document

One GET tells an agent which operations this Service implements, whether each needs authentication, and which protocols it advertises to pay: x402 and/or MPP.

Gethttps://exa.ai/.well-known/odp

Service document

Operations, auth, and payment protocols

2--4

### List or search the catalogue

The Service returns its Offerings: a list of products or services it sells or provides. Each Offering starts as a preview for evaluation, before calling for full detail.

Gethttps://exa.ai/odp/offerings

List offerings

Neural search, among several offerings

3--4

### Read the full Offering

The full Offering provides its own attributes, accompanied by its own schema to explain these attributes. No industry standard is needed, the Seller defines its own attributes and explains them.

Gethttps://exa.ai/odp/offerings/neural-search-api

Full offering

Priced per query, in USDC

4--4

### Resolve an action, without executing it

To proceed, the agent resolves the purchase action for that Offering to return its target and method, without transacting anything. Next steps: [onboarding](https://www.aep.foundation/) and [paying](https://github.com/inflowpayai/).

Resolves to:Post/actions/purchases/birds-nest-fern

Resolve action

Invoked resolved, nothing sent yet

### One open format to open the market

### More market reach for agents, more demand for sellers

[Docs[D]](https://www.offeringprotocol.org/documentation/)

One integration, works with any Service

An agent calls only the operations a Service advertises, so one integration reads every Service, no custom logic per seller.

Publish once, reach every agent

A Service only advertises what it implements, and every agent gets the same shape, so publishing once reaches any agent.

One shape for any industry, no committee required

The protocol defines the envelope, the seller defines the contents, and publishes a schema explaining them, so no industry has to agree first.

### Onboard, pay, and everything else that matters

### Enroll through AEP, pay through x402 or MPP, see how fast a Service goes live, and publish your own service

AEP enrollment

Onboard and authenticate with Agent Enrollment Protocol (AEP)

No more guest checkouts or manual signups for each Service, one AEP credential does it everywhere.

[Go to AEP.Foundation](https://www.aep.foundation/)

x402 payment

Pay through x402 or MPP, run with the InFlow CLI

A wallet for agents to onboard and pay autonomously with human-in-the-loop for out-of-policy transactions only.

[Check out InFlow CLI](https://github.com/inflowpayai/)

SDK setup

A robust SDK to get published

The SDK generates the Service Document from your existing product data, so integrating means configuring it once.

[Read the Integration Guide](https://directory.inflowpay.ai/integrate/)

exa-offerings.json

Run discounts and promotions, agent-only

Since price lives on the Offering itself, a seller can run discounts or promotions aimed only at agents, winning the exact comparison an agent runs before choosing.

[Learn more](https://www.offeringprotocol.org/documentation/)

### To discover, and to be discovered

[Publish your Service[L]](https://directory.inflowpay.ai/integrate/)[Read the Specs[S]](https://www.offeringprotocol.org/documentation/)
