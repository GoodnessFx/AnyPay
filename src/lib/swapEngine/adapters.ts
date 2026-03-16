import type { AssetAdapter } from "./engine";
import type { AssetDescriptor, SwapLeg } from "../schema";

function leg(from: AssetDescriptor, to: AssetDescriptor, provider: string, etaSeconds: number): SwapLeg {
  return { from, to, provider, etaSeconds };
}

function mvpFee(amount: number, min = 0.25, pct = 0.01) {
  return Math.max(min, amount * pct);
}

// NOTE: These adapters are intentionally MVP-simple. They establish the *shape*
// of the “asset adapter” moat so each module fits into a unified routing engine.
export const adapters: AssetAdapter[] = [
  // 1) Physical Asset Swaps: escrow is value-locked; delivery is off-chain confirmation.
  {
    id: "PhysicalItemAdapter",
    canQuote: (have, want) => have.kind === "PHYSICAL_ITEM" || want.kind === "PHYSICAL_ITEM",
    quote: ({ have, want }) => {
      const estimatedValue = Number(have.meta?.estimatedValue ?? have.amount ?? 0);
      if (!Number.isFinite(estimatedValue) || estimatedValue <= 0) return null;
      const feeAmt = mvpFee(estimatedValue, 2.5, 0.02);
      const out = Math.max(0, estimatedValue - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg({ ...have, amount: estimatedValue }, to, "Physical Escrow (MVP)", 86400)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 86400,
        notes: ["Delivery-confirmed escrow with 7-day timeout (simulated in MVP)."],
      };
    },
  },

  // 2) Airtime & Data Swaps
  {
    id: "AirtimeDataAdapter",
    canQuote: (have, want) =>
      have.kind === "AIRTIME" || have.kind === "DATA" || want.kind === "AIRTIME" || want.kind === "DATA",
    quote: ({ have, want }) => {
      const amt = Number(have.amount ?? 0);
      if (!Number.isFinite(amt) || amt <= 0) return null;
      // MVP assumption: 1 unit airtime/data ~= 0.0006 USD (placeholder)
      const usdValue = (have.kind === "AIRTIME" || have.kind === "DATA") ? amt * 0.0006 : amt;
      const feeAmt = mvpFee(usdValue, 0.25, 0.015);
      const outUsd = Math.max(0, usdValue - feeAmt);
      const to = { ...want, amount: want.amount ?? outUsd };
      return {
        route: [
          leg(have, { kind: "FIAT", code: "USD", amount: usdValue }, "Telco Sink (MVP)", 120),
          leg({ kind: "FIAT", code: "USD", amount: outUsd }, to, "AnyPay Router (MVP)", 180),
        ],
        expectedOut: { amount: to.amount ?? outUsd, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 300,
        notes: ["Rates are placeholders; swap-in/out is modeled as a two-leg route."],
      };
    },
  },

  // 3) Gift card exchange engine
  {
    id: "GiftCardAdapter",
    canQuote: (have, want) => have.kind === "GIFT_CARD" || want.kind === "GIFT_CARD",
    quote: ({ have, want }) => {
      const face = Number(have.meta?.faceValue ?? have.amount ?? 0);
      if (!Number.isFinite(face) || face <= 0) return null;
      // MVP “secondary market” haircut by brand.
      const brand = String(have.code || "").toUpperCase();
      const haircut =
        brand.includes("AMAZON") ? 0.18 :
        brand.includes("ITUNES") ? 0.22 :
        brand.includes("STEAM") ? 0.15 :
        brand.includes("GOOGLE") ? 0.20 :
        0.25;
      const usdValue = face * (1 - haircut);
      const feeAmt = mvpFee(usdValue, 0.5, 0.02);
      const out = Math.max(0, usdValue - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg({ ...have, amount: face }, to, "Gift Card OTC (MVP)", 900)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 900,
        notes: ["Quote is based on an MVP brand haircut table (replace with live secondary rates)."],
      };
    },
  },

  // 4) Loyalty points converter
  {
    id: "LoyaltyPointsAdapter",
    canQuote: (have, want) => have.kind === "LOYALTY_POINTS" || want.kind === "LOYALTY_POINTS",
    quote: ({ have, want }) => {
      const pts = Number(have.amount ?? 0);
      if (!Number.isFinite(pts) || pts <= 0) return null;
      // MVP: 1000 points ~ $10 (varies heavily IRL).
      const usdValue = (pts / 1000) * 10;
      const feeAmt = mvpFee(usdValue, 0.5, 0.02);
      const out = Math.max(0, usdValue - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg(have, to, "Loyalty Bridge (MVP)", 1800)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 1800,
        notes: ["MVP conversion rate; real integrations would verify balances and redemption."],
      };
    },
  },

  // 5) Skill & Time swaps (service escrow)
  {
    id: "ServiceTimeAdapter",
    canQuote: (have, want) => have.kind === "SERVICE_TIME" || want.kind === "SERVICE_TIME",
    quote: ({ have, want }) => {
      const price = Number(have.meta?.priceUsd ?? have.amount ?? 0);
      if (!Number.isFinite(price) || price <= 0) return null;
      const feeAmt = mvpFee(price, 1, 0.03);
      const out = Math.max(0, price - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg({ ...have, amount: price }, to, "Service Escrow (MVP)", 86400)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 86400,
        notes: ["Escrow release is tied to work delivery confirmation (simulated)."],
      };
    },
  },

  // 6) Debt & IOU swaps
  {
    id: "DebtIouAdapter",
    canQuote: (have, want) => have.kind === "DEBT_IOU" || want.kind === "DEBT_IOU",
    quote: ({ have, want }) => {
      const face = Number(have.meta?.faceValue ?? have.amount ?? 0);
      if (!Number.isFinite(face) || face <= 0) return null;
      const feeAmt = mvpFee(face, 0.5, 0.01);
      const out = Math.max(0, face - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg({ ...have, amount: face }, to, "Debt Settlement Router (MVP)", 120)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 120,
        notes: ["Routes a payer asset into creditor’s preferred settlement asset (simulated)."],
      };
    },
  },

  // 7) Subscription swaps
  {
    id: "SubscriptionAdapter",
    canQuote: (have, want) => have.kind === "SUBSCRIPTION" || want.kind === "SUBSCRIPTION",
    quote: ({ have, want }) => {
      const deposit = Number(have.meta?.depositUsd ?? 5);
      const feeAmt = mvpFee(deposit, 0.25, 0.05);
      const out = Math.max(0, deposit - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg(have, to, "Subscription Swap Guarantee (MVP)", 7200)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 7200,
        notes: ["Micro-deposit guarantee model (credentials/slot transfer is off-chain)."],
      };
    },
  },

  // 8) RWA swaps (tokenization placeholder)
  {
    id: "RwaAdapter",
    canQuote: (have, want) => have.kind === "RWA" || want.kind === "RWA",
    quote: ({ have, want }) => {
      const val = Number(have.meta?.assetValueUsd ?? have.amount ?? 0);
      const fractionPct = Number(have.meta?.fractionPct ?? 0);
      const fraction = (Number.isFinite(fractionPct) && fractionPct > 0) ? fractionPct / 100 : 0.2;
      const usdValue = val > 0 ? val * fraction : 0;
      if (!Number.isFinite(usdValue) || usdValue <= 0) return null;
      const feeAmt = mvpFee(usdValue, 5, 0.025);
      const out = Math.max(0, usdValue - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg(have, to, "RWA Tokenization + Sale (MVP)", 86400 * 3)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 86400 * 3,
        notes: ["ERC-1155 issuance + settlement is modeled; replace with on-chain deployment later."],
      };
    },
  },

  // 9) Ticket swaps
  {
    id: "TicketAdapter",
    canQuote: (have, want) => have.kind === "TICKET" || want.kind === "TICKET",
    quote: ({ have, want }) => {
      const val = Number(have.meta?.estimatedValueUsd ?? have.amount ?? 0);
      if (!Number.isFinite(val) || val <= 0) return null;
      const feeAmt = mvpFee(val, 1, 0.03);
      const out = Math.max(0, val - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg(have, to, "Ticket Vault + Release (MVP)", 3600)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 3600,
        notes: ["Ticket verification and QR transfer confirmation are simulated in MVP."],
      };
    },
  },

  // 10) Domain & digital asset swaps
  {
    id: "DomainDigitalAdapter",
    canQuote: (have, want) => have.kind === "DOMAIN_DIGITAL" || want.kind === "DOMAIN_DIGITAL",
    quote: ({ have, want }) => {
      const val = Number(have.meta?.estimatedValueUsd ?? have.amount ?? 0);
      if (!Number.isFinite(val) || val <= 0) return null;
      const feeAmt = mvpFee(val, 1, 0.03);
      const out = Math.max(0, val - feeAmt);
      const to = { ...want, amount: want.amount ?? out };
      return {
        route: [leg(have, to, "Digital Transfer Escrow (MVP)", 7200)],
        expectedOut: { amount: to.amount ?? out, code: to.code },
        fee: { amount: feeAmt, code: "USD" },
        etaSeconds: 7200,
        notes: ["Transfer confirmation is modeled; on-chain ENS can be added as an adapter upgrade."],
      };
    },
  },
];

