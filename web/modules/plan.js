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

export function initPlan(container) {
  const ctx = getContext();
  container.innerHTML = `
    <div class="card">
      <header class="card__header">
        <div>
          <h2>${strings.plan.title}</h2>
          <p>${strings.plan.description}</p>
        </div>
      </header>
      <form id="planForm" class="grid">
        <label class="label">
          ${strings.plan.businessTypeLabel}
          <select class="input" name="businessType" required>
            ${BUSINESS_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("")}
          </select>
        </label>
        <label class="label">
          ${strings.plan.budgetLabel}
          <input class="input" type="number" name="budget" min="0" step="100" required placeholder="10000" />
        </label>
        <label class="label">
          ${strings.plan.skillsLabel}
          <textarea class="input" name="skills" rows="3" required placeholder="e.g., baking, customer service, boda license"></textarea>
        </label>
        <label class="label">
          ${strings.plan.timelineLabel}
          <select class="input" name="timeline" required>
            <option value="0-3 months">${strings.plan.timelineOptions.quick}</option>
            <option value="3-6 months">${strings.plan.timelineOptions.steady}</option>
            <option value="6-12 months">${strings.plan.timelineOptions.expand}</option>
          </select>
        </label>
        <button class="btn" type="submit">${strings.plan.submitLabel}</button>
      </form>
    </div>
    <div class="card" id="planResult">
      <h3>${strings.plan.planHeading}</h3>
      <div id="planDetails">
        <p>${strings.plan.emptyState}</p>
      </div>
    </div>
  `;

  const form = container.querySelector("#planForm");
  const details = container.querySelector("#planDetails");
  const submitBtn = form.querySelector('button[type="submit"]');

  function renderPlan(plan) {
    const stepsList = plan.steps.map((step) => `<li>${step}</li>`).join("");
    const risksList = plan.risks.map((risk) => `<li>${risk}</li>`).join("");
    details.innerHTML = `
      <section class="plan-section">
        <h4>${strings.plan.planHeading}</h4>
        <p>${plan.overview}</p>
      </section>
      <section class="plan-section">
        <h4>${strings.plan.stepsHeading}</h4>
        <ol>${stepsList}</ol>
      </section>
      <section class="plan-section">
        <h4>${strings.plan.risksHeading}</h4>
        <ol>${risksList}</ol>
      </section>
      <section class="plan-section">
        <h4>${strings.plan.marketingHeading}</h4>
        <p>${plan.marketing}</p>
      </section>
      <section class="plan-section">
        <h4>${strings.plan.financesHeading}</h4>
        <p>${plan.finances}</p>
      </section>
    `;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.budget = Number(payload.budget);

    submitBtn.disabled = true;
    submitBtn.textContent = "Generating...";
    try {
      const data = await ctx.apiFetch("/api/plan", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      renderPlan(data.plan);
      ctx.notify("Plan ready", "success");
    } catch (error) {
      // handled upstream
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = strings.plan.submitLabel;
    }
  });
}
