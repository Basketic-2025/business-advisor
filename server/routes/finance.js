import { Router } from "express";
import { generateFinanceTips } from "../ai/llmAdapter.js";

const router = Router();

const fallbackTips = [
  "Set aside at least KES 50 daily in a lockable tin or chama to build emergency float.",
  "Separate personal and business M-Pesa lines so you always know true float balance.",
  "Record every stock purchase (mitumba bale, flour, airtime) and compare margin weekly.",
  "Use morning promotions (buy 3 get 4th cheaper) to beat competition without price wars.",
  "Keep 20% of daily profits for savings or short-term investment groups (table banking).",
  "Map high and low sales hours; align boda fuel spend or bakery production to demand.",
  "Negotiate bulk buys with wholesalers and pass small discounts to loyal customers.",
  "Review cashflow every Sunday - identify leakages like impulse airtime lending or extra fuel.",
];

router.get("/", async (req, res) => {
  try {
    const payload = await generateFinanceTips({
      context: req.query.context,
    });
    return res.json(payload);
  } catch (error) {
    return res.json({ tips: fallbackTips, tokensUsed: 0 });
  }
});

export default router;
