import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import type { SwapAsset } from "../lib/schema";

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

  const [fromAsset, setFromAsset] = useState<SwapAsset>("USD");
  const [toAsset, setToAsset] = useState<SwapAsset>("USDT");
  const [amount, setAmount] = useState("");
  const [quotedOut, setQuotedOut] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
    if (!quotedOut) return;
    const value = parseFloat(amount);
    if (!value || value <= 0) return;

    const current = wallet[fromAsset as keyof typeof wallet] ?? 0;
    if (current < value) {
      setError("Insufficient balance for this swap.");
      return;
    }

    setExecuting(true);
    try {
      const updated = { ...wallet };
      updated[fromAsset as keyof typeof wallet] = current - value;
      const toCurrent = updated[toAsset as keyof typeof wallet] ?? 0;
      updated[toAsset as keyof typeof wallet] = toCurrent + quotedOut;
      setWallet(updated);

      addTxn({
        type: "swap",
        status: "completed",
        fromAsset,
        toAsset,
        amount: value,
        amountOut: quotedOut,
        fee: fee ?? 0,
        route: `${fromAsset} → ${toAsset}`,
        method: "Internal demo router",
      });

      pushNotif({
        type: "success",
        title: "Swap completed",
        message: `Swapped ${value} ${fromAsset} → ${quotedOut.toFixed(4)} ${toAsset}`,
      });

      setAmount("");
      setQuotedOut(null);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Swap</h1>
          <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </header>

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

        <button
          type="button"
          disabled={!quotedOut || executing}
          className="ap-btn ap-btn-primary w-full"
          onClick={onExecute}
        >
          {executing ? "Executing…" : "Execute Swap"}
        </button>
      </div>
    </div>
  );
}


