import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

function formatUsd(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);
  const allTxns = useAppStore((s) => s.txns);
  const notifs = useAppStore((s) => s.notifs);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const totalUsd = wallet.USD + wallet.USDT; // simple approximation for MVP
  const txns = allTxns.slice(0, 5);

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="ap-heading text-sm uppercase tracking-[0.24em] text-[color:var(--ap-text-muted)]">
              AnyPay
            </div>
            <div className="mt-1 text-xs text-[color:var(--ap-text-muted)]">
              Logged in as <span className="text-[color:var(--ap-text)]">{user.name}</span>
            </div>
          </div>
          <Link className="ap-btn ap-btn-ghost text-xs" to="/notifications">
            Notifications ({notifs.filter((n) => !n.read).length})
          </Link>
        </header>

        <section className="ap-card p-6">
          <p className="text-xs text-[color:var(--ap-text-muted)] mb-1">Total Portfolio Value</p>
          <p className="ap-heading text-[36px] font-semibold tabular-nums">{formatUsd(totalUsd)}</p>
          <p className="mt-1 text-[11px] text-[color:var(--ap-text-muted)]">▲ 0.00% today (demo)</p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            {(["BTC", "ETH", "USDT", "USD", "NGN"] as const).map((asset) => (
              <span
                key={asset}
                className="rounded-full border border-[color:var(--ap-border)]/80 px-3 py-1 text-[color:var(--ap-text-muted)]"
              >
                {asset}:{" "}
                <span className="text-[color:var(--ap-text)] tabular-nums">
                  {wallet[asset].toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </span>
            ))}
          </div>
        </section>

        <section className="ap-card p-4 flex flex-wrap gap-2 text-xs">
          <button onClick={() => navigate("/add-funds")} className="ap-btn ap-btn-primary">
            Add Funds
          </button>
          <button onClick={() => navigate("/withdraw")} className="ap-btn ap-btn-ghost">
            Withdraw
          </button>
          <button onClick={() => navigate("/swap")} className="ap-btn ap-btn-ghost">
            Swap
          </button>
          <button onClick={() => navigate("/wallet")} className="ap-btn ap-btn-ghost">
            Wallet
          </button>
          <button onClick={() => navigate("/history")} className="ap-btn ap-btn-ghost">
            History
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="ap-card p-4">
            <h2 className="ap-heading text-[18px] font-medium mb-3">Recent Transactions</h2>
            {txns.length === 0 ? (
              <p className="text-xs text-[color:var(--ap-text-muted)]">No activity yet. Try a swap or top-up.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {txns.map((t) => (
                  <li key={t.id} className="flex items-center justify-between">
                    <span className="text-[color:var(--ap-text)]">
                      {t.type.toUpperCase()}{" "}
                      {t.asset && (
                        <span className="text-[color:var(--ap-text-muted)]">
                          ({t.asset}) {t.amount.toLocaleString()}
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px]" +
                        (t.status === "completed"
                          ? " bg-[color:var(--ap-success)]/15 text-[color:var(--ap-success)]"
                          : t.status === "pending"
                          ? " bg-[color:var(--ap-accent-alt)]/15 text-[color:var(--ap-accent-alt)]"
                          : " bg-[color:var(--ap-error)]/15 text-[color:var(--ap-error)]")
                      }
                    >
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ap-card p-4">
            <h2 className="ap-heading text-[18px] font-medium mb-3">Live Rates (demo)</h2>
            <p className="text-xs text-[color:var(--ap-text-muted)]">
              For now these are static demo rates. Next step is wiring CoinGecko.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

