// tests/buyer.ts
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios"; // ← correct export for v0.6.x
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";

// HOW TO RUN:
// export TEST_PRIVATE_KEY=0xYOUR_TEST_PRIVATE_KEY   # funded on Base Sepolia with a bit of ETH + USDC (test)
// export GATEWAY_URL=http://localhost:3402
// export GATEWAY_URL=https://mesh.heurist.xyz
// pnpm tsx tests/buyer.ts

const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error("Set TEST_PRIVATE_KEY in env (Base Sepolia key with tiny ETH + USDC)");

const BASE_URL = process.env.GATEWAY_URL ?? "http://localhost:3402";
const CHAIN_NAME = process.env.CHAIN ?? "base";  // set CHAIN=base-sepolia for testnet
console.log("BASE_URL:", BASE_URL);
console.log("CHAIN:", CHAIN_NAME);

const PATH = CHAIN_NAME === "base-sepolia"
  ? "/x402/base-sepolia/agents/AIXBTProjectInfoAgent/search_projects"
  : "/x402/agents/AIXBTProjectInfoAgent/search_projects";

// 1) viem wallet client (used to sign the X-PAYMENT header)
const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: CHAIN_NAME === "base-sepolia" ? baseSepolia : base,
  transport: http(),
});

// 2) axios instance with x402 payment interceptor attached
const api = withPaymentInterceptor(
  axios.create(),   // you can set baseURL here if you want
  walletClient
);

async function main() {
  const body = { xHandle: "ethereum", limit: 1 };

  // This ONE call will:
  // - make the POST
  // - see 402 Payment Required
  // - build/sign the X-PAYMENT header using your wallet client
  // - retry with the header
  // - return 200 + the paid response
  const resp = await api.post(`${BASE_URL}${PATH}`, body, {
    headers: { "content-type": "application/json" },
  });

  console.log("STATUS:", resp.status);
  console.log("DATA:", JSON.stringify(resp.data, null, 2));

  // (Optional) check the settlement receipt header if your server forwards it
  const paymentReceipt = resp.headers["x-payment-response"];
  if (paymentReceipt) {
    console.log("X-PAYMENT-RESPONSE:", paymentReceipt);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
