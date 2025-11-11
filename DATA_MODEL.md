# Data Model

## Tables

1. **cashflow**
   - `id INTEGER PRIMARY KEY`
   - `type TEXT CHECK(type IN ('income','expense'))`
   - `amount INTEGER NOT NULL` (stored as cents: KES \* 100)
   - `category TEXT`
   - `note TEXT`
   - `ts INTEGER NOT NULL` (Unix ms)
2. **settings**
   - `key TEXT PRIMARY KEY`
   - `value TEXT`
3. **migrations**
   - `name TEXT PRIMARY KEY`
   - `appliedAt INTEGER` (Unix ms timestamp)

## Default Seed Data

- Categories inserted during migration:
  - `mitumba stock`
  - `flour`
  - `fuel`
  - `airtime`
  - `rent`
  - `savings`
