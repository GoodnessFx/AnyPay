import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uuid } from "../lib/ids";
import {
  LS_KEYS,
  type AnyPayUser,
  type EscrowRecord,
  type GroupPool,
  type Notification,
  type RateAlertRule,
  type RatesCache,
  type SwapIntent,
  type Transaction,
  type Wallet,
} from "../lib/schema";
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
  const escrows = readStorage<EscrowRecord[] | null>(LS_KEYS.escrows, null);
  const swapIntents = readStorage<SwapIntent[] | null>(LS_KEYS.swapIntents, null);
  const rateAlerts = readStorage<RateAlertRule[] | null>(LS_KEYS.rateAlerts, null);
  const groupPools = readStorage<GroupPool[] | null>(LS_KEYS.groupPools, null);

  return {
    user,
    wallet: wallet ?? defaultWallet(),
    txns: txns ?? [],
    notifs: notifs ?? [],
    rates: rates ?? { updatedAt: nowIso(), cryptoUsd: {}, usdToNgn: undefined },
    escrows: escrows ?? [],
    swapIntents: swapIntents ?? [],
    rateAlerts: rateAlerts ?? [],
    groupPools: groupPools ?? [],
  };
}

type AppState = {
  user: AnyPayUser | null;
  wallet: Wallet;
  txns: Transaction[];
  notifs: Notification[];
  rates: RatesCache;
  escrows: EscrowRecord[];
  swapIntents: SwapIntent[];
  rateAlerts: RateAlertRule[];
  groupPools: GroupPool[];

  signOut: () => void;
  setUser: (user: AnyPayUser | null) => void;
  setWallet: (wallet: Wallet) => void;

  pushNotif: (input: Omit<Notification, "id" | "timestamp" | "read"> & Partial<Pick<Notification, "read">>) => void;
  markAllNotifsRead: () => void;

  credit: (asset: keyof Wallet, amount: number, meta?: Partial<Transaction>) => Transaction;
  debit: (asset: keyof Wallet, amount: number, meta?: Partial<Transaction>) => Transaction;
  addTxn: (txn: Omit<Transaction, "id" | "timestamp"> & Partial<Pick<Transaction, "timestamp">>) => Transaction;

  setRates: (rates: RatesCache) => void;

  addSwapIntent: (intent: Omit<SwapIntent, "id" | "createdAt" | "status"> & Partial<Pick<SwapIntent, "status">>) => SwapIntent;
  updateSwapIntent: (id: string, patch: Partial<SwapIntent>) => void;

  addEscrow: (escrow: Omit<EscrowRecord, "id" | "createdAt" | "status"> & Partial<Pick<EscrowRecord, "status">>) => EscrowRecord;
  updateEscrow: (id: string, patch: Partial<EscrowRecord>) => void;
  confirmEscrowDelivery: (id: string) => void;
  releaseEscrow: (id: string) => void;
  disputeEscrow: (id: string, reason: string) => void;
  resolveEscrow: (id: string, resolution: string) => void;

  addRateAlert: (rule: Omit<RateAlertRule, "id" | "createdAt" | "enabled"> & Partial<Pick<RateAlertRule, "enabled">>) => RateAlertRule;
  toggleRateAlert: (id: string, enabled: boolean) => void;

  addGroupPool: (pool: Omit<GroupPool, "id" | "createdAt" | "status"> & Partial<Pick<GroupPool, "status">>) => GroupPool;
  updateGroupPool: (id: string, patch: Partial<GroupPool>) => void;
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
      escrows: seeded.escrows,
      swapIntents: seeded.swapIntents,
      rateAlerts: seeded.rateAlerts,
      groupPools: seeded.groupPools,

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

      addSwapIntent: (input) => {
        const intent: SwapIntent = {
          id: `swap_${uuid()}`,
          createdAt: nowIso(),
          status: input.status ?? "draft",
          userId: input.userId,
          have: input.have,
          want: input.want,
          quoteId: input.quoteId,
          escrowId: input.escrowId,
        };
        const next = [intent, ...get().swapIntents].slice(0, 200);
        set({ swapIntents: next });
        writeStorage(LS_KEYS.swapIntents, next as any);
        return intent;
      },

      updateSwapIntent: (id, patch) => {
        const next = get().swapIntents.map((s) => (s.id === id ? { ...s, ...patch } : s));
        set({ swapIntents: next });
        writeStorage(LS_KEYS.swapIntents, next as any);
      },

      addEscrow: (input) => {
        const escrow: EscrowRecord = {
          id: `esc_${uuid()}`,
          createdAt: nowIso(),
          status: input.status ?? "locked",
          swapId: input.swapId,
          payerUserId: input.payerUserId,
          payeeUserId: input.payeeUserId,
          lockedValue: input.lockedValue,
          have: input.have,
          want: input.want,
          expiresAt: input.expiresAt,
          dispute: input.dispute,
        };
        const next = [escrow, ...get().escrows].slice(0, 200);
        set({ escrows: next });
        writeStorage(LS_KEYS.escrows, next as any);
        return escrow;
      },

      updateEscrow: (id, patch) => {
        const next = get().escrows.map((e) => (e.id === id ? { ...e, ...patch } : e));
        set({ escrows: next });
        writeStorage(LS_KEYS.escrows, next as any);
      },

      confirmEscrowDelivery: (id) => {
        const e = get().escrows.find((x) => x.id === id);
        if (!e || e.status === "disputed" || e.status === "released") return;
        get().updateEscrow(id, { status: "awaiting_confirmation" });
      },

      releaseEscrow: (id) => {
        const e = get().escrows.find((x) => x.id === id);
        if (!e || e.status === "disputed" || e.status === "released") return;
        get().updateEscrow(id, { status: "released" });
      },

      disputeEscrow: (id, reason) => {
        const e = get().escrows.find((x) => x.id === id);
        if (!e || e.status === "released") return;
        get().updateEscrow(id, { status: "disputed", dispute: { openedAt: nowIso(), reason } });
      },

      resolveEscrow: (id, resolution) => {
        const e = get().escrows.find((x) => x.id === id);
        if (!e || e.status !== "disputed") return;
        get().updateEscrow(id, {
          status: "resolved",
          dispute: { ...(e.dispute ?? { openedAt: nowIso(), reason: "unknown" }), resolution, resolvedAt: nowIso() },
        });
      },

      addRateAlert: (input) => {
        const rule: RateAlertRule = {
          id: `ra_${uuid()}`,
          createdAt: nowIso(),
          enabled: input.enabled ?? true,
          userId: input.userId,
          pair: input.pair,
          condition: input.condition,
          threshold: input.threshold,
          action: input.action,
          lastTriggeredAt: input.lastTriggeredAt,
        };
        const next = [rule, ...get().rateAlerts].slice(0, 200);
        set({ rateAlerts: next });
        writeStorage(LS_KEYS.rateAlerts, next as any);
        return rule;
      },

      toggleRateAlert: (id, enabled) => {
        const next = get().rateAlerts.map((r) => (r.id === id ? { ...r, enabled } : r));
        set({ rateAlerts: next });
        writeStorage(LS_KEYS.rateAlerts, next as any);
      },

      addGroupPool: (input) => {
        const pool: GroupPool = {
          id: `pool_${uuid()}`,
          createdAt: nowIso(),
          status: input.status ?? "open",
          ownerUserId: input.ownerUserId,
          title: input.title,
          members: input.members,
          contributions: input.contributions,
          target: input.target,
          splitRule: input.splitRule,
          fixedSplits: input.fixedSplits,
        };
        const next = [pool, ...get().groupPools].slice(0, 100);
        set({ groupPools: next });
        writeStorage(LS_KEYS.groupPools, next as any);
        return pool;
      },

      updateGroupPool: (id, patch) => {
        const next = get().groupPools.map((p) => (p.id === id ? { ...p, ...patch } : p));
        set({ groupPools: next });
        writeStorage(LS_KEYS.groupPools, next as any);
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
        escrows: s.escrows,
        swapIntents: s.swapIntents,
        rateAlerts: s.rateAlerts,
        groupPools: s.groupPools,
      }),
    }
  )
);

