import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import type { AssetDescriptor, RateAlertRule } from "../lib/schema";
import { baselineRateForPair, getQuote } from "../lib/swapEngine/engine";
import { adapters } from "../lib/swapEngine/adapters";

function buildDescriptor(code: string, amount?: number): AssetDescriptor {
  const upper = code.trim().toUpperCase();
  const isCrypto = ["BTC", "ETH", "USDT", "BNB", "SOL"].includes(upper);
  const isFiat = ["USD", "NGN"].includes(upper);
  return {
    kind: isCrypto ? "CRYPTO" : isFiat ? "FIAT" : "CRYPTO",
    code: upper || "USDT",
    amount,
  };
}

export function RateAlertsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const alerts = useAppStore((s) => s.rateAlerts);
  const addRateAlert = useAppStore((s) => s.addRateAlert);
  const toggleAlert = useAppStore((s) => s.toggleRateAlert);
  const addTxn = useAppStore((s) => s.addTxn);
  const pushNotif = useAppStore((s) => s.pushNotif);

  const [pair, setPair] = useState("BTC/USD");
  const [condition, setCondition] = useState<RateAlertRule["condition"]>("GTE");
  const [threshold, setThreshold] = useState("80000");
  const [haveCode, setHaveCode] = useState("ETH");
  const [havePct, setHavePct] = useState("50");
  const [wantCode, setWantCode] = useState("USDT");
  const [slippage, setSlippage] = useState("1");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const t = Number(threshold);
    const pct = Number(havePct);
    const slip = Number(slippage);
    if (!pair.includes("/") || !Number.isFinite(t) || !Number.isFinite(pct) || pct <= 0 || !Number.isFinite(slip)) {
      setError("Fill in pair, threshold, % of balance, and slippage.");
      return;
    }

    addRateAlert({
      userId: user.id,
      pair: pair.toUpperCase(),
      condition,
      threshold: t,
      action: {
        have: buildDescriptor(haveCode),
        want: buildDescriptor(wantCode),
        maxSlippagePct: slip,
      },
    });
  };

  const runEngineOnce = () => {
    const nowAlerts = alerts.filter((a) => a.enabled);
    if (nowAlerts.length === 0) {
      setError("No active alerts to evaluate yet.");
      return;
    }

    let triggered = 0;
    nowAlerts.forEach((rule) => {
      const rate = baselineRateForPair(rule.pair);
      if (!rate) return;
      const hit =
        (rule.condition === "GTE" && rate >= rule.threshold) ||
        (rule.condition === "LTE" && rate <= rule.threshold);
      if (!hit) return;

      const haveAsset = rule.action.have.code as keyof typeof wallet;
      const balance = wallet[haveAsset] ?? 0;
      const amount = (balance * (rule.action.maxSlippagePct ? Number(havePct) / 100 : 0.5)) || 0;
      if (amount <= 0) return;

      const haveDesc = buildDescriptor(rule.action.have.code, amount);
      const wantDesc = buildDescriptor(rule.action.want.code);
      const quote = getQuote(adapters, { have: haveDesc, want: wantDesc, ctx: { country: user.country, kycLevel: "BASIC" } });
      if (!quote) return;

      addTxn({
        type: "swap",
        status: "completed",
        fromAsset: haveAsset as any,
        toAsset: rule.action.want.code as any,
        amount,
        amountOut: quote.expectedOut.amount,
        fee: quote.fee.amount,
        route: quote.route.map((l) => `${l.from.code}→${l.to.code}`).join(" | "),
        method: "Auto-swap rule (MVP)",
        meta: { ruleId: rule.id, pair: rule.pair, triggerRate: rate },
      });
      triggered += 1;
    });

    if (triggered > 0) {
      pushNotif({
        type: "success",
        title: "Auto-swap executed",
        message: `Evaluated rules and executed ${triggered} auto-swap${triggered > 1 ? "s" : ""} (MVP).`,
      });
    } else {
      pushNotif({
        type: "info",
        title: "No rules triggered",
        message: "No rate alerts met their conditions at current baseline prices (MVP).",
      });
    }
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Trader Layer</h1>
          <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </header>

        <div className="ap-card p-4 text-xs">
          <p className="text-[color:var(--ap-text-muted)]">
            Build rules like <span className="font-semibold">“When BTC/USD hits 80k, convert 50% of my ETH to USDT.”</span> This MVP
            uses static demo prices and executes when you tap Evaluate.
          </p>
        </div>

        <form onSubmit={onSubmit} className="ap-card p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Pair</label>
              <input
                className="ap-input w-full text-sm"
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="BTC/USD, NGN/USD"
              />
            </div>
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Condition</label>
              <select
                className="ap-input w-full text-sm"
                value={condition}
                onChange={(e) => setCondition(e.target.value as RateAlertRule["condition"])}
              >
                <option value="GTE">≥ or equal</option>
                <option value="LTE">≤ or equal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Threshold</label>
              <input
                className="ap-input w-full text-sm"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="80000"
              />
            </div>
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Have asset</label>
              <input
                className="ap-input w-full text-sm"
                value={haveCode}
                onChange={(e) => setHaveCode(e.target.value)}
                placeholder="ETH"
              />
            </div>
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">% of balance</label>
              <input
                className="ap-input w-full text-sm"
                value={havePct}
                onChange={(e) => setHavePct(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Target asset</label>
              <input
                className="ap-input w-full text-sm"
                value={wantCode}
                onChange={(e) => setWantCode(e.target.value)}
                placeholder="USDT, NGN"
              />
            </div>
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Max slippage (%)</label>
              <input
                className="ap-input w-full text-sm"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[color:var(--ap-error)]/40 bg-[color:var(--ap-error)]/10 px-3 py-2 text-[11px] text-[color:var(--ap-error)]">
              {error}
            </div>
          )}

          <button type="submit" className="ap-btn ap-btn-primary w-full">
            Save rate alert
          </button>
        </form>

        <div className="ap-card p-4 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ap-heading text-sm font-medium">Your rate alerts</h2>
            <button type="button" className="ap-btn ap-btn-primary h-8 text-[11px]" onClick={runEngineOnce}>
              Evaluate & auto-swap (MVP)
            </button>
          </div>

          {alerts.length === 0 ? (
            <p className="text-[11px] text-[color:var(--ap-text-muted)]">No alerts yet. Create one above.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-[color:var(--ap-border)] px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-[11px] text-[color:var(--ap-text)]">
                      {a.pair} {a.condition === "GTE" ? "≥" : "≤"} {a.threshold.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[10px] text-[color:var(--ap-text-muted)]">
                      Action: {a.action.have.code} → {a.action.want.code}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`ap-btn h-7 text-[10px] ${
                      a.enabled ? "ap-btn-primary" : "ap-btn-ghost"
                    }`}
                    onClick={() => toggleAlert(a.id, !a.enabled)}
                  >
                    {a.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

