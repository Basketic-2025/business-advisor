# Planning

## Build Process (Strict)

1. **Requirements ? User Stories ? Acceptance Criteria**
   - Translate brief into concrete personas (kiosk, boda, mitumba, pastries, farming) and write user stories with done conditions.
2. **High-Level Design**
   - Define API contracts, request/response schemas, DB tables, and module boundaries in ADR-style notes before coding.
3. **Skeleton Repo + CI Checks**
   - Initialize npm project, linting scripts, folder structure, service worker registration, and sample test hooks.
4. **Feature Implementation Loop**
   - Draft plan for the specific feature (tasks, risks, data flow).
   - Create/extend tests (unit, integration, or mocked route tests) before implementation when applicable.
   - Implement feature, keeping commits scoped.
   - Run the self-review checklist (below) before marking done.
5. **Manual Test Script & Screenshots**
   - Execute scenarios in `tests/manual/DEMO_SCRIPT.md`, capture screenshots for README placeholders, and log results.

## Self-Review Checklist

- No global CSS leaks; use BEM-ish or utility classes only.
- All inputs have visible labels, aria attributes, and validation.
- Every endpoint includes error handling plus 400/500 tests with mocked DB.
- No blocking `await` calls inside Express request cycles (use parallelism/promise.all where safe).
- SQLite statements are parameterized and migrations remain idempotent.
- Lighthouse performance = 95 on desktop (Chrome) for key screens.
