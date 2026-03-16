import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import type { AssetDescriptor } from "../lib/schema";

function buildDescriptor(code: string, amount: number): AssetDescriptor {
  const upper = code.trim().toUpperCase();
  const isCrypto = ["BTC", "ETH", "USDT", "BNB", "SOL"].includes(upper);
  const isFiat = ["USD", "NGN"].includes(upper);
  const isAirtime = upper.includes("AIRTIME") || upper.endsWith("_NG");
  const isGift = upper.includes("GIFT") || upper.includes("AMAZON");

  return {
    kind: isCrypto ? "CRYPTO" : isFiat ? "FIAT" : isAirtime ? "AIRTIME" : isGift ? "GIFT_CARD" : "CRYPTO",
    code: upper || "USDT",
    amount,
  };
}

export function GroupPoolsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const pools = useAppStore((s) => s.groupPools);
  const addGroupPool = useAppStore((s) => s.addGroupPool);

  const [title, setTitle] = useState("Travel fund");
  const [memberNames, setMemberNames] = useState("You, Friend A, Friend B");
  const [assetCodes, setAssetCodes] = useState("USDT, Airtime_NG, GiftCard_AMAZON, Phone");
  const [assetAmounts, setAssetAmounts] = useState("100, 5000, 50, 1");
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const names = memberNames.split(",").map((n) => n.trim()).filter(Boolean);
    const codes = assetCodes.split(",").map((c) => c.trim()).filter(Boolean);
    const amounts = assetAmounts.split(",").map((a) => Number(a.trim()));

    if (!names.length || !codes.length || codes.length !== amounts.length) {
      setError("Enter matching lists of members, asset codes, and amounts.");
      return;
    }

    const members = names.map((n, idx) => ({
      userId: idx === 0 ? user.id : `${user.id}_m${idx}`,
      name: n,
    }));

    const contributions = codes.map((code, idx) => buildDescriptor(code, amounts[idx] || 0)).map((asset, idx) => ({
      userId: members[idx % members.length].userId,
      asset,
    }));

    addGroupPool({
      ownerUserId: user.id,
      title: title || "Group pool",
      members,
      contributions,
      target: { kind: "CRYPTO", code: "USDT", amount: 0 },
      splitRule: "pro_rata",
    });
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Group Swap Pools</h1>
          <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </header>

        <div className="ap-card p-4 text-xs">
          <p className="text-[color:var(--ap-text-muted)]">
            Model Ajo / Esusu style pools where friends contribute different assets (USDT, airtime, gift cards, even a phone) and
            settle pro-rata on shared goals.
          </p>
        </div>

        <form onSubmit={onSubmit} className="ap-card p-4 space-y-3 text-xs">
          <div>
            <label className="block mb-1 text-[color:var(--ap-text-muted)]">Pool name</label>
            <input
              className="ap-input w-full text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Travel fund, community pot…"
            />
          </div>

          <div>
            <label className="block mb-1 text-[color:var(--ap-text-muted)]">Members (comma separated)</label>
            <input
              className="ap-input w-full text-sm"
              value={memberNames}
              onChange={(e) => setMemberNames(e.target.value)}
              placeholder="You, Friend A, Friend B"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Asset codes</label>
              <input
                className="ap-input w-full text-sm"
                value={assetCodes}
                onChange={(e) => setAssetCodes(e.target.value)}
                placeholder="USDT, Airtime_NG, GiftCard_AMAZON, Phone"
              />
            </div>
            <div>
              <label className="block mb-1 text-[color:var(--ap-text-muted)]">Amounts</label>
              <input
                className="ap-input w-full text-sm"
                value={assetAmounts}
                onChange={(e) => setAssetAmounts(e.target.value)}
                placeholder="100, 5000, 50, 1"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[color:var(--ap-error)]/40 bg-[color:var(--ap-error)]/10 px-3 py-2 text-[11px] text-[color:var(--ap-error)]">
              {error}
            </div>
          )}

          <button type="submit" className="ap-btn ap-btn-primary w-full">
            Create pool
          </button>
        </form>

        <div className="ap-card p-4 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="ap-heading text-sm font-medium">Your pools</h2>
            <span className="text-[10px] text-[color:var(--ap-text-muted)]">{pools.length} total</span>
          </div>

          {pools.length === 0 ? (
            <p className="text-[11px] text-[color:var(--ap-text-muted)]">No pools yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {pools.map((p) => {
                const totalMembers = p.members.length;
                const totalContributions = p.contributions.length;
                return (
                  <div key={p.id} className="rounded-xl border border-[color:var(--ap-border)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] text-[color:var(--ap-text)]">{p.title}</div>
                        <div className="mt-1 text-[10px] text-[color:var(--ap-text-muted)]">
                          {totalMembers} members · {totalContributions} contributions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[color:var(--ap-text-muted)]">Status</div>
                        <div className="text-[11px] text-[color:var(--ap-text)]">{p.status}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

