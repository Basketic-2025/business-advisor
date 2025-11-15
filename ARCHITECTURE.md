# Architecture

## Layers & Directories

- `server/`: Node.js + Express services. Houses route modules, AI adapter, SQLite query layer (via `server/db.js`), and an outbound queue for offline sync uploads.
- `web/`: Static HTML, CSS, and Vanilla JS modules. Each module (advisor, plan, finance tips, cashflow) handles its own DOM + fetch logic. Strings are pulled from `web/i18n/en.js` for future localization.
- `service-worker.js`: Progressive Web App shell that precaches critical assets, intercepts fetches, and drains an IndexedDB/LocalStorage-backed queue when connectivity returns.

## Server Layer Details

1. **Express App (`server/index.js`)**
   - Applies security middleware (helmet, cors, compression, rate limiting) and request logging (morgan).
   - Serves `web/` static assets and API routes defined in `server/routes`.
   - Provides `/api/health` and centralized error handling.
2. **Database (`server/db.js`)**
   - Uses better-sqlite3 against `data/app.db`.
   - Executes migrations in `server/migrations` idempotently.
   - Exposes helpers for prepared statements to keep routes thin.
3. **Routes (`server/routes/*.js`)**
   - `advice`, `plan`, `finance`, `cashflow` mount under `/api/*`.
   - Input validation happens with Zod, including basic coercion to protect SQLite writes.
   - Cashflow routes keep amounts in cents (KES \* 100) and provide summaries for day/week/month windows.
4. **Offline Sync Queue**
   - Incoming cashflow writes are accepted immediately and mirrored locally.
   - When the client reconnects, queued entries POST to `/api/cashflow` using Background Sync (fallback to timers).

## Web Layer

- `web/index.html`: App shell with navigation tabs (Advisor, Business Plan, Finance Tips, Cashflow) and offline badge.
- `web/styles.css`: High-contrast palette, utility classes (`.btn`, `.card`, `.grid`) for consistent spacing, and focus-visible outlines.
- `web/main.js`: Bootstraps tab router, shared fetch wrapper, toasts, currency formatter, and online/offline indicators.
- `web/modules/*.js`: Feature-focused modules that render forms, call APIs, and update DOM fragments. Each exports `init(container)` for lazy mounting.

## PWA Strategy

- `public/manifest.webmanifest`: Declares metadata, icons, and standalone display for install prompts.
- `service-worker.js`:
  - **Cache-first** for HTML, CSS, JS, icons (app shell) using precache manifest.
  - **Network-first** for AI endpoints to ensure fresh advice. Falls back to cache on failure with user notification.
  - Captures cashflow POST body payloads while offline, stores them in IndexedDB/local queue, and retries with Background Sync or visibilitychange.

## AI Adapter Interface

- `server/ai/llmAdapter.js` exports `generateAdvice(payload)` and `generatePlan(payload)`.
- Adapter checks `process.env.AI_API_KEY`:
-  - Missing key ? delegate to `server/ai/mockModel.js` for deterministic guidance.
-  - Key present ? call provider implementation (currently `providers/httpLLMProvider.js`, easily extendable for others).
- Both functions return `{ result, tokensUsed }` style payloads so routes can add metadata without knowing provider internals.

## Mock Fallback

- `server/ai/mockModel.js` uses simple templates keyed by business type to produce advice and plan sections.
- Ensures the app is fully functional offline without external dependencies.
