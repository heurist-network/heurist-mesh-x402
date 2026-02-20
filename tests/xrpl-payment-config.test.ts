import { describe, expect, test } from "bun:test";
import {
  buildXrplPaymentOption,
  normalizeXrplAsset,
} from "../src/services/xrpl-payment-config";

describe("xrpl payment config", () => {
  test("normalizes rlusd symbol to canonical XRPL currency code", () => {
    const normalized = normalizeXrplAsset("rlusd");

    expect(normalized).toMatch(/^[A-F0-9]{40}$/);
  });

  test("keeps xrp as XRP", () => {
    const normalized = normalizeXrplAsset("xrp");

    expect(normalized).toBe("XRP");
  });

  test("builds IOU option with unchanged USD price string", () => {
    const option = buildXrplPaymentOption({
      asset: "rlusd",
      priceUsd: "0.10",
      issuer: "rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De",
    });

    expect(option.amount).toBe("0.10");
    expect(option.asset).toMatch(/^[A-F0-9]{40}$/);
    expect(option.issuer).toBe("rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De");
  });

  test("throws when IOU issuer is missing", () => {
    expect(() =>
      buildXrplPaymentOption({
        asset: "rlusd",
        priceUsd: "0.10",
      })
    ).toThrow("issuer");
  });
});
