import type { Express } from "express";
import { resolve } from "node:path";
import { createOdpService, createStaticCatalog } from "@offering-protocol/service";
import { createAepService, createDidWebClientAssertionVerifier, createStaticEnrollmentPolicy, didWebIdentityMethod } from "@aep-foundation/service";
import { registerExpressAepRoutes } from "@aep-foundation/express";
import type { RouteInfo } from "../types/payments.js";
import { createAepStores } from "./aep-store.js";
import { fetchPublicDid } from "./aep-fetch.js";

export function registerInflowDiscovery(app: Express, routes: RouteInfo[], baseUrl: string, inflowEnabled: boolean) {
  const origin = new URL(baseUrl).origin;
  if (!origin.startsWith("https://")) throw new Error("InFlow discovery requires a canonical HTTPS origin");
  const stores = createAepStores(resolve(process.env.AEP_DATABASE_PATH || "data/aep.sqlite"));
  const aep = createAepService({
    serviceDid: `did:web:${new URL(origin).host.replace(/:/g, "%3A")}`,
    inspectUrl: `${origin}/.well-known/aep`, endpointBase: "/aep",
    identityMethods: [didWebIdentityMethod()],
    clientAssertionVerifier: createDidWebClientAssertionVerifier({ fetch: fetchPublicDid }),
    enrollmentPolicy: createStaticEnrollmentPolicy({ status: "active" }),
    ...stores,
  });
  // Bound concurrent identity resolution and per-client enrollment attempts.
  const attempts = new Map<string, { count: number; until: number }>();
  let active = 0;
  app.use("/aep", (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const key = req.socket.remoteAddress || "unknown";
    const entry = attempts.get(key) || { count: 0, until: now + 60_000 };
    attempts.set(key, entry);
    if (++entry.count > 120 || active >= 16) {
      res.set("Retry-After", "60").status(429).type("application/problem+json")
        .json({ type: "urn:aep:error:rate_limited", title: "Enrollment rate limit exceeded", status: 429, code: "rate_limited" });
      return;
    }
    active++;
    let released = false;
    const release = () => { if (!released) { released = true; active--; } };
    res.once("finish", release); res.once("close", release);
    next();
  });
  registerExpressAepRoutes(app, aep);

  const tools = routes.filter(route => route.agentId !== "debug");
  const idFor = (route: RouteInfo) => `${route.agentId}--${route.toolName}`;
  const schemas = new Map(tools.map(route => [idFor(route), route.parameters || { type: "object", properties: {} }]));
  app.get("/odp/schemas/:id", (req, res) => {
    const schema = schemas.get(req.params.id);
    if (!schema) { res.status(404).json({ error: "Unknown tool" }); return; }
    res.type("application/schema+json").json(schema);
  });
  const odp = createOdpService({
    document: {
      name: "Heurist Mesh", description: "The ultimate toolbox for agentic finance: live and historical asset prices, company fundamentals, SEC filings, web search, and blockchain data",
      language: "en", localizations: ["en"], http: { endpoint_base: "/odp" },
      branding: {
        icon: { src: "/inflow-branding/icon.svg", type: "image/svg+xml" },
        logo: { src: "/inflow-branding/logo.svg", type: "image/svg+xml" },
      },
      protocols: {
        enrollment: [{ name: "aep" }],
        payments: [{ name: "x402", authentication: "not-required", options: inflowEnabled ? ["inflow"] : ["base"] }],
      },
    },
    catalog: createStaticCatalog({ offerings: tools.map(route => ({
      odp_version: "1.0", id: idFor(route), name: `${route.agentId}: ${route.toolName}`,
      description: route.description,
      price: { type: "fixed", amount: route.priceUsd, currency: "USD" },
      actions: [{
        id: "invoke", rel: "invoke", authentication: "not-required",
        http: { href: route.path, method: "POST", request: {
          content_type: "application/json", schema: { url: `/odp/schemas/${encodeURIComponent(idFor(route))}` },
        }, response_content_types: ["application/json"] },
      }],
    })) }),
  });
  app.use(async (req, res, next) => {
    if (req.path !== "/.well-known/odp" && req.path !== "/odp" && !req.path.startsWith("/odp/")) { next(); return; }
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      const response = await odp.fetch(new Request(`${origin}${req.originalUrl}`, {
        method: req.method, headers,
        ...(!["GET", "HEAD"].includes(req.method) && req.body !== undefined ? { body: JSON.stringify(req.body) } : {}),
      }));
      res.status(response.status);
      response.headers.forEach((value, key) => res.set(key, value));
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) { next(error); }
  });
  return { odp, aep, close: stores.close };
}
