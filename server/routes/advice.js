import { Router } from "express";
import { z } from "zod";
import { generateAdvice } from "../ai/llmAdapter.js";

const router = Router();

const adviceSchema = z.object({
  businessType: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(500),
  goals: z.string().trim().min(5).max(300),
});

router.post("/", async (req, res, next) => {
  const parsed = adviceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues[0]?.message || "Invalid payload" });
  }
  try {
    const result = await generateAdvice(parsed.data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
