import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export function WalletPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const wallet = useAppStore((s) => s.wallet);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Wallet</h1>
          <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        <div className="ap-card p-4 text-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[color:var(--ap-text-muted)] text-[11px]">
                <th className="pb-2 text-left font-normal">Asset</th>
                <th className="pb-2 text-right font-normal">Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(wallet).map(([asset, value]) => (
                <tr key={asset}>
                  <td className="py-1.5 text-[color:var(--ap-text)]">{asset}</td>
                  <td className="py-1.5 text-right tabular-nums text-[color:var(--ap-text)]">
                    {value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


