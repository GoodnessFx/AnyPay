export function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="ap-card p-8">
          <h1 className="ap-heading text-[56px] leading-none font-semibold">
            The Universal Value Router
          </h1>
          <p className="mt-4 text-sm text-[color:var(--ap-text-muted)] max-w-[64ch]">
            Crypto to cash. Airtime to bank. Gift cards to USDT. Any value, any direction, 28 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="ap-btn ap-btn-primary" href="/auth">
              Get Started — It&apos;s Free
            </a>
            <button className="ap-btn ap-btn-ghost" type="button">
              Watch How It Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

