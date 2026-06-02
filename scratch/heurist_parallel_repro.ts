/**
 * Parallel x402 load test for Heurist Mesh (Base mainnet USDC).
 *
 * Mirrors the AgentCore repro flow:
 *   1. POST → expect 402
 *   2. Sign EIP-3009 transferWithAuthorization (fresh nonce per call)
 *   3. POST with X-PAYMENT → expect 200
 *
 * Usage:
 *   export TEST_PRIVATE_KEY=0x...   # Base mainnet EOA with USDC (+ tiny ETH)
 *   pnpm tsx scratch/heurist_parallel_repro.ts 5 sequential
 *   pnpm tsx scratch/heurist_parallel_repro.ts 5 parallel
 *   pnpm tsx scratch/heurist_parallel_repro.ts 5 parallel --client interceptor --axios shared
 *   pnpm tsx scratch/heurist_parallel_repro.ts 5 parallel --path /x402/debug --body '{}'
 *   pnpm tsx scratch/heurist_parallel_repro.ts 5 parallel --body '{"symbols":["AAPL"],"debug":true}'
 *
 * Env:
 *   TEST_PRIVATE_KEY  — required (or PRIVATE_KEY)
 *   GATEWAY_URL       — default https://mesh.heurist.xyz
 *   AGENT_ID          — default YahooFinanceAgent
 *   TOOL_NAME         — default quote_snapshot
 */

import axios, { type AxiosInstance, type AxiosError } from "axios";
import { createWalletClient, http, type WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { PaymentRequirementsSchema } from "x402/types";
import {
  createPaymentHeader,
  selectPaymentRequirements,
} from "x402/client";
import { withPaymentInterceptor } from "x402-axios";

const DEFAULT_TICKERS = ["AAPL", "AMZN", "GOOGL", "MSFT", "NVDA", "TSLA", "META", "NFLX"];

type Mode = "sequential" | "parallel";
type ClientMode = "manual" | "interceptor";
type AxiosMode = "shared" | "per-call";

type CallResult = {
  label: string;
  ok: boolean;
  stage?: string;
  status?: number;
  error?: string;
  signMs?: number;
  retryMs?: number;
  totalMs?: number;
};

function usage(): never {
  console.error(`
Usage: pnpm tsx scratch/heurist_parallel_repro.ts <count> <sequential|parallel> [options]

Options:
  --client manual|interceptor   payment flow (default: manual)
  --axios shared|per-call       only for interceptor (default: per-call)
  --tickers AAPL,MSFT,...       symbols to use (default: first N from built-in list)
  --path /x402/debug            endpoint path (overrides agent/tool)
  --body JSON                   fixed body for every call (overrides tickers)
  --gateway URL                 override GATEWAY_URL
`);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let client: ClientMode = "manual";
  let axiosMode: AxiosMode = "per-call";
  let tickers: string[] | undefined;
  let gateway: string | undefined;
  let pathOverride: string | undefined;
  let bodyJson: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--client") {
      const v = argv[++i];
      if (v !== "manual" && v !== "interceptor") usage();
      client = v;
    } else if (a === "--axios") {
      const v = argv[++i];
      if (v !== "shared" && v !== "per-call") usage();
      axiosMode = v;
    } else if (a === "--tickers") {
      tickers = argv[++i]?.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (a === "--gateway") {
      gateway = argv[++i];
    } else if (a === "--path") {
      pathOverride = argv[++i];
    } else if (a === "--body") {
      bodyJson = argv[++i];
    } else if (a.startsWith("-")) {
      usage();
    } else {
      positional.push(a);
    }
  }

  const count = parseInt(positional[0] ?? "5", 10);
  const mode = (positional[1] ?? "sequential") as Mode;
  if (!Number.isFinite(count) || count < 1) usage();
  if (mode !== "sequential" && mode !== "parallel") usage();

  return { count, mode, client, axiosMode, tickers, gateway, pathOverride, bodyJson };
}

function fmtMs(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

async function paidCallManual(
  httpClient: AxiosInstance,
  walletClient: WalletClient,
  url: string,
  body: unknown,
  label: string,
): Promise<CallResult> {
  const t0 = performance.now();
  try {
    // Step 1: unpaid POST → 402
    let challengeRes;
    try {
      challengeRes = await httpClient.post(url, body, {
        headers: { "content-type": "application/json" },
        validateStatus: (s) => s === 402,
      });
    } catch (err) {
      const ax = err as AxiosError;
      return {
        label,
        ok: false,
        stage: "initial-post",
        status: ax.response?.status,
        error: ax.message,
        totalMs: performance.now() - t0,
      };
    }

    if (challengeRes.status !== 402) {
      return {
        label,
        ok: false,
        stage: "expect-402",
        status: challengeRes.status,
        error: `expected 402, got ${challengeRes.status}`,
        totalMs: performance.now() - t0,
      };
    }

    const { x402Version, accepts } = challengeRes.data as {
      x402Version: number;
      accepts: unknown[];
    };
    const parsed = accepts.map((x) => PaymentRequirementsSchema.parse(x));
    const selected = selectPaymentRequirements(parsed, "base", "exact");

    const tSign = performance.now();
    const paymentHeader = await createPaymentHeader(
      walletClient,
      x402Version,
      selected,
    );
    const signMs = performance.now() - tSign;

    // Step 2: paid retry
    const tRetry = performance.now();
    const paidRes = await httpClient.post(url, body, {
      headers: {
        "content-type": "application/json",
        "X-PAYMENT": paymentHeader,
        "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
      },
      validateStatus: () => true,
    });
    const retryMs = performance.now() - tRetry;

    if (paidRes.status !== 200) {
      const errBody =
        typeof paidRes.data === "object"
          ? JSON.stringify(paidRes.data).slice(0, 300)
          : String(paidRes.data).slice(0, 300);
      return {
        label,
        ok: false,
        stage: "retry-with-proof",
        status: paidRes.status,
        error: errBody,
        signMs,
        retryMs,
        totalMs: performance.now() - t0,
      };
    }

    return {
      label,
      ok: true,
      status: 200,
      signMs,
      retryMs,
      totalMs: performance.now() - t0,
    };
  } catch (err) {
    const ax = err as AxiosError;
    return {
      label,
      ok: false,
      stage: "exception",
      status: ax.response?.status,
      error: ax.message,
      totalMs: performance.now() - t0,
    };
  }
}

async function paidCallInterceptor(
  api: AxiosInstance,
  url: string,
  body: unknown,
  label: string,
): Promise<CallResult> {
  const t0 = performance.now();
  try {
    const resp = await api.post(url, body, {
      headers: { "content-type": "application/json" },
    });
    return {
      label,
      ok: resp.status === 200,
      status: resp.status,
      stage: resp.status === 200 ? undefined : "interceptor",
      error: resp.status === 200 ? undefined : JSON.stringify(resp.data).slice(0, 300),
      totalMs: performance.now() - t0,
    };
  } catch (err) {
    const ax = err as AxiosError;
    return {
      label,
      ok: false,
      stage: "interceptor-error",
      status: ax.response?.status,
      error: ax.message,
      totalMs: performance.now() - t0,
    };
  }
}

function printSummary(
  results: CallResult[],
  mode: Mode,
  client: ClientMode,
  axiosMode: AxiosMode,
  elapsedMs: number,
) {
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;

  console.log(`\n=== Summary (${mode}, client=${client}, axios=${axiosMode}, ${fmtMs(elapsedMs)} total) ===`);
  console.log(`  succeeded: ${ok}/${results.length}`);
  console.log(`  failed:    ${fail}/${results.length}`);

  for (const r of results) {
    if (r.ok) {
      const parts = [
        r.signMs != null ? `sign=${fmtMs(r.signMs)}` : null,
        r.retryMs != null ? `retry=${fmtMs(r.retryMs)}` : null,
        r.totalMs != null ? `total=${fmtMs(r.totalMs)}` : null,
      ]
        .filter(Boolean)
        .join(" ");
      console.log(`  ✓ ${r.label.padEnd(6)} ${parts}`);
    } else {
      console.log(
        `  ✗ ${r.label.padEnd(6)} stage=${r.stage ?? "?"} status=${r.status ?? "?"} ${r.error ?? ""}`,
      );
    }
  }
}

async function main() {
  const {
    count,
    mode,
    client,
    axiosMode,
    tickers: tickersArg,
    gateway: gatewayArg,
    pathOverride,
    bodyJson,
  } = parseArgs(process.argv.slice(2));

  const privateKey = (process.env.TEST_PRIVATE_KEY ?? process.env.PRIVATE_KEY) as
    | `0x${string}`
    | undefined;
  if (!privateKey) {
    console.error(
      "Set TEST_PRIVATE_KEY (or PRIVATE_KEY) — Base mainnet EOA with USDC (~$0.01/call at $0.002).",
    );
    process.exit(1);
  }

  const gateway = gatewayArg ?? process.env.GATEWAY_URL ?? "https://mesh.heurist.xyz";
  const agentId = process.env.AGENT_ID ?? "YahooFinanceAgent";
  const toolName = process.env.TOOL_NAME ?? "quote_snapshot";
  const path = pathOverride ?? `/x402/agents/${agentId}/${toolName}`;
  const url = `${gateway.replace(/\/$/, "")}${path}`;

  const fixedBody = bodyJson ? (JSON.parse(bodyJson) as Record<string, unknown>) : undefined;

  const account = privateKeyToAccount(privateKey);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  const labels: string[] = [];
  const bodies: unknown[] = [];

  if (fixedBody) {
    for (let i = 0; i < count; i++) {
      labels.push(String(i + 1));
      bodies.push(fixedBody);
    }
  } else {
    const tickers = (tickersArg ?? DEFAULT_TICKERS).slice(0, count);
    if (tickers.length < count) {
      console.error(`Need at least ${count} tickers; got ${tickers.length}`);
      process.exit(1);
    }
    for (const ticker of tickers) {
      labels.push(ticker);
      bodies.push({ symbols: [ticker] });
    }
  }

  const plainHttp = axios.create({ timeout: 120_000 });
  let sharedApi: AxiosInstance | undefined;
  if (client === "interceptor") {
    sharedApi = withPaymentInterceptor(axios.create({ timeout: 120_000 }), walletClient);
  }

  console.log("Gateway:  ", gateway);
  console.log("Endpoint: ", path);
  console.log("Wallet:   ", account.address);
  console.log("Mode:     ", mode, `× ${count}`);
  console.log("Client:   ", client, client === "interceptor" ? `(axios ${axiosMode})` : "");
  console.log("Labels:   ", labels.join(", "));
  if (fixedBody) console.log("Body:     ", bodyJson);
  console.log("");

  const jobs = labels.map((label, i) => {
    const body = bodies[i];

    if (client === "manual") {
      return () => paidCallManual(plainHttp, walletClient, url, body, label);
    }

    const api =
      axiosMode === "shared"
        ? sharedApi!
        : withPaymentInterceptor(axios.create({ timeout: 120_000 }), walletClient);
    return () => paidCallInterceptor(api, url, body, label);
  });

  const t0 = performance.now();
  let results: CallResult[];

  if (mode === "sequential") {
    results = [];
    for (const job of jobs) {
      results.push(await job());
    }
  } else {
    results = await Promise.all(jobs.map((j) => j()));
  }

  printSummary(results, mode, client, axiosMode, performance.now() - t0);

  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
