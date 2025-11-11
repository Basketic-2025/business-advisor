import { strings } from "./i18n/en.js";
import { setContext } from "./lib/appContext.js";
import { initAdvisor } from "./modules/advisor.js";
import { initPlan } from "./modules/plan.js";
import { initFinanceTips } from "./modules/financeTips.js";
import { initCashflow } from "./modules/cashflow.js";
import { bindTabTriggers } from "./modules/tabs.js";

const tabInits = {
  advisor: initAdvisor,
  plan: initPlan,
  tips: initFinanceTips,
  cashflow: initCashflow,
};

const initializedTabs = new Set();
const toastContainer = document.createElement("div");
toastContainer.className = "toast-stack";
document.body.append(toastContainer);

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

async function apiFetch(path, options = {}) {
  const config = {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  };

  try {
    const response = await fetch(path, config);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.error || `Request failed (${response.status})`;
      throw new Error(message);
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    notify(error.message || "Network error", "error");
    throw error;
  }
}

function notify(message, variant = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.textContent = message;
  toastContainer.append(toast);
  setTimeout(() => {
    toast.classList.add("toast--hide");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function formatKES(cents) {
  if (Number.isNaN(cents)) return "KES 0.00";
  return currencyFormatter.format(cents / 100);
}

setContext({ apiFetch, notify, formatKES });

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      notify("Service worker registration failed", "error");
    });
  });

  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data || {};
    if (data.type === "notify" && data.message) {
      notify(data.message, data.variant || "info");
    }
  });
}

function setActiveTab(target) {
  const tabName = target.dataset.tab;
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    const isActive = btn === target;
    btn.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    const isMatch = panel.dataset.tabPanel === tabName;
    panel.hidden = !isMatch;
  });

  if (!initializedTabs.has(tabName)) {
    const panel = document.querySelector(`[data-tab-panel="${tabName}"]`);
    const initFn = tabInits[tabName];
    if (initFn && panel) {
      initFn(panel);
      initializedTabs.add(tabName);
    }
  }
}

function updateOfflineBadge() {
  const badge = document.getElementById("offlineBadge");
  if (!badge) return;
  if (navigator.onLine) {
    badge.textContent = strings.online;
    badge.classList.remove("badge--offline");
    badge.classList.add("badge--online");
    badge.style.display = "inline-flex";
  } else {
    badge.textContent = strings.offline;
    badge.classList.remove("badge--online");
    badge.classList.add("badge--offline");
    badge.style.display = "inline-flex";
  }
}

window.addEventListener("online", updateOfflineBadge);
window.addEventListener("offline", updateOfflineBadge);

document.addEventListener("DOMContentLoaded", () => {
  const defaultTab = document.querySelector("[data-tab]");
  if (defaultTab) {
    setActiveTab(defaultTab);
  }
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn));
  });
  updateOfflineBadge();
  bindTabTriggers();
});

registerServiceWorker();
