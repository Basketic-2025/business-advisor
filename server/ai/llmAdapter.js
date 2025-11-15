import * as mockModel from "./mockModel.js";
import * as httpLLMProvider from "./providers/httpLLMProvider.js";
import * as openRouterProvider from "./providers/openrouter.js";

const hasApiKey = Boolean(process.env.AI_API_KEY);
const providerMap = {
  default: httpLLMProvider,
  openai: httpLLMProvider,
  openrouter: openRouterProvider,
};
const requestedProvider = (
  process.env.AI_PROVIDER || "default"
).toLowerCase();
const aiProvider = providerMap[requestedProvider] || httpLLMProvider;
const providerName = providerMap[requestedProvider]
  ? requestedProvider
  : "default";

if (!providerMap[requestedProvider] && process.env.AI_PROVIDER) {
  console.warn(
    `[LLM] Unsupported AI_PROVIDER "${process.env.AI_PROVIDER}", falling back to default HTTP provider.`,
  );
}

export async function generateAdvice(payload) {
  if (!hasApiKey) {
    console.warn("[LLM] No AI_API_KEY detected. Serving mock advice.");
    return mockModel.generateAdvice(payload);
  }
  try {
    console.info(`[LLM] Requesting advice from ${providerName} provider...`);
    return await aiProvider.generateAdvice(payload);
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
    console.info(`[LLM] Requesting plan from ${providerName} provider...`);
    return await aiProvider.generatePlan(payload);
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
    console.info(
      `[LLM] Requesting finance tips from ${providerName} provider...`,
    );
    return await aiProvider.generateFinanceTips(payload);
  } catch (error) {
    console.error(
      "Finance tips provider failed, falling back to mock:",
      error.message,
    );
    return mockModel.generateFinanceTips(payload);
  }
}
