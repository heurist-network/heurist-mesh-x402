import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
const TX = process.argv[2] as `0x${string}`;
const MARKER = "80218021802180218021802180218021";
const pub = createPublicClient({ chain: base, transport: http() });
function decodeCbor(buf: Buffer): any { let i=0; function rd():any{const b=buf[i++],M=b>>5,m=b&0x1f,len=m<=23?m:buf[i++]; if(M===3){const s=buf.subarray(i,i+len).toString();i+=len;return s;} if(M===4){const a=[];for(let k=0;k<len;k++)a.push(rd());return a;} if(M===5){const o:any={};for(let k=0;k<len;k++){const key=rd();o[key]=rd();}return o;} throw new Error("major"+M);} return rd(); }
(async () => {
  for (let i=0;i<15;i++){
    try {
      const tx = await pub.getTransaction({ hash: TX });
      const hex = tx.input.replace(/^0x/,"");
      if(!hex.toLowerCase().endsWith(MARKER)){ console.log("NO MARKER in calldata"); return; }
      const buf=Buffer.from(hex,"hex");
      const schemaId=buf[buf.length-17];
      const cborLen=buf.readUInt16BE(buf.length-19);
      const cbor=buf.subarray(buf.length-19-cborLen, buf.length-19);
      console.log("schemaId: 0x"+schemaId.toString(16).padStart(2,"0"));
      console.log("cborLen:", cborLen, "| cborHex:", cbor.toString("hex"));
      console.log("decoded:", JSON.stringify(decodeCbor(cbor)));
      return;
    } catch { await new Promise(r=>setTimeout(r,3000)); }
  }
  console.log("tx not found after retries");
})();
