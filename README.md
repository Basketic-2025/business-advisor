# AI Hustler Business Advisor

```
┌────────────────────────────────────────────────────────┐
│            AI Hustler Business Advisor                │
│  Microbusiness mentor for Kenyan hustlers            │
│Pricing · Branding · Competition · Marketing · Cashflow│
└────────────────────────────────────────────────────────┘
```

**Table of Contents**

1. [Purpose](#purpose)
2. [Core Experience](#core-experience)
3. [Tech Stack](#tech-stack)
4. [Quickstart](#quickstart)
5. [Development Notes](#development-notes)
6. [Offline & PWA Features](#offline--pwa-features)

---

## Purpose

**AI Hustler Business Advisor** empowers Kenyan kiosk owners, boda riders, mitumba traders, bakers, and smallholder farmers with practical, localized guidance across pricing, branding, competition, marketing, and cashflow literacy -- all designed to stay useful even when connectivity fades.

## Core Experience

- **Advisor**: Prompt + context guided pricing, branding, competition, and marketing tips tailored per profile (kiosk, mitumba stall, boda, pastry, etc.).
- **Business Plan**: Lightweight, action-oriented plan with risks, marketing, and finance recommendations so hustlers can explain a growth path to chamas, partners, or lenders.
- **Finance Tips**: Daily reminders for chamas, float management, savings, and inventory discipline with a cache/refresh loop for offline safety.
- **Cashflow Tracker**: Record income/expenses in shillings, surface summaries for day/week/month ranges, queue offline saves, and sync automatically when the network returns.

## Tech Stack

- **Frontend**: Vanilla JS + modular widgets (advisor, plan, finance tips, cashflow) served from `web/` with shared `appContext` helpers and localized strings housed in `web/i18n/en.js`.
- **Backend**: Node.js + Express API (`/api/advice`, `/api/plan`, `/api/finance-tips`, `/api/cashflow`) with payload validation via Zod and SQLite persistence (`data/app.db`).
- **AI Adapter**: `server/ai/llmAdapter.js` routes requests to `server/ai/providers/httpLLMProvider.js` (or OpenRouter) when `AI_API_KEY` exists, otherwise the deterministic `mockModel`.
- **PWA Shell**: `service-worker.js` precaches assets, applies cache-first to the app shell, and network-first (with cache fallback) to AI endpoints so advice survives offline.

## Quickstart

1. Duplicate `.env.example` to `.env` and, if available, add a real `AI_API_KEY`.
2. Install dependencies: `npm i`.
3. Run in development: `npm run dev` and open [http://localhost:3000](http://localhost:3000).
4. Production build: `npm run build && npm start`.

## Development Notes

- **Service Worker Cache**: After editing `web/` assets, bump `APP_CACHE`/`DATA_CACHE` in `service-worker.js` (currently `v35`) so browsers fetch the newest shell. Reload with DevTools open or unregister the worker to see changes immediately.
- **Database Migrations**: `server/db.js` runs every `.sql` file in `server/migrations`; the initial migration seeds cashflow tables + default categories. Deployed migrations are idempotent.
- **Mock AI Mode**: Without `AI_API_KEY`, `mockModel.js` delivers consistent advice/plan strings so the UI keeps working offline/tests.

## Offline & PWA Features

- **Cashflow Queue**: Entries made offline store in `localStorage` and retry via `flushQueue` (triggers on reconnect, service worker sync, or tab visibility changes).
- **Finance Tips Cache**: Last-fetched tips persist locally, so the list renders even when the fetch fails; refreshing hits the API for new tips and updates the cache.
- **Offline Badge**: `web/main.js` toggles the banner in the header (`#offlineBadge`) so users always know network status.
- **Service Worker Sync**: Registered background sync posts `cashflow-sync` messages so the client flushes any pending entries when connectivity returns.

---

Built for low-bandwidth, privacy-forward Kenyan hustlers -- ready for kiosks, bodas, mitumba stalls, bakeries, and farming co-ops.
