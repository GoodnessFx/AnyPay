# AnyPay — Universal Value Router (MVP)

AnyPay is a **mobile-first** web app that lets users **authenticate, manage a multi-asset wallet, get a quote (route), and execute a conversion** using a localStorage-backed mock backend (no external services required).

## Features (implemented in this repo)

- **Auth**: Email/password sign up + sign in (local mock auth via `localStorage`)
- **Wallet**: Multi-currency balances (USD, BTC, ETH, USDT, NGN) stored locally via `localStorage`
- **Top up / Withdraw**: Internal-ledger wallet operations (MVP-ready primitives)
- **Routing / Quote**: Returns an “optimal route” quote for a conversion
- **Swap execution**: Creates a transaction and completes it (ledger update)
- **Transaction history**: Lists latest transactions with status (pending/completed/failed)
- **Dashboard stats**: Live stats pulled from the backend
- **Mobile responsive UI**: Responsive layout + mobile slide-over menu

## Trust & Social Layer

- **Seller/Buyer Reputation System** — trust score on every counterparty
- **Verified Swap Receipts** — shareable on-chain proof of every transaction
- **Escrow Confidence Meter** — visual protection indicator before every P2P swap
- **Live Swap Activity Feed** — real-time anonymised activity from the network
- **Trust Badges** — 8 earned badges displayed on all listings and profiles
- **Counterparty Preview** — see who you are swapping with before funds move
- **Dispute Protection Banner** — persistent reminder on all open swaps

## Fun & Retention Layer

- **Daily Streak** — consecutive day rewards up to 365-day Legendary NFT badge
- **Swap Milestones** — volume milestone celebrations with shareable cards
- **Spin to Earn** — daily reward spin, $ANYPAY tokens and fee discounts
- **AnyPay Wrapped** — annual personalised summary card, designed to go viral
- **Rate Race** — weekly prediction game on currency pair direction
- **Referral Chain** — two-level referral earning on all referred user fees
- **Physical Swap Marketplace** — "Things" tab, list and swap physical items with escrow
- **AnyPay.me Links** — personal payment page for every user, any currency in
- **Split Bill** — group payment link, each person pays in their own currency

## Tech stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend**: Local mock backend (auth + wallet + routing + transactions) stored in `localStorage`

## Repo layout

- `index.html`: Vite entry HTML
- `vite.config.ts`: Vite config (port 3000)
- `src/`: React app


## Getting started (local)

### Prerequisites

- Node.js 18+ (recommended: latest LTS)

### 1) Environment

No external environment variables are required. The app runs entirely against a **localStorage-backed mock backend** (auth + wallet + routing + transactions).

### 2) Install

```bash
npm install
```

### 3) Run dev server

```bash
npm run dev
```

Vite will serve on `http://localhost:3000`.

### 4) Build + preview production

```bash
npm run build
npm run preview
```

## Backend (Supabase Edge Functions)

The frontend calls:

- `GET /health`
- `POST /auth/signup`
- `GET /wallet/:userId`
- `POST /wallet/:userId/topup`
- `POST /wallet/:userId/withdraw`
- `POST /route`
- `POST /transactions`
- `GET /transactions/:userId`
- `GET /stats`

All endpoints are served by the edge function in `src/supabase/functions/server/index.tsx`.

### Required function env vars

When deploying the edge function, set:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The KV store expects a table `kv_store_ed0cf80c` (see `src/supabase/functions/server/kv_store.tsx`).

## “Smart contract” / Web3

This repo **does not include on-chain smart contracts** or an EVM deployment flow (no `solidity`, `hardhat`, `foundry`, `ethers`, etc.). Crypto-related options in the UI are supported as **wallet assets / payment rails**, but settlement is currently handled as an MVP **internal ledger** via Supabase.

## Quality checklist (MVP-ready)

- **No demo/fake UI fallbacks**: if backend data is unavailable, UI shows empty/error states
- **Production build works**: `npm run build`
- **Mobile responsive layout**: Tailwind responsive grid + dedicated mobile menu
