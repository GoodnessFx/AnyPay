# AnyPay — Universal Value Router (MVP)

AnyPay is a **mobile-first** web app that lets users **authenticate, manage a multi-asset wallet, get a quote (route), and execute a conversion** while tracking transactions in real time via Supabase Edge Functions.

## Features (implemented in this repo)

- **Auth**: Email/password sign up + sign in (Supabase Auth)
- **Wallet**: Multi-currency balances (USD, BTC, ETH, USDT, NGN) backed by Supabase storage
- **Top up / Withdraw**: Internal-ledger wallet operations (MVP-ready primitives)
- **Routing / Quote**: Returns an “optimal route” quote for a conversion
- **Swap execution**: Creates a transaction and completes it (ledger update)
- **Transaction history**: Lists latest transactions with status (pending/completed/failed)
- **Dashboard stats**: Live stats pulled from the backend
- **Mobile responsive UI**: Responsive layout + mobile slide-over menu

## Tech stack

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend**: Supabase (Auth + Edge Functions + Postgres table-backed KV store)

## Repo layout

- `index.html`: Vite entry HTML
- `vite.config.ts`: Vite config (port 3000)
- `src/`: React app
- `src/supabase/functions/server/`: Supabase Edge Function (Hono) that powers wallet/route/transactions/stats

## Getting started (local)

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- A Supabase project

### 1) Configure environment

Copy `.env.example` → `.env.local` and fill:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (optional) `VITE_SUPABASE_FUNCTIONS_PREFIX` (default is `make-server-ed0cf80c`)

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
