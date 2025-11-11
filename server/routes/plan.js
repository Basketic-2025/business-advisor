import { Router } from "express";
import { z } from "zod";
import { generatePlan } from "../ai/llmAdapter.js";

const router = Router();

const planSchema = z.object({
  businessType: z.string().trim().min(2).max(80),
  budget: z.coerce.number().int().positive(),
  skills: z.string().trim().min(3).max(500),
  timeline: z.string().trim().min(2).max(80),
});

router.post("/", async (req, res, next) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message || "Invalid payload" });
  }
  try {
    const result = await generatePlan(parsed.data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
