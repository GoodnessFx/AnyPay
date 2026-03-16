type Wallet = { balances: Record<string, number> };

type Transaction = {
  id: string;
  userId: string;
  type: "sent" | "received";
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  provider: string;
  fee: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
};

const LS_USERS = "anypay_mock_users";
const LS_SESSION = "anypay_mock_session";
const LS_WALLETS = "anypay_mock_wallets";
const LS_TXS = "anypay_mock_transactions";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export type MockUser = { id: string; email: string; password: string; name?: string };

export function mockSignUp(email: string, password: string, name: string) {
  const users = readJson<MockUser[]>(LS_USERS, []);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already exists");
  }
  const user: MockUser = {
    id: `user_${crypto.randomUUID()}`,
    email,
    password,
    name,
  };
  users.push(user);
  writeJson(LS_USERS, users);

  const wallets = readJson<Record<string, Wallet>>(LS_WALLETS, {});
  wallets[user.id] = { balances: { USD: 0, BTC: 0, ETH: 0, USDT: 0, NGN: 0 } };
  writeJson(LS_WALLETS, wallets);

  writeJson(LS_SESSION, { userId: user.id });
  return { id: user.id, email: user.email, name: user.name };
}

export function mockSignIn(email: string, password: string) {
  const users = readJson<MockUser[]>(LS_USERS, []);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) throw new Error("Invalid credentials");
  writeJson(LS_SESSION, { userId: user.id });
  return { id: user.id, email: user.email, name: user.name };
}

export function mockSignOut() {
  localStorage.removeItem(LS_SESSION);
}

export function mockGetSessionUser() {
  const session = readJson<{ userId: string } | null>(LS_SESSION, null);
  if (!session?.userId) return null;
  const users = readJson<MockUser[]>(LS_USERS, []);
  const user = users.find((u) => u.id === session.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}

export function mockGetWallet(userId: string): Wallet {
  const wallets = readJson<Record<string, Wallet>>(LS_WALLETS, {});
  return wallets[userId] ?? { balances: { USD: 0, BTC: 0, ETH: 0, USDT: 0, NGN: 0 } };
}

export function mockTopUpWallet(userId: string, currency: string, amount: number): Wallet {
  const wallets = readJson<Record<string, Wallet>>(LS_WALLETS, {});
  const wallet = wallets[userId] ?? { balances: {} };
  wallet.balances[currency] = (wallet.balances[currency] || 0) + amount;
  wallets[userId] = wallet;
  writeJson(LS_WALLETS, wallets);
  return wallet;
}

export function mockWithdrawWallet(userId: string, currency: string, amount: number): Wallet {
  const wallets = readJson<Record<string, Wallet>>(LS_WALLETS, {});
  const wallet = wallets[userId] ?? { balances: {} };
  const current = wallet.balances[currency] || 0;
  if (current < amount) throw new Error("Insufficient balance");
  wallet.balances[currency] = current - amount;
  wallets[userId] = wallet;
  writeJson(LS_WALLETS, wallets);
  return wallet;
}

const baselineRates: Record<string, Record<string, number>> = {
  USD: { NGN: 45000, KES: 130, GHS: 12, USD: 1 },
  BTC: { USD: 45000, ETH: 26.5, BTC: 1 },
  ETH: { USD: 1800, USDT: 1800, ETH: 1 },
  USDT: { USD: 1, NGN: 45000, USDT: 1 },
  NGN: { USD: 1 / 45000, NGN: 1 },
};

export function mockRoute(fromCurrency: string, toCurrency: string, amount: number) {
  const rate = baselineRates[fromCurrency]?.[toCurrency] ?? 1;
  const fee = Math.max(0.25, amount * 0.001);
  const toAmount = amount * rate;
  return {
    fromCurrency,
    toCurrency,
    fromAmount: amount,
    toAmount,
    rate,
    fee,
    provider: "Mock Router",
    time: "< 30 seconds",
    confidence: 0.9,
  };
}

export function mockCreateTransaction(input: Omit<Transaction, "id" | "timestamp" | "status" | "type" | "userId"> & { userId: string }) {
  const txs = readJson<Record<string, Transaction[]>>(LS_TXS, {});
  const tx: Transaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId: input.userId,
    type: "sent",
    fromCurrency: input.fromCurrency,
    toCurrency: input.toCurrency,
    fromAmount: input.fromAmount,
    toAmount: input.toAmount,
    provider: input.provider,
    fee: input.fee,
    status: "completed",
    timestamp: new Date().toISOString(),
  };
  txs[input.userId] = [tx, ...(txs[input.userId] ?? [])].slice(0, 100);
  writeJson(LS_TXS, txs);

  // Ledger update
  const wallet = mockGetWallet(input.userId);
  if ((wallet.balances[input.fromCurrency] || 0) < input.fromAmount) {
    // still store tx but mark failed
    tx.status = "failed";
  } else {
    wallet.balances[input.fromCurrency] = (wallet.balances[input.fromCurrency] || 0) - input.fromAmount;
    wallet.balances[input.toCurrency] = (wallet.balances[input.toCurrency] || 0) + input.toAmount;
    const wallets = readJson<Record<string, Wallet>>(LS_WALLETS, {});
    wallets[input.userId] = wallet;
    writeJson(LS_WALLETS, wallets);
  }

  // persist possibly updated status
  txs[input.userId] = [tx, ...(txs[input.userId] ?? []).filter((t) => t.id !== tx.id)].slice(0, 100);
  writeJson(LS_TXS, txs);
  return tx;
}

export function mockGetTransactions(userId: string): Transaction[] {
  const txs = readJson<Record<string, Transaction[]>>(LS_TXS, {});
  return txs[userId] ?? [];
}

export function mockGetStats() {
  return {
    totalVolume24h: 0,
    activeUsers: readJson<MockUser[]>(LS_USERS, []).length,
    countriesSupported: 127,
    averageSettlementTime: 28,
    lastUpdated: new Date().toISOString(),
  };
}

