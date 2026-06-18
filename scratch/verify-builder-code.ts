// scratch/verify-builder-code.ts
// End-to-end verification of ERC-8021 builder-code attribution on Base mainnet.
// 1. Pays $0.001 to the production /x402/debug route (v1 x402, gasless ERC-3009).
// 2. Reads the settlement txHash from the X-PAYMENT-RESPONSE header.
// 3. Fetches the on-chain calldata and decodes the appended ERC-8021 Schema 2 suffix.
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import "dotenv/config";

const PRIVATE_KEY = process.env.TEST_PRIVATE_KEY as `0x${string}`;
if (!PRIVATE_KEY) throw new Error("Set TEST_PRIVATE_KEY in env");
const GATEWAY = "https://mesh.heurist.xyz";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const MARKER = "80218021802180218021802180218021";

const account = privateKeyToAccount(PRIVATE_KEY);
const pub = createPublicClient({ chain: base, transport: http() });
const wallet = createWalletClient({ account, chain: base, transport: http() });
const api = withPaymentInterceptor(axios.create(), wallet);

// Minimal CBOR decoder for the builder-code map (text strings + arrays only).
function decodeCbor(buf: Buffer): any {
  let i = 0;
  function read(): any {
    const b = buf[i++];
    const major = b >> 5;
    const minor = b & 0x1f;
    const len = minor <= 23 ? minor : minor === 24 ? buf[i++] : (() => { throw new Error("len?"); })();
    if (major === 3) { const s = buf.subarray(i, i + len).toString("utf8"); i += len; return s; }
    if (major === 4) { const a: any[] = []; for (let k = 0; k < len; k++) a.push(read()); return a; }
    if (major === 5) { const o: any = {}; for (let k = 0; k < len; k++) { const key = read(); o[key] = read(); } return o; }
    throw new Error("unexpected major " + major);
  }
  return read();
}

function decodeSuffix(calldataHex: string) {
  const hex = calldataHex.startsWith("0x") ? calldataHex.slice(2) : calldataHex;
  if (!hex.toLowerCase().endsWith(MARKER)) return null;
  const buf = Buffer.from(hex, "hex");
  const marker = buf.subarray(buf.length - 16);
  const schemaId = buf[buf.length - 17];
  const cborLen = buf.readUInt16BE(buf.length - 19);
  const cbor = buf.subarray(buf.length - 19 - cborLen, buf.length - 19);
  return { schemaId, cborLen, cborHex: cbor.toString("hex"), decoded: decodeCbor(cbor) };
}

async function main() {
  console.log("Buyer:", account.address);
  const bal = (await pub.readContract({
    address: USDC, abi: [{ name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] }],
    functionName: "balanceOf", args: [account.address],
  })) as bigint;
  console.log("USDC balance (base):", Number(bal) / 1e6, "USDC");
  if (bal < 2000n) { console.error("Insufficient USDC (need >= 0.002). Fund the buyer and retry."); process.exit(1); }

  console.log("Paying $0.001 to", `${GATEWAY}/x402/debug`, "...");
  const resp = await api.post(`${GATEWAY}/x402/debug`, {}, { headers: { "content-type": "application/json" } });
  console.log("STATUS:", resp.status, "DATA:", JSON.stringify(resp.data));

  const receiptB64 = resp.headers["x-payment-response"] || resp.headers["payment-response"];
  if (!receiptB64) { console.error("No X-PAYMENT-RESPONSE header"); process.exit(1); }
  const receipt = JSON.parse(Buffer.from(receiptB64, "base64").toString("utf8"));
  const txHash = receipt.transaction || receipt.txHash;
  console.log("Settlement tx:", txHash, "| https://basescan.org/tx/" + txHash);

  // Fetch calldata
  const tx = await pub.getTransaction({ hash: txHash });
  const suffix = decodeSuffix(tx.input);
  if (!suffix) { console.error("❌ No ERC-8021 marker found in calldata. Suffix NOT appended."); process.exit(1); }
  console.log("✅ ERC-8021 suffix found:");
  console.log("   schemaId:", "0x" + suffix.schemaId.toString(16).padStart(2, "0"), "(expect 0x02)");
  console.log("   cborLen:", suffix.cborLen);
  console.log("   cbor:", suffix.cborHex);
  console.log("   decoded builder-code:", JSON.stringify(suffix.decoded));
}
main().catch((e) => { console.error("FAILED:", e?.response?.status, e?.response?.data ?? e?.message ?? e); process.exit(1); });
