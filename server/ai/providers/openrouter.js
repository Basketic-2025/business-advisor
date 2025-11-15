// OpenRouter exposes an OpenAI-compatible Chat Completions API.
// Reuse the HTTP-based provider implementation so any env overrides
// (AI_MODEL, AI_API_BASE, headers, etc.) continue to work.

export {
  generateAdvice,
  generatePlan,
  generateFinanceTips,
} from "./httpLLMProvider.js";
export { default } from "./httpLLMProvider.js";
