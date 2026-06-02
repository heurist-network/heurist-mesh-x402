import type { Express, Request, Response } from "express";
import { Mppx, Request as MppRequest, stripe, tempo } from "mppx/server";
import { config } from "../config/env.js";
import type { MeshMetadata } from "../types/mesh.js";
import type { RouteInfo } from "../types/payments.js";
import logger from "../utils/logger.js";
import { callMeshTool } from "./mesh-client.js";
import { collectToolRouteDefinitions, HEURIST_ATTRIBUTION_SUFFIX } from "./route-definitions.js";

const MPP_EXPOSE_HEADERS = ["WWW-Authenticate", "Payment-Receipt"];

export function generateMppRoutes(app: Express, metadata: MeshMetadata): RouteInfo[] {
  const routes: RouteInfo[] = [];

  if (!config.mpp.enabled) {
    logger.info("MPP disabled (MPP_ENABLED=false)");
    return routes;
  }

  const tempoRecipient = config.mpp.tempo.recipient.trim();
  const tempoCurrency = config.mpp.tempo.currency.trim();
  const secretKey = config.mpp.secretKey.trim();
  const stripeEnabled = config.mpp.stripe.enabled;
  const stripeSecretKey = config.mpp.stripe.secretKey.trim();
  const stripeNetworkId = config.mpp.stripe.networkId.trim();

  if (!tempoRecipient || !tempoCurrency || !secretKey) {
    logger.info(
      "MPP disabled (missing one of: MPP_SECRET_KEY, MPP_TEMPO_RECIPIENT, MPP_TEMPO_CURRENCY)"
    );
    return routes;
  }

  if (stripeEnabled && (!stripeSecretKey || !stripeNetworkId)) {
    logger.info(
      "MPP disabled (MPP_STRIPE_ENABLED=true but missing STRIPE_SECRET_KEY or MPP_STRIPE_NETWORK_ID)"
    );
    return routes;
  }

  const enabledMethods = ["tempo", ...(stripeEnabled ? ["stripe"] : [])];
  const methods = [
    tempo.charge({
      currency: tempoCurrency as `0x${string}`,
      recipient: tempoRecipient as `0x${string}`,
      ...(config.mpp.tempo.feePayer ? { feePayer: true } : {}),
    }),
    ...(stripeEnabled
      ? [
          stripe.charge({
            secretKey: stripeSecretKey,
            networkId: stripeNetworkId,
            paymentMethodTypes: config.mpp.stripe.paymentMethodTypes,
          }),
        ]
      : []),
  ];

  const mppx = Mppx.create({
    secretKey,
    methods,
  });

  const defs = collectToolRouteDefinitions(metadata, {
    protocol: "mpp",
    methods: enabledMethods,
    pathFor: (agentId, toolName) => `/mpp/agents/${agentId}/${toolName}`,
  });
  logger.info(`Generating MPP routes for ${defs.length} tools`);

  for (const def of defs) {
    app.post(
      def.path,
      exposeMppHeaders,
      createMppPaymentMiddleware(mppx, {
        amount: def.priceUsd,
        description: def.paymentDescription,
      }),
      createMppToolHandler(def.agentId, def.toolName)
    );

    routes.push(def.routeInfo);

    logger.info(
      `✓ Configured MPP route: POST ${def.path} ($${def.priceUsd} via ${enabledMethods.join("+")})`
    );
  }

  app.post(
    "/mpp/debug",
    exposeMppHeaders,
    createMppPaymentMiddleware(mppx, {
      amount: "0.001",
      description:
        "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time. " +
        HEURIST_ATTRIBUTION_SUFFIX,
    }),
    (_req: Request, res: Response) => {
      const sleepTime = Math.floor(Math.random() * 20) + 1;
      setTimeout(() => {
        res.json({
          message: "MPP debug endpoint response",
          sleepTime,
          method: "mpp",
          paymentMethods: enabledMethods,
        });
      }, sleepTime * 1000);
    }
  );

  routes.push({
    agentId: "debug",
    toolName: "debug",
    description: "Debug endpoint that sleeps for a random duration (1-20 seconds) and returns the sleep time.",
    path: "/mpp/debug",
    priceUsd: "0.001",
    protocol: "mpp",
    transport: "http",
    methods: enabledMethods,
  });

  logger.info(
    `Successfully registered ${routes.length} MPP routes with methods ${enabledMethods.join(", ")}`
  );
  return routes;
}

function createMppToolHandler(agentId: string, toolName: string) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info(`Executing MPP paid request for ${agentId}/${toolName}`);
      const toolArguments = req.body || {};
      const result = await callMeshTool(agentId, toolName, toolArguments);
      res.json({ result });
    } catch (error) {
      logger.error(`MPP route handler error for ${agentId}/${toolName}:`, error);
      res.status(500).json({
        error: "Tool execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

function exposeMppHeaders(_req: Request, res: Response, next: () => void): void {
  mergeExposeHeaders(res, MPP_EXPOSE_HEADERS);
  next();
}

function createMppPaymentMiddleware(
  mppx: any,
  options: {
    amount: string;
    description: string;
  }
) {
  const entries: any[] = [
    [
      mppx.tempo.charge,
      {
        amount: options.amount,
        description: options.description,
      },
    ],
  ];

  if (mppx.stripe?.charge) {
    entries.push([
      mppx.stripe.charge,
      {
        amount: options.amount,
        currency: "usd",
        decimals: 2,
        description: options.description,
      },
    ]);
  }

  const handlePayment = mppx.compose(...entries);

  return async (req: Request, res: Response, next: () => void): Promise<void> => {
    const result = await handlePayment(MppRequest.fromNodeListener(req, res));

    if (result.status === 402) {
      const challenge = result.challenge;
      res.status(challenge.status);
      for (const [key, value] of challenge.headers) {
        res.setHeader(key, value);
      }
      res.send(await challenge.text());
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      const wrapped = result.withReceipt(Response.json(body));
      const receipt = wrapped.headers.get("Payment-Receipt");
      if (receipt) {
        res.setHeader("Payment-Receipt", receipt);
      }
      return originalJson(body);
    };

    next();
  };
}

function mergeExposeHeaders(res: Response, headers: string[]): void {
  const existing = res.getHeader("Access-Control-Expose-Headers");
  const values =
    typeof existing === "string"
      ? existing
          .split(",")
          .map((header) => header.trim())
          .filter(Boolean)
      : [];
  const merged = Array.from(new Set([...values, ...headers]));
  res.set("Access-Control-Expose-Headers", merged.join(", "));
}
