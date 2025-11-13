# AI Hustler Business Advisor

Microbusiness mentor for pricing, branding, competition, marketing, plans, and financial literacy. Optional M-Pesa-friendly cashflow tracker.

## Purpose

AI Hustler Business Advisor helps Kenyan kiosk owners, boda riders, mitumba traders, bakers, and smallholder farmers get practical guidance on pricing, branding, competition, marketing, and cashflow discipline�all offline-friendly and privacy-first.

## Features

- AI-backed advisor with tailored prompts for common microbusiness profiles.
- Lightweight business plan generator with actionable steps and risk planning.
- Finance literacy tips focused on chamas, float management, and inventory discipline.
- Cashflow tracker with shilling formatting, summaries, and offline queueing.
- PWA shell for fast, low-bandwidth use on budget Android devices.

## How to Run

1. Copy `.env.example` to `.env` and (optionally) add a real `AI_API_KEY`.
2. Install dependencies: `npm i`.
3. Start development server: `npm run dev` then visit `http://localhost:3000`.
4. Production build: `npm run build && npm start`.

## Screenshots



## Quickstart

- **Install:** `npm i`
- **Dev:** `npm run dev` then open `http://localhost:3000`
- **Prod:** `npm run build && npm start`
- **Env:** copy `.env.example` ? `.env` and (optionally) set `AI_API_KEY`.

## Development Notes
- The app ships with a service worker that caches `web/index.html`, CSS, and JS. Whenever you make frontend changes, bump the cache version strings (`APP_CACHE`/`DATA_CACHE`) in `service-worker.js` so browsers download the newest assets. After bumping, reload with DevTools open or unregister the old worker to see the updates immediately.
