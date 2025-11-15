const MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const API_BASE =
  process.env.AI_API_BASE || "https://api.openai.com/v1/chat/completions";
const API_KEY = process.env.AI_API_KEY || "";
const CLIENT_REFERER =
  process.env.AI_CLIENT_REFERER || "http://localhost:3000";
const CLIENT_TITLE =
  process.env.AI_CLIENT_TITLE || "AI Hustler Business Advisor";
const REQUEST_TIMEOUT_MS =
  Number(process.env.AI_TIMEOUT_MS) || 60000;

const adviceSystemPrompt =
  'You are AI Hustler, a Kenyan microbusiness mentor. Respond ONLY with JSON: {"pricing":"","branding":"","competition":"","marketing":""}. Keep each value under 80 words, practical, and low-cost. Use Kenyan examples.';
const planSystemPrompt =
  'You are AI Hustler, a Kenyan microbusiness planner. Respond ONLY with JSON: {"overview":"","steps":[],"risks":[],"marketing":"","finances":""}. Steps=5 concise actions, risks=3 strings with mitigations. Keep budgets realistic.';
const financeSystemPrompt =
  'You are AI Hustler, a Kenyan microbusiness finance mentor. Respond ONLY with JSON: {"tips": []}. Each tip under 30 words, practical, covering chamas, float discipline, savings, and inventory tracking. Return 6-8 bullet-level tips.';

async function callLLM({ system, user, temperature }) {
  if (!API_KEY) {
    throw new Error("Missing AI_API_KEY");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": CLIENT_REFERER,
        "X-Title": CLIENT_TITLE,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`AI provider error: ${response.status} ${errBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    return {
      text,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  } catch (error) {
    throw new Error(error.message || "LLM provider unavailable");
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAdvice(payload) {
  const user = `Business Type: ${payload.businessType}
Location: ${payload.location}
Description: ${payload.description}
Goals: ${payload.goals}`;
  const { text, tokensUsed } = await callLLM({
    system: adviceSystemPrompt,
    user,
    temperature: 0.4,
  });

  let advice;
  try {
    advice = JSON.parse(extractJsonPayload(text));
  } catch {
    console.error(
      "[LLM] Advice JSON parse failed. Falling back to heuristics. Raw:",
      text,
    );
    advice = buildAdviceFromText(text);
  }
  return {
    advice: sanitizeAdvice(advice),
    tokensUsed,
  };
}

export async function generatePlan(payload) {
  const user = `Business Type: ${payload.businessType}
Budget: ${payload.budget}
Skills: ${payload.skills}
Timeline: ${payload.timeline}`;
  const { text, tokensUsed } = await callLLM({
    system: planSystemPrompt,
    user,
    temperature: 0.5,
  });

  let plan;
  try {
    plan = JSON.parse(extractJsonPayload(text));
  } catch {
    console.error(
      "[LLM] Plan JSON parse failed. Falling back to heuristics. Raw:",
      text,
    );
    plan = buildPlanFromText(text);
  }
  return {
    plan: sanitizePlan(plan),
    tokensUsed,
  };
}

export async function generateFinanceTips(payload = {}) {
  const user = `Audience: Kenyan microbusiness owners\nFocus: chama savings, float discipline, inventory tracking, daily cash habits.${
    payload.context ? ` Extra context: ${payload.context}` : ""
  }`;
  const { text, tokensUsed } = await callLLM({
    system: financeSystemPrompt,
    user,
    temperature: 0.3,
  });

  let tips;
  try {
    const parsed = JSON.parse(extractJsonPayload(text));
    tips = sanitizeTips(parsed);
  } catch {
    console.error(
      "[LLM] Finance tips JSON parse failed. Falling back to heuristics. Raw:",
      text,
    );
    tips = buildTipsFromText(text);
  }

  return {
    tips,
    tokensUsed,
  };
}

function sanitizeAdvice(advice = {}) {
  return {
    pricing:
      advice.pricing || "Review costs weekly and keep margins above 25%.",
    branding:
      advice.branding ||
      "Keep stall tidy, consistent colors, and branded aprons or reflective vests.",
    competition:
      advice.competition ||
      "Study nearby players, extend hours strategically, and bundle offers.",
    marketing:
      advice.marketing ||
      "Collect contacts, post updates on WhatsApp/Facebook, and reward referrals.",
  };
}

function sanitizePlan(plan = {}) {
  return {
    overview:
      plan.overview ||
      "Build a lean operation that protects cashflow and keeps customers close.",
    steps:
      Array.isArray(plan.steps) && plan.steps.length
        ? plan.steps.slice(0, 6)
        : [
            "Interview target customers to confirm demand.",
            "Track every expense/income daily.",
            "Launch a simple promotion to announce the business.",
            "Review margins weekly and adjust pricing early.",
            "Save 20% of profits toward growth.",
          ],
    risks:
      Array.isArray(plan.risks) && plan.risks.length
        ? plan.risks.slice(0, 3)
        : [
            "Low sales - add complementary products quickly.",
            "Supplier delays - keep two backups and emergency float.",
            "Cash leaks - separate personal and business spending.",
          ],
    marketing:
      plan.marketing ||
      "Leverage community groups, WhatsApp broadcasts, and neat signage to stay visible.",
    finances:
      plan.finances ||
      "Keep at least 30% of capital as float, budget weekly, and reinvest profits consistently.",
  };
}

export default {
  generateAdvice,
  generatePlan,
  generateFinanceTips,
};

function buildAdviceFromText(text = "") {
  const sections = {
    pricing: "",
    branding: "",
    competition: "",
    marketing: "",
  };

  const jsonPricing = extractJsonStringField(text, "pricing");
  const jsonBranding = extractJsonStringField(text, "branding");
  const jsonCompetition = extractJsonStringField(text, "competition");
  const jsonMarketing = extractJsonStringField(text, "marketing");
  if (jsonPricing || jsonBranding || jsonCompetition || jsonMarketing) {
    if (jsonPricing) sections.pricing = jsonPricing;
    if (jsonBranding) sections.branding = jsonBranding;
    if (jsonCompetition) sections.competition = jsonCompetition;
    if (jsonMarketing) sections.marketing = jsonMarketing;
    return sections;
  }

  const lines = text.split(/\r?\n/);
  let currentKey = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(
      /^(Pricing|Branding|Competition|Marketing)\s*:?\s*(.*)$/i,
    );
    if (match) {
      currentKey = match[1].toLowerCase();
      sections[currentKey] = match[2].trim();
      continue;
    }

    if (currentKey) {
      sections[currentKey] = `${sections[currentKey]} ${line}`.trim();
    }
  }

  const hasContent = Object.values(sections).some((value) => value);
  if (!hasContent) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    ["pricing", "branding", "competition", "marketing"].forEach(
      (key, index) => {
        sections[key] = paragraphs[index] || text.trim();
      },
    );
  }

  return sections;
}

function buildPlanFromText(text = "") {
  const sections = {
    overview: "",
    steps: [],
    risks: [],
    marketing: "",
    finances: "",
  };

  const assignString = (field) => {
    const value = extractJsonStringField(text, field);
    if (value) {
      sections[field] = value;
    }
  };

  const assignArray = (field) => {
    const value = extractJsonArrayField(text, field);
    if (value) {
      sections[field] = value;
    }
  };

  assignString("overview");
  assignString("marketing");
  assignString("finances");
  assignArray("steps");
  assignArray("risks");

  const hasStructuredData =
    sections.overview ||
    sections.marketing ||
    sections.finances ||
    sections.steps.length ||
    sections.risks.length;

  if (hasStructuredData) {
    return sections;
  }

  return buildPlanFromLooseText(text, sections);
}

function extractJsonPayload(text = "") {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    const fenceIndex = trimmed.indexOf("\n");
    if (fenceIndex !== -1) {
      const closingFence = trimmed.lastIndexOf("```");
      if (closingFence > fenceIndex) {
        return trimmed.slice(fenceIndex + 1, closingFence).trim();
      }
    }
  }

  const open = trimmed.indexOf("{");
  const close = trimmed.lastIndexOf("}");
  if (open !== -1 && close !== -1 && close > open) {
    return trimmed.slice(open, close + 1);
  }
  return trimmed;
}

function extractJsonStringField(text, field) {
  const regex = new RegExp(
    `"${field}"\\s*:\\s*"((?:\\\\.|[^"])*)"(?:\\s*,|\\s*})`,
    "i",
  );
  const match = text.match(regex);
  if (match) {
    return match[1].replace(/\\"/g, '"').replace(/\\n/g, " ").trim();
  }
  return "";
}

function extractJsonArrayField(text, field) {
  const regex = new RegExp(
    `"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]\\s*(,|})`,
    "i",
  );
  const match = text.match(regex);
  if (!match) return [];
  try {
    const payload = `[${match[1]}]`.replace(/,\s*$/, "");
    const parsed = JSON.parse(payload);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // swallow
  }
  return [];
}

function buildPlanFromLooseText(text, sections) {
  const result = { ...sections };
  const lines = text.split(/\r?\n/);
  let currentKey = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(
      /^(Overview|Steps?|Risks?|Marketing|Finances?)\s*:?\s*(.*)$/i,
    );
    if (match) {
      const label = match[1].toLowerCase();
      if (label.startsWith("step")) currentKey = "steps";
      else if (label.startsWith("risk")) currentKey = "risks";
      else if (label.startsWith("finance")) currentKey = "finances";
      else currentKey = label;

      const remainder = match[2].trim();
      if (currentKey === "steps" || currentKey === "risks") {
        if (remainder) {
          result[currentKey].push(remainder);
        }
      } else {
        result[currentKey] = remainder;
      }
      continue;
    }

    if (currentKey === "steps" || currentKey === "risks") {
      const bulletMatch = line.match(/^[-*\d.)]+\s*(.*)$/);
      if (bulletMatch && bulletMatch[1]) {
        result[currentKey].push(bulletMatch[1].trim());
      } else if (line) {
        result[currentKey].push(line);
      }
      continue;
    }

    if (currentKey) {
      result[currentKey] = `${result[currentKey]} ${line}`.trim();
    }
  }

  if (!result.overview) {
    const paragraphs = text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paragraphs.length) {
      result.overview = paragraphs.shift();
      result.steps = paragraphs.slice(0, 5);
    }
  }
  return result;
}

function sanitizeTips(data = {}) {
  if (Array.isArray(data.tips) && data.tips.length) {
    return data.tips.map((tip) => String(tip).trim()).filter(Boolean);
  }
  return [];
}

function buildTipsFromText(text = "") {
  const tips = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line) => {
    const cleaned = line.replace(/^[-*\d.)]+\s*/, "").trim();
    if (cleaned) {
      tips.push(cleaned);
    }
  });
  if (!tips.length) {
    tips.push(text.trim());
  }
  return tips.slice(0, 8);
}
