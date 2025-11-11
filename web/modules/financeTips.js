import { getContext } from "../lib/appContext.js";
import { strings } from "../i18n/en.js";

const CACHE_KEY = "financeTipsCache";

function loadCache() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function persistCache(payload) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function initFinanceTips(container) {
  const ctx = getContext();
  container.innerHTML = `
    <div class="card">
      <header class="card__header">
        <div>
          <h2>${strings.finance.title}</h2>
          <p>${strings.finance.description}</p>
        </div>
        <button class="btn btn--ghost" type="button" data-refresh>${strings.finance.refresh}</button>
      </header>
      <ol class="tips-list" id="tipsList" aria-live="polite"></ol>
    </div>
  `;

  const listEl = container.querySelector("#tipsList");
  const refreshBtn = container.querySelector("[data-refresh]");

  function renderTips(tips) {
    if (!tips || !tips.length) {
      listEl.innerHTML = `<li>${strings.finance.empty}</li>`;
      return;
    }
    listEl.innerHTML = tips.map((tip) => `<li>${tip}</li>`).join("");
  }

  async function loadTips(showToast = false) {
    refreshBtn.disabled = true;
    try {
      const data = await ctx.apiFetch("/api/finance-tips");
      persistCache(data);
      renderTips(data.tips);
      if (showToast) ctx.notify("Finance tips updated", "success");
    } catch (error) {
      const cached = loadCache();
      if (cached) {
        renderTips(cached.tips);
        ctx.notify(strings.finance.error, "info");
      } else {
        renderTips([]);
      }
    } finally {
      refreshBtn.disabled = false;
    }
  }

  refreshBtn.addEventListener("click", () => loadTips(true));

  const cached = loadCache();
  if (cached) {
    renderTips(cached.tips);
  } else {
    listEl.innerHTML = `<li>${strings.loading}</li>`;
  }
  loadTips(false);
}
