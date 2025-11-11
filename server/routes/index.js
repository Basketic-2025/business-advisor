import { Router } from "express";
import cashflowRouter from "./cashflow.js";
import financeRouter from "./finance.js";
import adviceRouter from "./advice.js";
import planRouter from "./plan.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.use("/cashflow", cashflowRouter);
router.use("/finance-tips", financeRouter);
router.use("/advice", adviceRouter);
router.use("/plan", planRouter);

export default router;
