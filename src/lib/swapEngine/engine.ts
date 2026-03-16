import { uuid } from "../ids";
import type { AssetDescriptor, SwapLeg, SwapQuote } from "../schema";

function nowIso() {
  return new Date().toISOString();
}

function addSecondsIso(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalizeAmount(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return v;
}

type QuoteContext = {
  country?: string;
  kycLevel?: "NONE" | "BASIC" | "FULL";
};

export type AdapterQuote = {
  route: SwapLeg[];
  expectedOut: { amount: number; code: string };
  fee: { amount: number; code: string };
  etaSeconds: number;
  notes?: string[];
};

export type AssetAdapter = {
  id: string;
  canQuote: (have: AssetDescriptor, want: AssetDescriptor) => boolean;
  quote: (input: { have: AssetDescriptor; want: AssetDescriptor; ctx?: QuoteContext }) => AdapterQuote | null;
};

// Baseline rates are MVP placeholders. They let the UI behave predictably while
// adapters are swapped to live providers later.
const baseline: Record<string, Record<string, number>> = {
  USD: { USDT: 1, NGN: 1500 },
  USDT: { USD: 1, NGN: 1500 },
  NGN: { USD: 1 / 1500, USDT: 1 / 1500 },
  BTC: { USD: 45000, USDT: 45000 },
  ETH: { USD: 2500, USDT: 2500 },
};

function rate(fromCode: string, toCode: string): number {
  if (fromCode === toCode) return 1;
  return baseline[fromCode]?.[toCode] ?? 0;
}

export function baselineRateForPair(pair: string): number | null {
  const [base, quote] = pair.split("/");
  if (!base || !quote) return null;
  const r = rate(base.toUpperCase(), quote.toUpperCase());
  return r || null;
}

function isRailLike(a: AssetDescriptor): boolean {
  return (
    a.kind === "CRYPTO" ||
    a.kind === "FIAT" ||
    a.kind === "AIRTIME" ||
    a.kind === "DATA" ||
    a.kind === "GIFT_CARD" ||
    a.kind === "LOYALTY_POINTS"
  );
}

export function getQuote(
  adapters: AssetAdapter[],
  input: { have: AssetDescriptor; want: AssetDescriptor; ctx?: QuoteContext }
): SwapQuote | null {
  const haveAmount = normalizeAmount(input.have.amount);
  const wantAmount = normalizeAmount(input.want.amount);

  const have: AssetDescriptor = { ...input.have, amount: haveAmount || input.have.amount };
  const want: AssetDescriptor = { ...input.want, amount: wantAmount || input.want.amount };

  // Try adapters first (module-specific quoting).
  for (const ad of adapters) {
    if (!ad.canQuote(have, want)) continue;
    const q = ad.quote({ have, want, ctx: input.ctx });
    if (!q) continue;
    return {
      id: `quote_${uuid()}`,
      createdAt: nowIso(),
      expiresAt: addSecondsIso(120),
      have,
      want,
      route: q.route,
      fee: q.fee,
      expectedOut: q.expectedOut,
      notes: q.notes,
    };
  }

  // Fallback: rail-to-rail direct baseline quote.
  if (isRailLike(have) && isRailLike(want) && haveAmount > 0) {
    const r = rate(have.code, want.code);
    const gross = haveAmount * (r || 1);
    const feeAmt = Math.max(0.25, haveAmount * 0.003);
    const out = Math.max(0, gross - feeAmt);
    return {
      id: `quote_${uuid()}`,
      createdAt: nowIso(),
      expiresAt: addSecondsIso(120),
      have,
      want: { ...want, amount: out },
      route: [
        {
          from: have,
          to: { ...want, amount: out },
          provider: "AnyPay Baseline Router",
          etaSeconds: 30,
        },
      ],
      fee: { amount: feeAmt, code: have.code },
      expectedOut: { amount: out, code: want.code },
      notes: ["MVP baseline routing (static rates)."],
    };
  }

  return null;
}

