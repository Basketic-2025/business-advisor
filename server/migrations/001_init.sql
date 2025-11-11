CREATE TABLE IF NOT EXISTS cashflow (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount INTEGER NOT NULL,
  category TEXT,
  note TEXT,
  ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS migrations (
  name TEXT PRIMARY KEY,
  appliedAt INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (key, value)
VALUES (
  'cashflowCategories',
  '["mitumba stock","flour","fuel","airtime","rent","savings"]'
);
