# API Specification

All endpoints live under `/api`. JSON requests/responses use UTF-8 encoding. Error format: `{ "error": "message" }` with `4xx/5xx` status codes.

## POST /api/advice

- **Body:** `{ businessType: string, location: string, description: string, goals: string }`
- **Response:** `{ advice: { pricing: string, branding: string, competition: string, marketing: string }, tokensUsed: number }`
- **Status Codes:** `200` success, `400` validation error, `500` AI adapter failure.

## POST /api/plan

- **Body:** `{ businessType: string, budget: number, skills: string, timeline: string }`
- **Response:** `{ plan: { overview: string, steps: string[], risks: string[], marketing: string, finances: string }, tokensUsed: number }`
- **Status Codes:** `200`, `400`, `500`.

## GET /api/finance-tips

- **Response:** `{ tips: string[] }`
- **Status Codes:** `200`, `500` if static load fails.

## GET /api/cashflow

- **Query:** optional `range` in `"day" | "week" | "month"` (defaults to `day`).
- **Response:** `{ summary: { income: number, expense: number, balance: number }, entries: CashflowEntry[] }`
- **CashflowEntry:** `{ id: number, type: "income"|"expense", amount: number, category: string, note: string|null, ts: number }` (amounts in cents).
- **Status Codes:** `200`, `400` invalid range, `500` DB failure.

## POST /api/cashflow

- **Body:** `{ type: "income"|"expense", amount: number, category: string, note?: string, ts: number }` (amount in cents).
- **Response:** `{ ok: true, id: number }`
- **Status Codes:** `201` created, `400`, `500`.

## DELETE /api/cashflow/:id

- **Response:** `{ ok: true }`
- **Status Codes:** `200`, `404` missing entry, `500` DB failure.

## GET /api/health

- **Response:** `{ ok: true }`
- **Status Codes:** `200` when server + DB reachable.
