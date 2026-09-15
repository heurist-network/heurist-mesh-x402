// Default: inspect only. --pay signs and submits ONE production payment.
import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createPublicClient, http, parseAbi, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

async function main() {
  const url = "https://mesh.heurist.xyz/x402/inflow/agents/AIXBTProjectInfoAgent/get_market_summary";
  const recipient = "0xa112c9c8bf655c678c768b6fd42a1c6fbfed7d60";
  const usdc = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const body = "{}";
  const challengeResponse = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(20000) });
  assert.equal(challengeResponse.status, 402);
  const challenge = JSON.parse(Buffer.from(challengeResponse.headers.get("payment-required")!, "base64").toString());
  const accepted = challenge.accepts.find((a: any) => a.scheme === "exact" && a.network === "eip155:8453" && a.asset.toLowerCase() === usdc.toLowerCase());
  assert(accepted);
  assert.equal(accepted.amount, "1000", "Refusing a price other than 0.001 USDC");
  assert.equal(accepted.payTo.toLowerCase(), recipient);
  assert.equal(challenge.resource.url, url);
  assert.equal(accepted.extra.assetTransferMethod, "eip3009");
  const key = process.env.TEST_PRIVATE_KEY;
  assert(key && /^0x[0-9a-fA-F]{64}$/.test(key), "TEST_PRIVATE_KEY must contain the configured EVM test-wallet key");
  const buyer = privateKeyToAccount(key as `0x${string}`);
  const client = createPublicClient({ chain: base, transport: http("https://mainnet.base.org") });
  const abi = parseAbi(["function balanceOf(address) view returns (uint256)", "event Transfer(address indexed from, address indexed to, uint256 value)"]);
  const balance = await client.readContract({ address: usdc, abi, functionName: "balanceOf", args: [buyer.address] });
  assert(balance >= 1000n, "Test buyer needs at least 0.001 USDC");
  console.log(JSON.stringify({ mode: process.argv.includes("--pay") ? "PAY_ONCE" : "INSPECT_ONLY", url,
    buyer: buyer.address, recipient, amountUSDC: "0.001", buyerBalanceUSDC: Number(balance) / 1e6 }));
  if (!process.argv.includes("--pay")) return;
  const now = Math.floor(Date.now() / 1000);
  const authorization = { from: buyer.address, to: accepted.payTo as `0x${string}`, value: "1000",
    validAfter: String(now - 30), validBefore: String(now + 120), nonce: `0x${randomBytes(32).toString("hex")}` as `0x${string}` };
  const signature = await buyer.signTypedData({
    domain: { name: accepted.extra.name, version: accepted.extra.version, chainId: 8453, verifyingContract: usdc },
    types: { TransferWithAuthorization: [
      { name: "from", type: "address" }, { name: "to", type: "address" }, { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" }, { name: "validBefore", type: "uint256" }, { name: "nonce", type: "bytes32" },
    ] }, primaryType: "TransferWithAuthorization",
    message: { ...authorization, value: 1000n, validAfter: BigInt(authorization.validAfter), validBefore: BigInt(authorization.validBefore) },
  });
  const payment = { x402Version: 2, resource: challenge.resource, accepted, payload: { signature, authorization } };
  // Never retry an ambiguous paid request. Inspect the buyer/recipient transfers first.
  const response = await fetch(url, { method: "POST", headers: {
    "Content-Type": "application/json", "PAYMENT-SIGNATURE": Buffer.from(JSON.stringify(payment)).toString("base64"),
  }, body, signal: AbortSignal.timeout(180000) });
  const responseText = await response.text();
  const header = response.headers.get("payment-response");
  const receipt = header ? JSON.parse(Buffer.from(header, "base64").toString()) : null;
  console.log(JSON.stringify({ httpStatus: response.status, responseBytes: responseText.length, responsePreview: responseText.slice(0, 500), receipt }));
  assert.equal(response.status, 200, "Paid request failed; do not retry until payment state is checked");
  assert(receipt?.success && receipt.transaction, "Expected successful settlement receipt");
  assert.doesNotThrow(() => JSON.parse(responseText), "Expected Mesh JSON response");
  const chainReceipt = await client.waitForTransactionReceipt({ hash: receipt.transaction, timeout: 60000 });
  assert.equal(chainReceipt.status, "success");
  const transfers = parseEventLogs({ abi, logs: chainReceipt.logs.filter(log => log.address.toLowerCase() === usdc.toLowerCase()), eventName: "Transfer" });
  assert(transfers.some(log => log.args.from.toLowerCase() === buyer.address.toLowerCase() && log.args.to.toLowerCase() === recipient && log.args.value === 1000n), "Expected buyer-to-seller USDC transfer");
  console.log(JSON.stringify({ verifiedOnChain: true, transaction: receipt.transaction, amountUSDC: "0.001" }));
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Payment check failed"); process.exitCode = 1; });
