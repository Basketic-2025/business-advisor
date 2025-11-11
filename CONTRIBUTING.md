# Contributing

## Branching

- Use `feat/<description>` for features and `fix/<description>` for bug fixes.

## Commits & PRs

- Follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
- Each PR must include the self-review checklist from `PLANNING.md`.
- Keep PRs under ~300 lines when possible for quick reviews.

## Code Style

- Run `npm run lint` (Prettier) before pushing.
- Respect `.editorconfig` defaults for spacing and line endings.
- Favor small, pure modules; no global browser variables without namespacing.

## Testing & QA

- Add or update tests adjacent to the code they cover.
- Provide manual test evidence (screenshots or notes) for UI-intensive changes.
