import { FormEvent, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import type { AssetDescriptor, AssetKind, SwapAsset } from "../lib/schema";
import { adapters } from "../lib/swapEngine/adapters";
import { getQuote } from "../lib/swapEngine/engine";
import { TrustCard } from "../components/TrustComponents";
import { CheckCircle2, ShieldCheck, ArrowRightLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const assets: SwapAsset[] = ["USD", "NGN", "BTC", "ETH", "USDT", "Airtime", "Gift Card"];

function baselineRate(from: SwapAsset, to: SwapAsset): number {
  const table: Record<string, Record<string, number>> = {
    USD: { USDT: 1, NGN: 1500 },
    NGN: { USD: 1 / 1500 },
    BTC: { USD: 45000 },
    ETH: { USD: 2500 },
    USDT: { USD: 1, NGN: 1500 },
  };
  return table[from]?.[to] ?? (from === to ? 1 : 0.95);
}

export function SwapPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const setWallet = useAppStore((s) => s.setWallet);
  const pushNotif = useAppStore((s) => s.pushNotif);
  const addTxn = useAppStore((s) => s.addTxn);
  const addSwapIntent = useAppStore((s) => s.addSwapIntent);
  const addEscrow = useAppStore((s) => s.addEscrow);
  const escrows = useAppStore((s) => s.escrows);
  const confirmEscrowDelivery = useAppStore((s) => s.confirmEscrowDelivery);
  const releaseEscrow = useAppStore((s) => s.releaseEscrow);
  const disputeEscrow = useAppStore((s) => s.disputeEscrow);

  const [fromAsset, setFromAsset] = useState<SwapAsset>("USD");
  const [toAsset, setToAsset] = useState<SwapAsset>("USDT");
  const [amount, setAmount] = useState("");
  const [quotedOut, setQuotedOut] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [mode, setMode] = useState<"instant" | "modules">("instant");

  // “Missing Layer” module inputs (MVP forms).
  const [haveKind, setHaveKind] = useState<AssetKind>("AIRTIME");
  const [haveCode, setHaveCode] = useState("MTN_NG");
  const [haveAmount, setHaveAmount] = useState("");
  const [wantKind, setWantKind] = useState<AssetKind>("CRYPTO");
  const [wantCode, setWantCode] = useState("USDT");
  const [notes, setNotes] = useState("");
  const [estimatedValueUsd, setEstimatedValueUsd] = useState("");
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [moduleQuoteOut, setModuleQuoteOut] = useState<number | null>(null);
  const [moduleFeeOut, setModuleFeeOut] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const mockCounterparty = {
    name: "Tunde A.",
    trustScore: 94,
    completedSwaps: 47,
    memberSince: "Jan 2024",
    isIdVerified: true,
    isPhoneVerified: true,
    disputes: 0,
    lastActive: "2 hours ago"
  };

  const onQuote = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter an amount to swap.");
      setQuotedOut(null);
      return;
    }
    const rate = baselineRate(fromAsset, toAsset);
    const out = value * rate;
    const feeValue = value * 0.003;
    setQuotedOut(out - feeValue);
    setFee(feeValue);
  };

  const onExecute = () => {
    if (!quotedOut || !user) return;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setExecuting(true);
    setTimeout(() => {
      const current = wallet[fromAsset as keyof typeof wallet] ?? 0;
      const updated = { ...wallet };
      updated[fromAsset as keyof typeof wallet] = current - numAmount;
      const toCurrent = updated[toAsset as keyof typeof wallet] ?? 0;
      updated[toAsset as keyof typeof wallet] = toCurrent + quotedOut;
      setWallet(updated);

      addTxn({
        type: "swap",
        status: "completed",
        fromAsset,
        toAsset,
        amount: numAmount,
        amountOut: quotedOut,
        fee: fee ?? 0,
        route: `${fromAsset} → ${toAsset}`,
        method: "Internal demo router",
      });

      pushNotif({ 
        type: "success",
        title: "Swap completed",
        message: `Successfully swapped ${numAmount} ${fromAsset} for ${quotedOut} ${toAsset}`
      });

      setReceipt({
        user: user.name,
        fromAmount: numAmount,
        fromAsset,
        toAmount: quotedOut,
        toAsset,
        rate: quotedOut / numAmount,
        time: "14 seconds",
        hash: "0x4f2a" + Math.random().toString(16).slice(2, 10),
      });

      setAmount("");
      setQuotedOut(null);
      setFee(null);
      setExecuting(false);
    }, 1500);
  };

  const kindOptions: { kind: AssetKind; label: string; defaultCode: string }[] = useMemo(
    () => [
      { kind: "AIRTIME", label: "Airtime", defaultCode: "MTN_NG" },
      { kind: "DATA", label: "Data", defaultCode: "GLO_NG_1GB" },
      { kind: "GIFT_CARD", label: "Gift card", defaultCode: "AMAZON_US" },
      { kind: "LOYALTY_POINTS", label: "Loyalty points", defaultCode: "DELTA_SKYMILES" },
      { kind: "PHYSICAL_ITEM", label: "Physical item", defaultCode: "ITEM" },
      { kind: "SERVICE_TIME", label: "Skill / time", defaultCode: "SERVICE" },
      { kind: "DEBT_IOU", label: "Debt / IOU", defaultCode: "IOU" },
      { kind: "SUBSCRIPTION", label: "Subscription", defaultCode: "NETFLIX" },
      { kind: "RWA", label: "Tokenized RWA", defaultCode: "RWA_ERC1155" },
      { kind: "TICKET", label: "Ticket", defaultCode: "TICKET" },
      { kind: "DOMAIN_DIGITAL", label: "Domain / digital asset", defaultCode: "ENS" },
      { kind: "CRYPTO", label: "Crypto", defaultCode: "USDT" },
      { kind: "FIAT", label: "Fiat", defaultCode: "USD" },
    ],
    []
  );

  const wantPresets = useMemo(
    () => ({
      PHYSICAL_ITEM: [
        { label: "Cash (USD)", kind: "FIAT" as AssetKind, code: "USD" },
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Airtime (NG)", kind: "AIRTIME" as AssetKind, code: "MTN_NG" },
        { label: "Another item", kind: "PHYSICAL_ITEM" as AssetKind, code: "ITEM" },
      ],
      AIRTIME: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Cash (NGN)", kind: "FIAT" as AssetKind, code: "NGN" },
        { label: "Other network airtime", kind: "AIRTIME" as AssetKind, code: "AIRTEL_NG" },
        { label: "Electricity units", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      DATA: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Cash (NGN)", kind: "FIAT" as AssetKind, code: "NGN" },
        { label: "Other network data", kind: "DATA" as AssetKind, code: "AIRTEL_DATA" },
      ],
      GIFT_CARD: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Cash (USD)", kind: "FIAT" as AssetKind, code: "USD" },
        { label: "NGN", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      LOYALTY_POINTS: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "NGN (bill pay)", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      SERVICE_TIME: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Airtime", kind: "AIRTIME" as AssetKind, code: "MTN_NG" },
        { label: "Gift card", kind: "GIFT_CARD" as AssetKind, code: "AMAZON_US" },
      ],
      DEBT_IOU: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "NGN", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      SUBSCRIPTION: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Other subscription", kind: "SUBSCRIPTION" as AssetKind, code: "SPOTIFY" },
      ],
      RWA: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "NGN (cash)", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      TICKET: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Cash (USD)", kind: "FIAT" as AssetKind, code: "USD" },
      ],
      DOMAIN_DIGITAL: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "Cash (USD)", kind: "FIAT" as AssetKind, code: "USD" },
      ],
      CRYPTO: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "NGN", kind: "FIAT" as AssetKind, code: "NGN" },
      ],
      FIAT: [
        { label: "USDT", kind: "CRYPTO" as AssetKind, code: "USDT" },
        { label: "BTC", kind: "CRYPTO" as AssetKind, code: "BTC" },
      ],
    }),
    []
  );

  const modulePresets = useMemo(
    () => [
      {
        id: "physical",
        title: "Physical asset swap",
        hint: "Phone, laptop, jewelry → cash, crypto, airtime, other item",
        have: { kind: "PHYSICAL_ITEM" as AssetKind, code: "ITEM" },
      },
      {
        id: "airtime",
        title: "Airtime & data swap",
        hint: "MTN / Glo / Airtel → USDT, NGN, other network",
        have: { kind: "AIRTIME" as AssetKind, code: "MTN_NG" },
      },
      {
        id: "giftcard",
        title: "Gift card to cash/crypto",
        hint: "Amazon, iTunes, Steam → USDT, NGN, USD",
        have: { kind: "GIFT_CARD" as AssetKind, code: "AMAZON_US" },
      },
      {
        id: "loyalty",
        title: "Loyalty points converter",
        hint: "Miles, hotel, bank points → USDT or bills",
        have: { kind: "LOYALTY_POINTS" as AssetKind, code: "DELTA_SKYMILES" },
      },
      {
        id: "service",
        title: "Skill & time swap",
        hint: "Design, dev, tutoring hours → crypto, airtime, gift cards",
        have: { kind: "SERVICE_TIME" as AssetKind, code: "SERVICE" },
      },
      {
        id: "debt",
        title: "Debt & IOU swap",
        hint: "Settle social debts via crypto rails",
        have: { kind: "DEBT_IOU" as AssetKind, code: "IOU" },
      },
      {
        id: "subscription",
        title: "Subscription swap",
        hint: "Netflix slot ⇄ Spotify / USDT",
        have: { kind: "SUBSCRIPTION" as AssetKind, code: "NETFLIX" },
      },
      {
        id: "rwa",
        title: "Tokenized RWA",
        hint: "Fraction of land / car → USDT / NGN",
        have: { kind: "RWA" as AssetKind, code: "RWA_ERC1155" },
      },
      {
        id: "ticket",
        title: "Event & ticket swap",
        hint: "Concert / flight / bus ticket → cash / crypto",
        have: { kind: "TICKET" as AssetKind, code: "TICKET" },
      },
      {
        id: "digital",
        title: "Domain & digital asset",
        hint: "ENS, domains, in-game items → any value",
        have: { kind: "DOMAIN_DIGITAL" as AssetKind, code: "ENS" },
      },
    ],
    []
  );

  const buildDescriptor = (kind: AssetKind, code: string, amt: string): AssetDescriptor => {
    const n = Number(amt);
    const base: AssetDescriptor = { kind, code: code.trim() || "UNKNOWN" };
    if (Number.isFinite(n) && n > 0) base.amount = n;
    if (notes.trim()) base.meta = { ...(base.meta ?? {}), notes: notes.trim() };
    if (estimatedValueUsd.trim()) {
      const v = Number(estimatedValueUsd);
      if (Number.isFinite(v) && v > 0) base.meta = { ...(base.meta ?? {}), estimatedValue: v, estimatedValueUsd: v };
    }
    return base;
  };

  const onModuleQuote = (e: FormEvent) => {
    e.preventDefault();
    setQuoteError(null);
    const have = buildDescriptor(haveKind, haveCode, haveAmount);
    const want = buildDescriptor(wantKind, wantCode, "");
    const q = getQuote(adapters, { have, want, ctx: { country: user.country, kycLevel: "BASIC" } });
    if (!q) {
      setModuleQuoteOut(null);
      setModuleFeeOut(null);
      setQuoteError("No quote available for this pair yet (MVP). Try adding an amount / estimated value.");
      return;
    }
    setModuleQuoteOut(q.expectedOut.amount);
    setModuleFeeOut(q.fee.amount);
  };

  const onModuleExecute = () => {
    setQuoteError(null);
    const have = buildDescriptor(haveKind, haveCode, haveAmount);
    const want = buildDescriptor(wantKind, wantCode, "");
    const q = getQuote(adapters, { have, want, ctx: { country: user.country, kycLevel: "BASIC" } });
    if (!q) {
      setQuoteError("Quote expired or unavailable. Re-quote first.");
      return;
    }

    // Create intent + escrow record (simulated ERC-20 compatible value lock).
    const intent = addSwapIntent({ userId: user.id, have, want, quoteId: q.id, status: "executing" });
    const escrow = addEscrow({
      swapId: intent.id,
      payerUserId: user.id,
      payeeUserId: undefined,
      have,
      want,
      lockedValue: { amount: Math.max(0, q.expectedOut.amount), code: q.expectedOut.code },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status:
        have.kind === "PHYSICAL_ITEM" || have.kind === "TICKET" || have.kind === "DOMAIN_DIGITAL" || have.kind === "SERVICE_TIME"
          ? "awaiting_delivery"
          : "locked",
    });

    addTxn({
      type: "swap",
      status: "pending",
      fromAsset: (have.kind === "CRYPTO" || have.kind === "FIAT") ? (have.code as any) : "Airtime",
      toAsset: (want.kind === "CRYPTO" || want.kind === "FIAT") ? (want.code as any) : "Gift Card",
      amount: Number(have.amount ?? 0) || 0,
      amountOut: q.expectedOut.amount,
      fee: q.fee.amount,
      route: q.route.map((l) => `${l.from.kind}:${l.from.code}→${l.to.kind}:${l.to.code}`).join(" | "),
      method: "AnyPay Swap Engine (MVP adapters)",
      meta: { swapId: intent.id, escrowId: escrow.id, have, want, quoteId: q.id },
    });

    pushNotif({
      type: "info",
      title: "Escrow created (MVP)",
      message: "Your swap is now in escrow. Confirm delivery/transfer to release funds.",
    });

    setHaveAmount("");
    setNotes("");
    setEstimatedValueUsd("");
    setModuleQuoteOut(null);
    setModuleFeeOut(null);
  };

  const isP2P = mode === "instant" && (fromAsset === "Gift Card" || toAsset === "Gift Card");

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Swap</h1>
          <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </header>

        {isP2P && (
          <div className="space-y-3">
            <p className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)] tracking-wider px-1">
              Counterparty Trust Card
            </p>
            <TrustCard user={mockCounterparty} />
          </div>
        )}

        <div className="ap-card p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              className={`ap-btn h-9 text-xs ${mode === "instant" ? "ap-btn-primary" : "ap-btn-ghost"}`}
              onClick={() => setMode("instant")}
            >
              Instant swap
            </button>
            <button
              type="button"
              className={`ap-btn h-9 text-xs ${mode === "modules" ? "ap-btn-primary" : "ap-btn-ghost"}`}
              onClick={() => setMode("modules")}
            >
              Missing Layer modules
            </button>
          </div>
        </div>

        {mode === "instant" && (
          <form onSubmit={onQuote} className="ap-card p-4 space-y-4 text-xs">
          <div>
            <label className="block mb-1 text-[color:var(--ap-text-muted)]">From</label>
            <div className="flex gap-2">
              <input
                className="ap-input flex-1 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <select
                className="ap-input w-[120px] text-sm"
                value={fromAsset}
                onChange={(e) => setFromAsset(e.target.value as SwapAsset)}
              >
                {assets.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[10px] text-[color:var(--ap-text-muted)]">
              Balance:{" "}
              <span className="text-[color:var(--ap-text)]">
                {wallet[fromAsset as keyof typeof wallet]?.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                }) ?? 0}
              </span>
            </p>
          </div>

          <div>
            <label className="block mb-1 text-[color:var(--ap-text-muted)]">To</label>
            <select
              className="ap-input w-full text-sm"
              value={toAsset}
              onChange={(e) => setToAsset(e.target.value as SwapAsset)}
            >
              {assets.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-[color:var(--ap-error)]/40 bg-[color:var(--ap-error)]/10 px-3 py-2 text-[11px] text-[color:var(--ap-error)]">
              {error}
            </div>
          )}

          {quotedOut && (
            <div className="rounded-lg border border-[color:var(--ap-border)] px-3 py-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[color:var(--ap-text-muted)]">You receive</span>
                <span className="tabular-nums text-[color:var(--ap-text)]">
                  {quotedOut.toFixed(4)} {toAsset}
                </span>
              </div>
              {fee !== null && (
                <div className="mt-1 flex justify-between text-[10px] text-[color:var(--ap-text-muted)]">
                  <span>Fee (0.3%)</span>
                  <span>{fee.toFixed(4)} {fromAsset}</span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="ap-btn ap-btn-primary w-full">
            Get Quote
          </button>
          </form>
        )}

        {mode === "instant" && (
          <div className="space-y-4">
            {/* Escrow Confidence Meter */}
            {isP2P && (
              <div className="ap-card p-4 border-dashed border-[color:var(--ap-accent-alt)]/30 bg-[color:var(--ap-accent-alt)]/5 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[color:var(--ap-accent-alt)]">
                  <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> Your funds are protected</span>
                  <span>100% in escrow</span>
                </div>
                <div className="h-1.5 w-full bg-[color:var(--ap-border)]/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-full bg-[color:var(--ap-accent-alt)]"
                  />
                </div>
                <ul className="text-[10px] text-[color:var(--ap-text-muted)] space-y-1">
                  <li>• Released only when you confirm delivery</li>
                  <li>• Auto-released after 7 days if no dispute</li>
                  <li>• Dispute resolution within 48h</li>
                </ul>
              </div>
            )}

            <button
              type="button"
              disabled={!quotedOut || executing}
              className="ap-btn ap-btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest"
              onClick={onExecute}
            >
              {executing ? "Executing…" : "Confirm & Swap"}
            </button>
          </div>
        )}

        {mode === "modules" && (
          <>
            <div className="ap-card p-4 space-y-3 text-xs">
              <p className="text-[color:var(--ap-text-muted)] mb-1">
                Pick what you have from the list below — AnyPay can swap <span className="font-semibold">any of these</span> into cash,
                crypto, airtime, gift cards, or other assets.
              </p>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                {modulePresets.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="text-left rounded-xl border border-[color:var(--ap-border)] px-3 py-2 hover:border-[color:var(--ap-accent)] transition-colors"
                    onClick={() => {
                      setHaveKind(m.have.kind);
                      setHaveCode(m.have.code);
                    }}
                  >
                    <div className="text-[color:var(--ap-text)] font-medium">{m.title}</div>
                    <div className="mt-0.5 text-[10px] text-[color:var(--ap-text-muted)]">{m.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={onModuleQuote} className="ap-card p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">You have (type)</label>
                  <select
                    className="ap-input w-full text-sm"
                    value={haveKind}
                    onChange={(e) => {
                      const k = e.target.value as AssetKind;
                      setHaveKind(k);
                      const def = kindOptions.find((x) => x.kind === k)?.defaultCode ?? "";
                      setHaveCode(def);
                    }}
                  >
                    {kindOptions.map((o) => (
                      <option key={o.kind} value={o.kind}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">Code</label>
                  <input className="ap-input w-full text-sm" value={haveCode} onChange={(e) => setHaveCode(e.target.value)} />
                </div>
              </div>

              {wantPresets[haveKind] && (
                <div>
                  <p className="mb-1 text-[10px] text-[color:var(--ap-text-muted)]">Quick “You want” presets</p>
                  <div className="flex flex-wrap gap-1">
                    {wantPresets[haveKind].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        className="ap-btn ap-btn-ghost h-7 px-2 text-[10px]"
                        onClick={() => {
                          setWantKind(p.kind);
                          setWantCode(p.code);
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">Amount</label>
                  <input
                    className="ap-input w-full text-sm"
                    value={haveAmount}
                    onChange={(e) => setHaveAmount(e.target.value)}
                    placeholder="e.g. 5000, 1.5, 12000 points"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">Estimated value (USD)</label>
                  <input
                    className="ap-input w-full text-sm"
                    value={estimatedValueUsd}
                    onChange={(e) => setEstimatedValueUsd(e.target.value)}
                    placeholder="For physical/ticket/digital"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">You want (type)</label>
                  <select
                    className="ap-input w-full text-sm"
                    value={wantKind}
                    onChange={(e) => {
                      const k = e.target.value as AssetKind;
                      setWantKind(k);
                      const def = kindOptions.find((x) => x.kind === k)?.defaultCode ?? "";
                      setWantCode(def);
                    }}
                  >
                    {kindOptions.map((o) => (
                      <option key={o.kind} value={o.kind}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[color:var(--ap-text-muted)]">Code</label>
                  <input className="ap-input w-full text-sm" value={wantCode} onChange={(e) => setWantCode(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[color:var(--ap-text-muted)]">Notes / condition / details</label>
                <input className="ap-input w-full text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
              </div>

              {quoteError && (
                <div className="rounded-lg border border-[color:var(--ap-error)]/40 bg-[color:var(--ap-error)]/10 px-3 py-2 text-[11px] text-[color:var(--ap-error)]">
                  {quoteError}
                </div>
              )}

              {moduleQuoteOut !== null && (
                <div className="rounded-lg border border-[color:var(--ap-border)] px-3 py-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[color:var(--ap-text-muted)]">Expected out</span>
                    <span className="tabular-nums text-[color:var(--ap-text)]">
                      {moduleQuoteOut.toFixed(4)} {wantCode}
                    </span>
                  </div>
                  {moduleFeeOut !== null && (
                    <div className="mt-1 flex justify-between text-[10px] text-[color:var(--ap-text-muted)]">
                      <span>Fee (MVP)</span>
                      <span>{moduleFeeOut.toFixed(4)} USD</span>
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="ap-btn ap-btn-primary w-full">
                Get Quote
              </button>
            </form>

            <button type="button" className="ap-btn ap-btn-primary w-full" onClick={onModuleExecute}>
              Execute (create escrow)
            </button>

            <div className="ap-card p-4 text-xs">
              <div className="flex items-center justify-between">
                <h2 className="ap-heading text-sm font-medium">Active escrows</h2>
                <span className="text-[10px] text-[color:var(--ap-text-muted)]">{escrows.length} total</span>
              </div>

              <div className="mt-3 space-y-3">
                {escrows.slice(0, 5).map((e) => (
                  <div key={e.id} className="rounded-xl border border-[color:var(--ap-border)] p-3">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] text-[color:var(--ap-text)]">
                          {e.have.kind}:{e.have.code} → {e.want.kind}:{e.want.code}
                        </div>
                        <div className="mt-1 text-[10px] text-[color:var(--ap-text-muted)]">
                          Status: <span className="text-[color:var(--ap-text)]">{e.status}</span> · Expires{" "}
                          {new Date(e.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[color:var(--ap-text)] tabular-nums">
                          {e.lockedValue.amount.toFixed(4)} {e.lockedValue.code}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="ap-btn ap-btn-ghost h-9 text-[11px]"
                        onClick={() => confirmEscrowDelivery(e.id)}
                        disabled={e.status === "disputed" || e.status === "released" || e.status === "resolved"}
                      >
                        Confirm delivery
                      </button>
                      <button
                        type="button"
                        className="ap-btn ap-btn-primary h-9 text-[11px]"
                        onClick={() => releaseEscrow(e.id)}
                        disabled={e.status === "disputed" || e.status === "released" || e.status === "resolved"}
                      >
                        Release
                      </button>
                    </div>
                    <button
                      type="button"
                      className="ap-btn ap-btn-ghost w-full mt-2 h-9 text-[11px]"
                      onClick={() => disputeEscrow(e.id, "Dispute opened in MVP UI")}
                      disabled={e.status === "released" || e.status === "resolved"}
                    >
                      Raise dispute
                    </button>
                  </div>
                ))}

                {escrows.length === 0 && (
                  <div className="text-[11px] text-[color:var(--ap-text-muted)]">
                    No escrows yet. Execute a module swap to create one.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {receipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ap-card w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[color:var(--ap-success)]/10 p-6 text-center border-b border-[color:var(--ap-border)]/5">
                <div className="mx-auto size-12 bg-[color:var(--ap-success)] rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="text-white size-6" />
                </div>
                <h2 className="ap-heading text-lg text-[color:var(--ap-success)] uppercase tracking-widest font-bold">Swap Completed</h2>
                <p className="text-[10px] text-[color:var(--ap-text-muted)] mt-1 font-mono uppercase">Verified on Polygon: {receipt.hash.slice(0, 10)}...</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[color:var(--ap-border)]/5">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)]">From</span>
                  <span className="text-sm font-bold">{receipt.fromAmount.toLocaleString()} {receipt.fromAsset}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[color:var(--ap-border)]/5">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)]">Received</span>
                  <span className="text-sm font-bold text-[color:var(--ap-success)]">{receipt.toAmount.toLocaleString()} {receipt.toAsset}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[color:var(--ap-border)]/5">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)]">Rate</span>
                  <span className="text-sm font-mono">{receipt.rate.toFixed(4)} {receipt.toAsset}/{receipt.fromAsset}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)]">Time</span>
                  <span className="text-sm font-bold">{receipt.time}</span>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setReceipt(null)} className="ap-btn ap-btn-ghost text-xs">Keep Swapping</button>
                  <button className="ap-btn ap-btn-primary text-xs flex items-center justify-center gap-2">
                    <span className="text-[10px] font-bold uppercase">Share Proof</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


