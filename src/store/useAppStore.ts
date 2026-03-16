import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uuid } from "../lib/ids";
import { LS_KEYS, type AnyPayUser, type Notification, type RatesCache, type Transaction, type Wallet } from "../lib/schema";
import { readStorage, writeStorage } from "../lib/storage";

function nowIso() {
  return new Date().toISOString();
}

function defaultWallet(): Wallet {
  return { USD: 0, NGN: 0, BTC: 0, ETH: 0, USDT: 0, BNB: 0, SOL: 0 };
}

function ensureSeeded() {
  // If the app previously stored individual keys, prefer them.
  // This keeps dev stable while we migrate to Zustand persist.
  const user = readStorage<AnyPayUser | null>(LS_KEYS.user, null);
  const wallet = readStorage<Wallet | null>(LS_KEYS.wallet, null);
  const txns = readStorage<Transaction[] | null>(LS_KEYS.txns, null);
  const notifs = readStorage<Notification[] | null>(LS_KEYS.notifs, null);
  const rates = readStorage<RatesCache | null>(LS_KEYS.rates, null);

  return {
    user,
    wallet: wallet ?? defaultWallet(),
    txns: txns ?? [],
    notifs: notifs ?? [],
    rates: rates ?? { updatedAt: nowIso(), cryptoUsd: {}, usdToNgn: undefined },
  };
}

type AppState = {
  user: AnyPayUser | null;
  wallet: Wallet;
  txns: Transaction[];
  notifs: Notification[];
  rates: RatesCache;

  signOut: () => void;
  setUser: (user: AnyPayUser | null) => void;
  setWallet: (wallet: Wallet) => void;

  pushNotif: (input: Omit<Notification, "id" | "timestamp" | "read"> & Partial<Pick<Notification, "read">>) => void;
  markAllNotifsRead: () => void;

  credit: (asset: keyof Wallet, amount: number, meta?: Partial<Transaction>) => Transaction;
  debit: (asset: keyof Wallet, amount: number, meta?: Partial<Transaction>) => Transaction;
  addTxn: (txn: Omit<Transaction, "id" | "timestamp"> & Partial<Pick<Transaction, "timestamp">>) => Transaction;

  setRates: (rates: RatesCache) => void;
};

const seeded = ensureSeeded();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: seeded.user,
      wallet: seeded.wallet,
      txns: seeded.txns,
      notifs: seeded.notifs,
      rates: seeded.rates,

      setUser: (user) => {
        set({ user });
        writeStorage(LS_KEYS.user, (user ?? null) as any);
      },

      setWallet: (wallet) => {
        set({ wallet });
        writeStorage(LS_KEYS.wallet, wallet as any);
      },

      signOut: () => {
        set({ user: null });
        writeStorage(LS_KEYS.user, null as any);
      },

      pushNotif: (input) => {
        const notif: Notification = {
          id: uuid(),
          type: input.type,
          title: input.title,
          message: input.message,
          timestamp: nowIso(),
          read: input.read ?? false,
        };
        const next = [notif, ...get().notifs].slice(0, 100);
        set({ notifs: next });
        writeStorage(LS_KEYS.notifs, next as any);
      },

      markAllNotifsRead: () => {
        const next = get().notifs.map((n) => ({ ...n, read: true }));
        set({ notifs: next });
        writeStorage(LS_KEYS.notifs, next as any);
      },

      addTxn: (txnInput) => {
        const txn: Transaction = {
          id: uuid(),
          timestamp: txnInput.timestamp ?? nowIso(),
          ...txnInput,
        };
        const next = [txn, ...get().txns].slice(0, 500);
        set({ txns: next });
        writeStorage(LS_KEYS.txns, next as any);
        return txn;
      },

      credit: (asset, amount, meta) => {
        const wallet = { ...get().wallet };
        wallet[asset] = (wallet[asset] ?? 0) + amount;
        set({ wallet });
        writeStorage(LS_KEYS.wallet, wallet as any);
        return get().addTxn({
          type: "topup",
          status: meta?.status ?? "completed",
          asset: meta?.asset ?? (asset as any),
          amount,
          method: meta?.method,
          fee: meta?.fee,
          route: meta?.route,
          speedSeconds: meta?.speedSeconds,
          meta: meta?.meta,
        });
      },

      debit: (asset, amount, meta) => {
        const wallet = { ...get().wallet };
        const current = wallet[asset] ?? 0;
        if (current < amount) {
          return get().addTxn({
            type: meta?.type ?? "withdrawal",
            status: "failed",
            asset: meta?.asset ?? (asset as any),
            amount,
            method: meta?.method,
            fee: meta?.fee,
            route: meta?.route,
            speedSeconds: meta?.speedSeconds,
            meta: { ...(meta?.meta ?? {}), reason: "insufficient_balance", current },
          });
        }
        wallet[asset] = current - amount;
        set({ wallet });
        writeStorage(LS_KEYS.wallet, wallet as any);
        return get().addTxn({
          type: meta?.type ?? "withdrawal",
          status: meta?.status ?? "pending",
          asset: meta?.asset ?? (asset as any),
          amount,
          method: meta?.method,
          fee: meta?.fee,
          route: meta?.route,
          speedSeconds: meta?.speedSeconds,
          meta: meta?.meta,
        });
      },

      setRates: (rates) => {
        set({ rates });
        writeStorage(LS_KEYS.rates, rates as any);
      },
    }),
    {
      name: "anypay_zustand",
      version: 1,
      // NOTE: Persisting some state redundantly; we also keep explicit keys above for easy inspection.
      partialize: (s) => ({
        user: s.user,
        wallet: s.wallet,
        txns: s.txns,
        notifs: s.notifs,
        rates: s.rates,
      }),
    }
  )
);

