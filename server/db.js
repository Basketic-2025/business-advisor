import Database from "better-sqlite3";
import { mkdirSync, readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "..", "data");
const dbPath = join(dataDir, "app.db");

mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.prepare(
  "CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, appliedAt INTEGER NOT NULL)",
).run();

const appliedMigrations = new Set(
  db
    .prepare("SELECT name FROM migrations ORDER BY appliedAt ASC")
    .all()
    .map((row) => row.name),
);

const migrationsDir = join(__dirname, "migrations");
const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

const runMigration = db.transaction((file, sql) => {
  db.exec(sql);
  db.prepare("INSERT INTO migrations (name, appliedAt) VALUES (?, ?)").run(
    file,
    Date.now(),
  );
});

for (const file of migrationFiles) {
  if (appliedMigrations.has(file)) continue;
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  runMigration(file, sql);
}

export default db;
