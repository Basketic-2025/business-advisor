import { getContext } from "../lib/appContext.js";
import { strings } from "../i18n/en.js";

const BUSINESS_TYPES = [
  "Kiosk / Duka",
  "Boda rider",
  "Mitumba stall",
  "Pastry / bakery",
  "Farming produce",
  "Salon / grooming",
  "Custom services",
];

export function initAdvisor(container) {
  const ctx = getContext();
  container.innerHTML = `
    <div class="card">
      <header class="card__header">
        <div>
          <h2>${strings.advisor.title}</h2>
          <p>${strings.advisor.description}</p>
        </div>
      </header>
      <form id="advisorForm" class="grid">
        <label class="label">
          ${strings.advisor.businessTypeLabel}
          <select class="input" name="businessType" required>
            ${BUSINESS_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("")}
          </select>
        </label>
        <label class="label">
          ${strings.advisor.locationLabel}
          <input class="input" name="location" required placeholder="e.g., Gikomba, Rongai" />
        </label>
        <label class="label">
          ${strings.advisor.descriptionLabel}
          <textarea class="input" name="description" rows="3" required placeholder="${strings.advisor.placeholders.description}"></textarea>
        </label>
        <label class="label">
          ${strings.advisor.goalsLabel}
          <textarea class="input" name="goals" rows="3" required placeholder="${strings.advisor.placeholders.goals}"></textarea>
        </label>
        <button class="btn" type="submit">${strings.advisor.submitLabel}</button>
      </form>
    </div>
    <div class="card" id="advisorResults">
      <h3>${strings.advisor.resultTitle}</h3>
      <div id="advisorCards" class="advice-grid">
        <p>${strings.advisor.emptyState}</p>
      </div>
    </div>
  `;

  const form = container.querySelector("#advisorForm");
  const cards = container.querySelector("#advisorCards");

  function renderAdvice(advice) {
    const sections = [
      { key: "pricing", title: "Pricing" },
      { key: "branding", title: "Branding" },
      { key: "competition", title: "Competition" },
      { key: "marketing", title: "Marketing" },
    ];
    cards.innerHTML = sections
      .map(
        (section) => `
        <article class="advice-card">
          <h4>${section.title}</h4>
          <p>${advice[section.key]}</p>
        </article>
      `,
      )
      .join("");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";
    try {
      const data = await ctx.apiFetch("/api/advice", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      renderAdvice(data.advice);
      ctx.notify("Advice ready", "success");
    } catch (error) {
      // error handled in fetch helper
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = strings.advisor.submitLabel;
    }
  });
}
