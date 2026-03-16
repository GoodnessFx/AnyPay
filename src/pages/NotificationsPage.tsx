import { Navigate, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export function NotificationsPage() {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const notifs = useAppStore((s) => s.notifs);
  const markAllRead = useAppStore((s) => s.markAllNotifsRead);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="ap-heading text-[28px] font-medium">Notifications</h1>
          <div className="flex gap-2">
            <button className="ap-btn ap-btn-ghost text-xs" onClick={() => markAllRead()}>
              Mark all read
            </button>
            <button className="ap-btn ap-btn-ghost text-xs" onClick={() => navigate("/dashboard")}>
              Back
            </button>
          </div>
        </header>

        <div className="ap-card p-4 text-xs">
          {notifs.length === 0 ? (
            <p className="text-[color:var(--ap-text-muted)]">No notifications yet.</p>
          ) : (
            <ul className="space-y-2">
              {notifs.map((n) => (
                <li
                  key={n.id}
                  className={`rounded-lg border px-3 py-2 ${
                    n.read
                      ? "border-[color:var(--ap-border)]/60 bg-[color:var(--ap-surface)]"
                      : "border-[color:var(--ap-accent)]/40 bg-[color:var(--ap-accent)]/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-[color:var(--ap-text)]">{n.title}</div>
                      <div className="mt-0.5 text-[10px] text-[color:var(--ap-text-muted)] truncate">{n.message}</div>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.16em] text-[color:var(--ap-text-muted)]">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

