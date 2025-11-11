import { getContext } from "../lib/appContext.js";
import { strings } from "../i18n/en.js";

const CATEGORIES = [
  "mitumba stock",
  "flour",
  "fuel",
  "airtime",
  "rent",
  "savings",
  "transport",
  "other",
];
const QUEUE_KEY = "cashflowQueue";
const CACHE_KEY = "cashflowCache";
let queueListenerAttached = false;
let syncListenerAttached = false;

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function loadQueue() {
  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

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

export function initCashflow(container) {
  const ctx = getContext();
  const state = {
    range: "day",
    entries: [],
    summary: { income: 0, expense: 0, balance: 0 },
    queue: loadQueue(),
    syncing: false,
  };

  container.innerHTML = `
    <div class="card cashflow-card">
      <header class="card__header">
        <div>
          <h2>${strings.cashflow.title}</h2>
          <p>${strings.cashflow.description}</p>
        </div>
        <div class="queue-indicator" data-queue-status></div>
      </header>
      <form id="cashflowForm" class="form-grid">
        <label class="label">
          ${strings.cashflow.typeLabel}
          <select class="input" name="type" required>
            <option value="income">${strings.cashflow.typeOptions.income}</option>
            <option value="expense">${strings.cashflow.typeOptions.expense}</option>
          </select>
        </label>
        <label class="label">
          ${strings.cashflow.amountLabel}
          <input class="input" type="number" name="amount" step="0.01" min="0" required />
        </label>
        <label class="label">
          ${strings.cashflow.categoryLabel}
          <select class="input" name="category" required>
            ${CATEGORIES.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
          </select>
        </label>
        <label class="label">
          ${strings.cashflow.noteLabel}
          <input class="input" type="text" name="note" maxlength="280" placeholder="Optional detail" />
        </label>
        <label class="label">
          ${strings.cashflow.dateLabel}
          <input class="input" type="datetime-local" name="ts" />
        </label>
        <button class="btn" type="submit">${strings.cashflow.submitLabel}</button>
      </form>
    </div>

    <div class="card">
      <div class="range-toggle" role="group" aria-label="${strings.cashflow.rangeTitle}">
        ${["day", "week", "month"]
          .map(
            (key) => `
              <button class="pill" data-range="${key}" aria-pressed="${key === "day"}">
                ${strings.cashflow.ranges[key]}
              </button>
            `,
          )
          .join("")}
      </div>
      <div class="summary-grid">
        <div class="summary-card" data-summary="income">
          <p class="summary-label">${strings.cashflow.summary.income}</p>
          <p class="summary-value" id="summaryIncome">KES 0.00</p>
        </div>
        <div class="summary-card" data-summary="expense">
          <p class="summary-label">${strings.cashflow.summary.expense}</p>
          <p class="summary-value" id="summaryExpense">KES 0.00</p>
        </div>
        <div class="summary-card" data-summary="balance">
          <p class="summary-label">${strings.cashflow.summary.balance}</p>
          <p class="summary-value" id="summaryBalance">KES 0.00</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-header">
        <h3>${strings.cashflow.tableTitle}</h3>
      </div>
      <div class="table-wrapper">
        <table class="table" aria-live="polite">
          <thead>
            <tr>
              <th>${strings.cashflow.tableHeaders.amount}</th>
              <th>${strings.cashflow.tableHeaders.category}</th>
              <th>${strings.cashflow.tableHeaders.note}</th>
              <th>${strings.cashflow.tableHeaders.date}</th>
              <th>${strings.cashflow.tableHeaders.actions}</th>
            </tr>
          </thead>
          <tbody id="cashflowTableBody">
            <tr><td colspan="5">${strings.cashflow.emptyState}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const form = container.querySelector("#cashflowForm");
  const rangeButtons = container.querySelectorAll("[data-range]");
  const queueStatusEl = container.querySelector("[data-queue-status]");
  const summaryEls = {
    income: container.querySelector("#summaryIncome"),
    expense: container.querySelector("#summaryExpense"),
    balance: container.querySelector("#summaryBalance"),
  };
  const tableBody = container.querySelector("#cashflowTableBody");

  function updateSummary() {
    summaryEls.income.textContent = ctx.formatKES(state.summary.income);
    summaryEls.expense.textContent = ctx.formatKES(state.summary.expense);
    summaryEls.balance.textContent = ctx.formatKES(state.summary.balance);
  }

  function updateTable() {
    if (!state.entries.length) {
      tableBody.innerHTML = `<tr><td colspan="5">${strings.cashflow.emptyState}</td></tr>`;
      return;
    }
    tableBody.innerHTML = state.entries
      .map(
        (entry) => `
        <tr data-row-id="${entry.id}">
          <td>${ctx.formatKES(entry.amount)}</td>
          <td>${entry.category}</td>
          <td>${entry.note || "-"}</td>
          <td>${dateFormatter.format(new Date(entry.ts))}</td>
          <td>
            <button class="btn btn--ghost" type="button" data-delete="${entry.id}">
              ${strings.cashflow.deleteLabel}
            </button>
          </td>
        </tr>
      `,
      )
      .join("");
  }

  function applyLocalEntry(entry) {
    const localEntry = {
      ...entry,
      id: `local-${entry.ts}`,
    };
    state.entries = [localEntry, ...state.entries];
    if (entry.type === "income") {
      state.summary.income += entry.amount;
    } else {
      state.summary.expense += entry.amount;
    }
    state.summary.balance = state.summary.income - state.summary.expense;
    updateSummary();
    updateTable();
  }

  function updateQueueStatus(message) {
    if (message) {
      queueStatusEl.textContent = message;
      return;
    }
    if (state.syncing) {
      queueStatusEl.textContent = strings.cashflow.queueStatus.syncing;
    } else if (state.queue.length) {
      queueStatusEl.textContent = strings.cashflow.queueStatus.pending(
        state.queue.length,
      );
    } else {
      queueStatusEl.textContent = "";
    }
  }

  async function fetchRange(range = state.range) {
    try {
      const data = await ctx.apiFetch(`/api/cashflow?range=${range}`);
      state.range = range;
      state.entries = data.entries;
      state.summary = data.summary;
      persistCache({ range, ...data });
      updateSummary();
      updateTable();
    } catch (error) {
      const cached = loadCache();
      if (cached && cached.range === range) {
        state.entries = cached.entries;
        state.summary = cached.summary;
        updateSummary();
        updateTable();
      }
    }
  }

  function addToQueue(entry) {
    state.queue.push(entry);
    persistQueue(state.queue);
    updateQueueStatus();
    registerBackgroundSync();
  }

  async function flushQueue() {
    if (!state.queue.length || !navigator.onLine) {
      updateQueueStatus();
      return;
    }
    state.syncing = true;
    updateQueueStatus();
    while (state.queue.length) {
      const entry = state.queue[0];
      try {
        await ctx.apiFetch("/api/cashflow", {
          method: "POST",
          body: JSON.stringify(entry),
        });
        state.queue.shift();
        persistQueue(state.queue);
      } catch (error) {
        state.syncing = false;
        updateQueueStatus(strings.cashflow.syncError);
        return;
      }
    }
    state.syncing = false;
    updateQueueStatus(strings.cashflow.queueStatus.complete);
    setTimeout(() => updateQueueStatus(), 3000);
    fetchRange(state.range);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);
    const type = formData.get("type");
    const amountValue = parseFloat(formData.get("amount") || "0");
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      ctx.notify("Enter a valid amount", "error");
      return;
    }

    const entry = {
      type,
      amount: Math.round(amountValue * 100),
      category: formData.get("category"),
      note: formData.get("note"),
      ts: formData.get("ts")
        ? new Date(formData.get("ts")).getTime()
        : Date.now(),
    };

    if (!navigator.onLine) {
      addToQueue(entry);
      ctx.notify(strings.cashflow.offlineQueued, "info");
      form.reset();
      applyLocalEntry(entry);
      return;
    }

    try {
      await ctx.apiFetch("/api/cashflow", {
        method: "POST",
        body: JSON.stringify(entry),
      });
      ctx.notify(strings.cashflow.saved, "success");
      form.reset();
      fetchRange(state.range);
    } catch (error) {
      addToQueue(entry);
      ctx.notify(strings.cashflow.offlineQueued, "info");
      applyLocalEntry(entry);
    }
  }

  async function handleDelete(id) {
    if (!navigator.onLine) {
      ctx.notify(strings.cashflow.deleteOfflineBlocked, "error");
      return;
    }
    try {
      await ctx.apiFetch(`/api/cashflow/${id}`, { method: "DELETE" });
      ctx.notify(strings.cashflow.deleted, "success");
      fetchRange(state.range);
    } catch (error) {
      // error toast already handled by apiFetch
    }
  }

  form.addEventListener("submit", handleSubmit);

  rangeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const range = btn.dataset.range;
      rangeButtons.forEach((el) =>
        el.setAttribute("aria-pressed", String(el === btn)),
      );
      fetchRange(range);
    });
  });

  tableBody.addEventListener("click", (event) => {
    const target = event.target.closest("[data-delete]");
    if (target) {
      const id = target.dataset.delete;
      handleDelete(id);
    }
  });

  async function registerBackgroundSync() {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("cashflow-sync");
    } catch (error) {
      // Sync not available; ignore.
    }
  }

  function attachSyncListener() {
    if (syncListenerAttached || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "cashflow-sync") {
        flushQueue();
      }
    });
    syncListenerAttached = true;
  }

  updateQueueStatus();
  fetchRange("day");
  flushQueue();
  attachSyncListener();

  if (!queueListenerAttached) {
    window.addEventListener("online", () => flushQueue());
    queueListenerAttached = true;
  }
}
