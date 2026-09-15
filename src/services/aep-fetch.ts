import { lookup } from "node:dns/promises";
import { Agent } from "node:https";
import axios from "axios";
import ipaddr from "ipaddr.js";

// Agent DIDs are untrusted URLs. Pin DNS to a public address, disable proxies
// and redirects, and bound response size/time to prevent internal-network access.
export async function fetchPublicDid(input: string | URL) {
  const url = new URL(input);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("DID documents must use public HTTPS on port 443");
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => ipaddr.process(address).range() !== "unicast")) {
    throw new Error("DID host must resolve only to public addresses");
  }
  const pinned = addresses[0];
  const agent = new Agent({ lookup: ((_host: string, options: any, callback: any) => {
    if (options?.all) callback(null, [pinned]);
    else callback(null, pinned.address, pinned.family);
  }) as any });
  try {
    const response = await axios.get(url.toString(), {
      httpsAgent: agent, proxy: false, maxRedirects: 0,
      timeout: 5000, maxContentLength: 262144, responseType: "json",
      validateStatus: () => true,
    });
    return new Response(JSON.stringify(response.data), { status: response.status, headers: { "Content-Type": "application/json" } });
  } finally { agent.destroy(); }
}
