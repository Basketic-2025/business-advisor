import * as mockModel from "./mockModel.js";
import * as openAIProvider from "./providers/openai.js";

const hasApiKey = Boolean(process.env.AI_API_KEY);

export async function generateAdvice(payload) {
  if (!hasApiKey) {
    console.warn("[LLM] No AI_API_KEY detected. Serving mock advice.");
    return mockModel.generateAdvice(payload);
  }
  try {
    console.info("[LLM] Requesting advice from provider...");
    return await openAIProvider.generateAdvice(payload);
  } catch (error) {
    console.error(
      "Advice provider failed, falling back to mock:",
      error.message,
    );
    return mockModel.generateAdvice(payload);
  }
}

export async function generatePlan(payload) {
  if (!hasApiKey) {
    console.warn("[LLM] No AI_API_KEY detected. Serving mock plan.");
    return mockModel.generatePlan(payload);
  }
  try {
    console.info("[LLM] Requesting plan from provider...");
    return await openAIProvider.generatePlan(payload);
  } catch (error) {
    console.error("Plan provider failed, falling back to mock:", error.message);
    return mockModel.generatePlan(payload);
  }
}

export async function generateFinanceTips(payload = {}) {
  if (!hasApiKey) {
    console.warn("[LLM] No AI_API_KEY detected. Serving mock finance tips.");
    return mockModel.generateFinanceTips(payload);
  }
  try {
    console.info("[LLM] Requesting finance tips from provider...");
    return await openAIProvider.generateFinanceTips(payload);
  } catch (error) {
    console.error(
      "Finance tips provider failed, falling back to mock:",
      error.message,
    );
    return mockModel.generateFinanceTips(payload);
  }
}
