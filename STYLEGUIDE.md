# Style Guide

## JavaScript

- Use ES Modules everywhere (`export`/`import`).
- Keep files under ~200 lines; split helpers into `/web/modules/` or `/server/utils/` if they grow.
- Avoid implicit globals; wrap immediate logic in functions and export init hooks.

## Directory & Naming

- Use lowercase-kebab for folders (`web/modules`, `server/routes`).
- File names mirror their exports (e.g., `advisor.js` exports `initAdvisor`).
- Place shared strings in `web/i18n/en.js` and import them instead of hardcoding.

## CSS

- Mobile-first layout; create utility classes (`.grid`, `.card`, `.btn`) and compose them.
- No global element overrides except base typography/body resets.
- Follow BEM-like naming for components (e.g., `.tab-list`, `.tab-list__item`).
- Provide high-contrast colors, 44px tap targets, and visible focus states.

## Accessibility & UX

- Always pair inputs with `<label>` and `aria-*` descriptions.
- Use semantic HTML5 sections (`<main>`, `<nav>`, `<section>`).
- Provide keyboard navigation for tabs and buttons; rely on `:focus-visible`.
