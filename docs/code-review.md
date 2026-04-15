# Code Review

## Checklist

- App boots as a static Vite + React + TypeScript client.
- Home route is a compact curriculum overview rather than a landing page.
- Progress and study settings persist through localStorage only.
- Scheduler behavior is deterministic and inspectable.
- Review loop follows reveal then self-grade.
- Browse, stats, settings, and annex routes are present.
- JSON import/export exists for local progress portability.
- Build and tests run cleanly.

## Self-review

- Result: no blocking findings after the final review pass.
- Checks run:
  - `npm run build`
  - `npm run test:run`
- Accessibility pass:
  - interactive filter chips expose pressed state
  - import/export feedback is announced through a live status region
  - search and file import controls use explicit labels
- Residual risks:
  - there is no browser-level e2e coverage yet
  - the seed JSON asset is large, although it now loads as a static asset rather than inflating the main JS bundle
