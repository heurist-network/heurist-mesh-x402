import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import express from "express";
import { SignJWT, importPKCS8 } from "jose";
import { createAepService, createDidWebClientAssertionVerifier, createStaticEnrollmentPolicy, didWebIdentityMethod } from "@aep-foundation/service";
import { registerInflowDiscovery } from "../src/services/inflow-discovery.js";
import { createAepStores } from "../src/services/aep-store.js";
import { fetchPublicDid } from "../src/services/aep-fetch.js";

test("ODP lists every tool once, serves schemas, negotiates media, and resolves paid actions", async () => {
  process.env.AEP_DATABASE_PATH = join(mkdtempSync(join(tmpdir(), "inflow-discovery-")), "aep.sqlite");
  const app = express();
  app.use(express.json({ type: ["application/json", "application/aep+json", "application/odp+json"] }));
  const discovery = registerInflowDiscovery(app, Array.from({ length: 105 }, (_, i) => ({
    agentId: "TestAgent", toolName: `tool${i}`, path: `/x402/base/agents/TestAgent/tool${i}`,
    description: "Test tool", priceUsd: "0.001", protocol: "x402" as const, transport: "http" as const,
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  })), "https://mesh.heurist.xyz", false);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  const get = (path: string, accept = "application/odp+json") => fetch(origin + path, { headers: { Accept: accept } });
  try {
    const inspect = await get("/.well-known/odp");
    assert.equal(inspect.status, 200);
    assert.match(inspect.headers.get("content-type")!, /application\/odp\+json/);
    const document = await inspect.json();
    assert.deepEqual(document.operations.map((op: any) => op.name).sort(), ["get-offering", "list-offerings"]);
    assert.equal((await get("/.well-known/odp", "text/html")).status, 406);
    const ids = new Set<string>();
    let path: string | undefined = "/odp/offerings?limit=17";
    while (path) {
      const response = await get(path); assert.equal(response.status, 200);
      const page = await response.json();
      for (const item of page.items) { assert(!ids.has(item.id)); ids.add(item.id); assert(!item.actions); }
      path = page.next;
    }
    assert.equal(ids.size, 105);
    const offering = await (await get("/odp/offerings/TestAgent--tool0")).json();
    assert.equal(offering.actions[0].http.href, "/x402/base/agents/TestAgent/tool0");
    const schema = await (await get(offering.actions[0].http.request.schema.url)).json();
    assert.deepEqual(schema.required, ["query"]);
    assert.equal((await get("/odp/offerings/missing")).status, 404);
    const aep = await (await get("/.well-known/aep", "application/aep+json")).json();
    assert.deepEqual(aep.commands.supported.sort(), ["enroll", "inspect", "status"]);
    assert.equal((await fetch(origin + "/aep/status")).status, 401);
    assert.equal((await fetch(origin + "/aep/enroll", {
      method: "POST", headers: { "Content-Type": "application/aep+json", Authorization: "AEP invalid" },
      body: JSON.stringify({ agent_did: "did:web:agent.example.com", idempotency_key: randomUUID() }),
    })).status, 401);
  } finally { server.close(); discovery.close(); }
});

test("signed AEP enrollment, replay protection, and idempotency survive reopening SQLite", async () => {
  const filename = join(mkdtempSync(join(tmpdir(), "inflow-aep-")), "aep.sqlite");
  const pair = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const key = await importPKCS8(pair.privateKey.export({ format: "pem", type: "pkcs8" }).toString(), "ES256");
  const agentDid = "did:web:agent.example.com";
  const verifier = createDidWebClientAssertionVerifier({ fetch: async input => {
    assert.equal(String(input), "https://agent.example.com/.well-known/did.json");
    return Response.json({
      id: agentDid,
      verificationMethod: [{ id: `${agentDid}#key-1`, type: "JsonWebKey2020", controller: agentDid,
        publicKeyJwk: pair.publicKey.export({ format: "jwk" }) }],
      authentication: [`${agentDid}#key-1`],
    });
  } });
  const serviceDid = "did:web:mesh.heurist.xyz";
  const sign = (op: string) => new SignJWT({ op }).setProtectedHeader({ alg: "ES256", typ: "JWT", kid: `${agentDid}#key-1` })
    .setIssuer(agentDid).setSubject(agentDid).setAudience(serviceDid).setIssuedAt().setExpirationTime("2m").setJti(randomUUID()).sign(key);
  const serviceFor = (stores: ReturnType<typeof createAepStores>) => createAepService({
    serviceDid, identityMethods: [didWebIdentityMethod()], clientAssertionVerifier: verifier,
    enrollmentPolicy: createStaticEnrollmentPolicy({ status: "active" }), ...stores,
  });
  let stores = createAepStores(filename);
  let service = serviceFor(stores);
  const idempotencyKey = randomUUID();
  const enroll = await service.enroll({ agent_did: agentDid, idempotency_key: idempotencyKey }, { clientAssertion: await sign("enroll"), idempotencyKey });
  assert(enroll.status >= 200 && enroll.status < 300, JSON.stringify(enroll));
  const token = await sign("status");
  assert.equal((await service.status({ clientAssertion: token })).status, 200);
  stores.close();
  stores = createAepStores(filename); service = serviceFor(stores);
  try {
    assert.equal((await service.status({ clientAssertion: token })).status, 401);
    assert.equal((await service.status({ clientAssertion: await sign("status") })).status, 200);
    const again = await service.enroll({ agent_did: agentDid, idempotency_key: idempotencyKey }, { clientAssertion: await sign("enroll"), idempotencyKey });
    assert.deepEqual(again.body, enroll.body);
    let executions = 0;
    const input = { agentDid, command: "enroll" as const, idempotencyKey: randomUUID(), requestHash: "same" };
    const results = await Promise.all(Array.from({ length: 4 }, () => stores.commandIdempotencyStore.executeIdempotentCommand(input, async () => {
      executions++; await new Promise(resolve => setTimeout(resolve, 10));
      return { status: 200, contentType: "application/aep+json", body: {} };
    })));
    assert.equal(executions, 1);
    assert.equal(results.filter(result => result.state === "created").length, 1);
    assert.equal((await stores.commandIdempotencyStore.executeIdempotentCommand({ ...input, requestHash: "different" }, () => { throw new Error("must not execute"); })).state, "conflict");
  } finally { stores.close(); }
});

test("DID resolver blocks internal, metadata, non-HTTPS and credential-bearing URLs", async () => {
  for (const url of ["http://example.com/a", "https://127.0.0.1/a", "https://169.254.169.254/a", "https://[::1]/a", "https://user:pass@example.com/a", "https://example.com:8443/a"]) {
    await assert.rejects(fetchPublicDid(url));
  }
});
