import { Router, type Express } from "express";
import { paymentMiddlewareFromConfig } from "@x402/express";
import { createInflowFacilitator, createInflowSellerClient, inflowAccepts, inflowSchemeRegistrations } from "@inflowpayai/x402-seller";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import { collectToolRouteDefinitions } from "./route-definitions.js";
import { callMeshTool } from "./mesh-client.js";

export async function generateInflowRoutes(app: Express, metadata: MeshMetadata): Promise<RouteInfo[]> {
  const apiKey = process.env.INFLOW_API_KEY;
  if (!apiKey) return [];
  const environment = process.env.INFLOW_ENVIRONMENT;
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("Set INFLOW_ENVIRONMENT to sandbox or production for the configured seller key");
  }
  const seller = await createInflowSellerClient({ environment, apiKey });
  const facilitator = createInflowFacilitator({ environment, apiKey });
  const definitions = collectToolRouteDefinitions(metadata, {
    protocol: "x402", pathFor: (agent, tool) => `/x402/inflow/agents/${agent}/${tool}`,
  });
  const priced: Parameters<typeof paymentMiddlewareFromConfig>[0] = {};
  const prices = new Map<string, Awaited<ReturnType<typeof inflowAccepts>>>();
  for (const def of definitions) {
    let accepts = prices.get(def.priceUsd);
    if (!accepts) {
      accepts = await inflowAccepts(seller, { price: `$${def.priceUsd}`, schemes: ["exact", "balance"] });
      if (!accepts.length) throw new Error(`InFlow seller has no payment options for price ${def.priceUsd}`);
      prices.set(def.priceUsd, accepts);
    }
    priced[`POST ${def.path}`] = { accepts, description: def.description, mimeType: "application/json" };
  }
  const router = Router();
  router.use(paymentMiddlewareFromConfig(priced, [facilitator], await inflowSchemeRegistrations(seller)));
  for (const def of definitions) {
    router.post(def.path, async (req, res) => {
      if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
        res.status(400).json({ error: "Expected a JSON object" });
        return;
      }
      try { res.json(await callMeshTool(def.agentId, def.toolName, req.body)); }
      catch { res.status(502).json({ error: "Mesh tool execution failed" }); }
    });
  }
  // Mount only after all seller configuration succeeds. Failures cannot leave
  // partially registered handlers or an unpaid path to the Mesh backend.
  app.use(router);
  return definitions.map(def => def.routeInfo);
}
