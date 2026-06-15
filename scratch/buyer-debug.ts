// scratch/buyer-debug.ts — one full x402 settlement with debug:true (no real mesh call)
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, base } from "viem/chains";
import "dotenv/config";

const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error("Set TEST_PRIVATE_KEY in env");

const BASE_URL = process.env.GATEWAY_URL ?? "http://127.0.0.1:3402";
const CHAIN_NAME = process.env.CHAIN ?? "base-sepolia";
const PATH = CHAIN_NAME === "base-sepolia"
  ? "/x402/base-sepolia/agents/AIXBTProjectInfoAgent/search_projects"
  : "/x402/agents/AIXBTProjectInfoAgent/search_projects";

console.log("BASE_URL:", BASE_URL, "| CHAIN:", CHAIN_NAME, "| PATH:", PATH);

const account = privateKeyToAccount(PRIVATE_KEY);
console.log("Buyer address:", account.address);

const walletClient = createWalletClient({
  account,
  chain: CHAIN_NAME === "base-sepolia" ? baseSepolia : base,
  transport: http(),
});
const api = withPaymentInterceptor(axios.create(), walletClient);

async function main() {
  const body = { xHandle: "ethereum", limit: 1, debug: true }; // debug:true => skip real mesh call
  const t0 = Date.now();
  const resp = await api.post(`${BASE_URL}${PATH}`, body, {
    headers: { "content-type": "application/json" },
  });
  console.log(`STATUS: ${resp.status} (${Date.now() - t0}ms)`);
  console.log("DATA:", JSON.stringify(resp.data, null, 2));
  const receipt = resp.headers["x-payment-response"];
  if (receipt) console.log("X-PAYMENT-RESPONSE:", receipt);
}
main().catch((err) => {
  console.error("FAILED:", err?.response?.status, err?.response?.data ?? err?.message ?? err);
  process.exit(1);
});
