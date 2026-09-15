// Read-only production checks: never signs a payment or calls settlement.
import "dotenv/config";
import assert from "node:assert/strict";
import { createInflowSellerClient, inflowAccepts } from "@inflowpayai/x402-seller";

async function main() {
  const origin = process.env.BASE_URL || "https://mesh.heurist.xyz";
  const environment = process.env.INFLOW_ENVIRONMENT;
  assert(environment === "production" || environment === "sandbox");
  assert(process.env.INFLOW_API_KEY, "Missing seller key");
  const seller = await createInflowSellerClient({ environment, apiKey: process.env.INFLOW_API_KEY });
  const get = (path: string) => fetch(new URL(path, origin), { headers: { Accept: "application/odp+json" }, signal: AbortSignal.timeout(20000) });
  const inspect = await get("/.well-known/odp");
  assert.equal(inspect.status, 200);
  const document = await inspect.json();
  assert(document.protocols.payments.some((p: any) => p.name === "x402" && p.options.includes("inflow")));
  const aep = await fetch(`${origin}/.well-known/aep`);
  assert.equal(aep.status, 200);
  const ids: string[] = [];
  let next: string | undefined = "/odp/offerings?limit=100";
  while (next) {
    const response = await get(next);
    assert.equal(response.status, 200);
    const page = await response.json(); ids.push(...page.items.map((item: any) => item.id)); next = page.next;
  }
  assert(ids.length > 0);
  assert.equal(new Set(ids).size, ids.length);
  const expectedPrices = new Map<string, any[]>();
  const networks = new Set<string>();
  let first: { url: string; challenge: any } | undefined;
  for (const id of ids) {
    const response = await get(`/odp/offerings/${encodeURIComponent(id)}`);
    assert.equal(response.status, 200);
    const offering = await response.json();
    const action = offering.actions[0];
    assert(action.http.href.startsWith("/x402/inflow/agents/"));
    const url = new URL(action.http.href, origin).toString();
    const unpaid = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(20000) });
    assert.equal(unpaid.status, 402, `${id}: expected unpaid challenge`);
    assert.match(unpaid.headers.get("cache-control") || "", /no-store/);
    const challenge = JSON.parse(Buffer.from(unpaid.headers.get("payment-required")!, "base64").toString());
    assert.equal(challenge.x402Version, 2);
    assert.equal(challenge.resource.url, url);
    let expected = expectedPrices.get(offering.price.amount);
    if (!expected) {
      expected = await inflowAccepts(seller, { price: `$${offering.price.amount}`, schemes: ["exact", "balance"] });
      expectedPrices.set(offering.price.amount, expected);
    }
    assert.equal(challenge.accepts.length, expected.length);
    for (const [i, option] of expected.entries()) {
      const actual = challenge.accepts[i];
      for (const field of ["scheme", "network", "payTo"]) assert.equal(actual[field], option[field], `${id}: ${field}`);
      assert.equal(actual.amount, option.price.amount, `${id}: amount`);
      assert.equal(actual.asset, option.price.asset, `${id}: asset`);
      networks.add(actual.network);
    }
    first ??= { url, challenge };
  }
  assert(first);
  const accepted = first.challenge.accepts.find((a: any) => a.network === "eip155:8453");
  assert(accepted, "Base mainnet payment option required for invalid-proof test");
  const now = Math.floor(Date.now() / 1000);
  const forged = { x402Version: 2, resource: first.challenge.resource, accepted, payload: {
    signature: `0x${"00".repeat(65)}`,
    authorization: { from: "0x0000000000000000000000000000000000000001", to: accepted.payTo,
      value: accepted.amount, validAfter: String(now - 60), validBefore: String(now + 120), nonce: `0x${"01".repeat(32)}` },
  } };
  const rejectionStatuses: number[] = [];
  for (const proof of ["invalid-base64", Buffer.from(JSON.stringify(forged)).toString("base64")]) {
    const rejected = await fetch(first.url, { method: "POST", headers: { "Content-Type": "application/json", "PAYMENT-SIGNATURE": proof }, body: "{}", signal: AbortSignal.timeout(20000) });
    assert([400, 402].includes(rejected.status), `Invalid proof returned ${rejected.status}`);
    assert(!rejected.headers.has("payment-response"));
    rejectionStatuses.push(rejected.status);
  }
  console.log(JSON.stringify({ origin, environment, offerings: ids.length, matchingPaymentChallenges: ids.length,
    networks: [...networks], invalidPaymentStatuses: rejectionStatuses, paidSettlementTested: false }, null, 2));
}

main().catch(error => {
  // Avoid dumping SDK request objects, which may include authorization headers.
  console.error(error instanceof Error ? error.message : "Verification failed");
  process.exitCode = 1;
});
