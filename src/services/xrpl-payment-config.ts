import { resolveCurrencyCode } from "x402-xrpl";

export type XrplPaymentOptionInput = {
  asset: string;
  priceUsd: string;
  issuer?: string;
};

export type XrplPaymentOption = {
  asset: string;
  amount: string;
  issuer?: string;
};

export function normalizeXrplAsset(asset: string): string {
  const rawAsset = asset.trim();
  if (!rawAsset) {
    throw new Error("XRPL asset is required");
  }

  if (rawAsset.toUpperCase() === "XRP") {
    return "XRP";
  }

  // RLUSD and other non-3-char symbols are normalized to canonical XRPL code.
  return resolveCurrencyCode(rawAsset.toUpperCase(), {
    allowUtf8Symbol: true,
  });
}

export function buildXrplPaymentOption(
  input: XrplPaymentOptionInput
): XrplPaymentOption {
  const asset = normalizeXrplAsset(input.asset);

  if (!input.priceUsd || Number.isNaN(Number(input.priceUsd))) {
    throw new Error(`Invalid XRPL price value: ${input.priceUsd}`);
  }

  if (asset !== "XRP" && !input.issuer?.trim()) {
    throw new Error("XRPL issuer is required for non-XRP assets");
  }

  return {
    asset,
    amount: input.priceUsd,
    ...(asset !== "XRP" && { issuer: input.issuer!.trim() }),
  };
}
