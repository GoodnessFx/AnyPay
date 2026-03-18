export const LS_KEYS = {
  user: "anypay_user",
  wallet: "anypay_wallet",
  txns: "anypay_txns",
  notifs: "anypay_notifs",
  rates: "anypay_rates",
  escrows: "anypay_escrows",
  swapIntents: "anypay_swap_intents",
  rateAlerts: "anypay_rate_alerts",
  groupPools: "anypay_group_pools",
} as const;

export type Currency = "USD" | "NGN" | "BTC" | "ETH" | "USDT" | "BNB" | "SOL";
export type SwapAsset = Currency | "Airtime" | "Gift Card";

export type AssetKind =
  | "CRYPTO"
  | "FIAT"
  | "AIRTIME"
  | "DATA"
  | "GIFT_CARD"
  | "LOYALTY_POINTS"
  | "PHYSICAL_ITEM"
  | "SERVICE_TIME"
  | "DEBT_IOU"
  | "SUBSCRIPTION"
  | "RWA"
  | "TICKET"
  | "DOMAIN_DIGITAL";

export type AssetDescriptor = {
  kind: AssetKind;
  // For rails-like assets, `code` is a canonical identifier. Examples:
  // - CRYPTO: "USDT", "ETH"
  // - FIAT: "USD", "NGN"
  // - AIRTIME: "MTN_NG"
  // - GIFT_CARD: "AMAZON_US"
  // - LOYALTY_POINTS: "DELTA_SKYMILES"
  code: string;
  amount?: number;
  // Asset-specific payload (item condition/photos, gift card details, ticket QR hash, etc.)
  meta?: Record<string, unknown>;
};

export type SwapLeg = {
  from: AssetDescriptor;
  to: AssetDescriptor;
  provider: string;
  etaSeconds: number;
};

export type SwapQuote = {
  id: string;
  createdAt: string;
  expiresAt: string;
  have: AssetDescriptor;
  want: AssetDescriptor;
  route: SwapLeg[];
  fee: { amount: number; code: string };
  expectedOut: { amount: number; code: string };
  notes?: string[];
};

export type EscrowStatus =
  | "draft"
  | "locked"
  | "awaiting_delivery"
  | "awaiting_confirmation"
  | "released"
  | "disputed"
  | "resolved";

export type EscrowRecord = {
  id: string;
  swapId: string;
  createdAt: string;
  expiresAt: string; // 7-day auto-release window
  status: EscrowStatus;
  payerUserId: string;
  payeeUserId?: string;
  lockedValue: { amount: number; code: string }; // ledger-based in MVP
  have: AssetDescriptor;
  want: AssetDescriptor;
  dispute?: { openedAt: string; reason: string; resolution?: string; resolvedAt?: string };
};

export type SwapIntent = {
  id: string;
  createdAt: string;
  userId: string;
  have: AssetDescriptor;
  want: AssetDescriptor;
  quoteId?: string;
  escrowId?: string;
  status: "draft" | "quoted" | "executing" | "completed" | "failed";
};

export type RateAlertRule = {
  id: string;
  createdAt: string;
  userId: string;
  pair: string; // e.g. "BTC/USD" or "NGN/USD"
  condition: "GTE" | "LTE";
  threshold: number;
  action: { have: AssetDescriptor; want: AssetDescriptor; maxSlippagePct: number };
  enabled: boolean;
  lastTriggeredAt?: string;
};

export type GroupPool = {
  id: string;
  createdAt: string;
  ownerUserId: string;
  title: string;
  members: { userId: string; name?: string }[];
  contributions: { userId: string; asset: AssetDescriptor }[];
  target?: AssetDescriptor;
  splitRule: "pro_rata" | "fixed";
  fixedSplits?: Record<string, number>; // userId -> pct
  status: "open" | "funded" | "settling" | "settled";
};

export type AnyPayUser = {
  id: string;
  name: string;
  email?: string;
  country: string;
  city?: string;
  createdAt: string;
  walletAddress?: string;
  trustScore: number; // 0-100
  badges: string[];
  isIdVerified: boolean;
  isPhoneVerified: boolean;
  streakDays: number;
  totalSwapVolumeUsd: number;
  lastActiveAt: string;
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

