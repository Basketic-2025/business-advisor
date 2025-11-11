import { Router } from "express";
import { z } from "zod";
import db from "../db.js";

const router = Router();

const rangeSchema = z
  .object({
    range: z.enum(["day", "week", "month"]).default("day"),
  })
  .partial();

const entrySchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().int().positive(),
  category: z.string().trim().min(1).max(64),
  note: z
    .string()
    .trim()
    .max(280)
    .optional()
    .transform((val) => (val ? val : null)),
  ts: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(() => Date.now()),
});

const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listStmt = db.prepare(
  `SELECT id, type, amount, category, note, ts
   FROM cashflow
   WHERE ts >= ?
   ORDER BY ts DESC`,
);

const summaryStmt = db.prepare(
  `SELECT
    IFNULL(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
    IFNULL(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
   FROM cashflow
   WHERE ts >= ?`,
);

const insertStmt = db.prepare(
  `INSERT INTO cashflow (type, amount, category, note, ts)
   VALUES (@type, @amount, @category, @note, @ts)`,
);

const deleteStmt = db.prepare("DELETE FROM cashflow WHERE id = ?");

function getRangeStart(range) {
  const now = new Date();
  if (range === "day") {
    now.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = now.getDate() - day;
    now.setDate(diff);
    now.setHours(0, 0, 0, 0);
  } else if (range === "month") {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
  }
  return now.getTime();
}

router.get("/", (req, res) => {
  const parsed = rangeSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid range" });
  }
  const range = parsed.data.range || "day";
  const start = getRangeStart(range);

  const entries = listStmt.all(start);
  const totals = summaryStmt.get(start);
  const summary = {
    income: totals.income,
    expense: totals.expense,
    balance: totals.income - totals.expense,
  };

  return res.json({ summary, entries });
});

router.post("/", (req, res) => {
  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message || "Invalid payload" });
  }
  const payload = parsed.data;
  const info = insertStmt.run(payload);
  return res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
});

router.delete("/:id", (req, res) => {
  const parsed = deleteSchema.safeParse({ id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const result = deleteStmt.run(parsed.data.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Entry not found" });
  }
  return res.json({ ok: true });
});

export default router;
