export const LS_KEYS = {
  user: "anypay_user",
  wallet: "anypay_wallet",
  txns: "anypay_txns",
  notifs: "anypay_notifs",
  rates: "anypay_rates",
} as const;

export type Currency = "USD" | "NGN" | "BTC" | "ETH" | "USDT" | "BNB" | "SOL";
export type SwapAsset = Currency | "Airtime" | "Gift Card";

export type AnyPayUser = {
  id: string;
  name: string;
  email?: string;
  country: string;
  createdAt: string;
  walletAddress?: string;
};

export type Wallet = Record<Currency, number>;

export type TxnType = "topup" | "withdrawal" | "swap" | "send" | "receive" | "auth";
export type TxnStatus = "pending" | "completed" | "failed";

export type Transaction = {
  id: string;
  type: TxnType;
  status: TxnStatus;
  asset?: SwapAsset;
  fromAsset?: SwapAsset;
  toAsset?: SwapAsset;
  amount: number;
  amountOut?: number;
  fee?: number;
  method?: string;
  route?: string;
  speedSeconds?: number;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type NotificationType = "success" | "info" | "warning";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

export type RatesCache = {
  updatedAt: string;
  cryptoUsd: Partial<Record<Currency, { price: number; change24hPct?: number }>>;
  usdToNgn?: number;
};

