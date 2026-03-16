import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { uuid } from "../lib/ids";

type Mode = "signin" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const credit = useAppStore((s) => s.credit);
  const pushNotif = useAppStore((s) => s.pushNotif);

  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || (mode === "signup" && (!fullName || !country))) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const user = {
        id: uuid(),
        name: fullName || email.split("@")[0],
        email,
        country: country || "XX",
        createdAt: new Date().toISOString(),
      };
      setUser(user);

      // Seed demo balance on first auth so swaps/add-funds/withdraw flows are testable.
      credit("USD", 1000, { type: "topup", method: "Demo seed", status: "completed" });

      pushNotif({
        type: "success",
        title: mode === "signup" ? "Welcome to AnyPay" : "Signed in",
        message: "You are now signed in to your demo AnyPay account.",
      });

      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const connectMockWallet = () => {
    const addr = `0x${Math.random().toString(16).slice(2, 10)}${Math.random()
      .toString(16)
      .slice(2, 10)}`.padEnd(42, "0");

    const user = {
      id: uuid(),
      name: "Wallet User",
      country: "XX",
      createdAt: new Date().toISOString(),
      walletAddress: addr,
    };
    setUser(user);
    credit("USDT", 250, { type: "topup", method: "Mock wallet airdrop", status: "completed" });
    pushNotif({
      type: "info",
      title: "Wallet connected (mock)",
      message: `Connected wallet ${addr.slice(0, 6)}...${addr.slice(-4)} for this session.`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="ap-card p-8">
          <h1 className="ap-heading text-[28px] font-medium">Sign {mode === "signup" ? "Up" : "In"}</h1>
          <p className="mt-2 text-sm text-[color:var(--ap-text-muted)]">
            This is a local-only MVP. No real accounts are created.
          </p>

          <div className="mt-6 inline-flex rounded-xl border border-[color:var(--ap-border)] bg-[color:var(--ap-surface)] p-1">
            <button
              type="button"
              className={`ap-btn text-sm h-9 px-4 ${
                mode === "signup" ? "ap-btn-primary" : "ap-btn-ghost"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={`ap-btn text-sm h-9 px-4 ${
                mode === "signin" ? "ap-btn-primary" : "ap-btn-ghost"
              }`}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--ap-text-muted)] mb-1.5">
                    Full Name
                  </label>
                  <input
                    className="ap-input w-full text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--ap-text-muted)] mb-1.5">
                    Country
                  </label>
                  <input
                    className="ap-input w-full text-sm"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="KE, NG, US…"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-[color:var(--ap-text-muted)] mb-1.5">
                Email
              </label>
              <input
                className="ap-input w-full text-sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[color:var(--ap-text-muted)] mb-1.5">
                Password
              </label>
              <input
                className="ap-input w-full text-sm"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="mt-2 rounded-lg border border-[color:var(--ap-error)]/40 bg-[color:var(--ap-error)]/10 px-3 py-2 text-xs text-[color:var(--ap-error)]">
                {error}
              </div>
            )}

            <button disabled={loading} type="submit" className="ap-btn ap-btn-primary w-full mt-2">
              {loading ? "Working…" : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 border-t border-[color:var(--ap-border)] pt-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ap-text-muted)] mb-3">
              Or connect with wallet
            </p>
            <button type="button" className="ap-btn ap-btn-ghost w-full" onClick={connectMockWallet}>
              Connect Wallet (Mock)
            </button>
            <p className="mt-2 text-[10px] leading-relaxed text-[color:var(--ap-text-muted)]">
              For this MVP we simulate wallet connection and seed demo balances. Later you&apos;ll plug in
              real MetaMask / contract integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

