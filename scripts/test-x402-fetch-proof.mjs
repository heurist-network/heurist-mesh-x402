import { wrapFetchWithPaymentFromConfig } from '@x402/fetch';
import { ExactSvmScheme } from '@x402/svm';
import { createKeyPairSignerFromBytes } from '@solana/kit';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

//init wallet
const privateKey = process.env.ZA_402_WALLET_PRIVATE_KEY;
const signer = await createKeyPairSignerFromBytes(bs58.decode(privateKey));
const svmScheme = new ExactSvmScheme(signer);
console.log('Wallet:', signer.address);

//wrapped fetch
const wrappedFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{
    scheme: 'exact',
    network: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    client: svmScheme
  }]
});

try {
  const res = await wrappedFetch(
    'https://mesh.heurist.xyz/x402/solana/agents/AIXBTProjectInfoAgent/get_market_summary',
    { method: 'POST', headers: { 'Accept': 'application/json' } }
  );
  console.log('Status:', res.status);
  console.log('Response:', (await res.text()).slice(0, 200));
} catch (err) {
  console.log('❌ ERROR:', err.message);
}
