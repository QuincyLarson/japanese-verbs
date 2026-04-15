# Progress

## Notes

- `content/chapters/` is not present in this repository.
- `docs/code-review.md` is not present in this repository and will be created during the review milestone.
- Implementation is following the repo's actual product docs for the Japanese verb trainer.
- The requested chapter-specific milestones were translated into product milestones because the repo contains verb-study docs and seed data rather than chapter outline content.

## Milestones

- [x] 1. Scaffold the app and toolchain
- [x] 2. Add design tokens and the overview home page
- [x] 3. Implement local progress persistence
- [x] 4. Build the reusable lab shell and constrained workspace
- [x] 5. Implement the review flow, browse view, stats view, and settings controls
- [x] 6. Scaffold the remaining product routes, including the annex placeholder
- [x] 7. Add more tests, accessibility improvements, and polish
- [x] 8. Run checks and self-review against `docs/code-review.md`

## Intended Commit Messages

- `chore: bootstrap verb trainer app`
- `feat: add overview home and design system`
- `feat: add local progress and review workspace`
- `test: add review checklist and polish`

## Session Log

- 2026-04-15: Completed the Vite + React + TypeScript bootstrap, added a routed shell, installed dependencies, and verified `npm run build` and `npm run test:run`.
- 2026-04-15: Added the block-style design system, active navigation, and a compact curriculum overview home route with study-track entry points.
- 2026-04-15: Implemented async catalog loading, localStorage-backed progress/settings, deterministic study scheduling, the reveal/self-grade loop, JSON import/export, browse, and stats routes.
- 2026-04-15: Added unit coverage for persistence and scheduling, tightened interactive accessibility, created `docs/code-review.md`, and reran the final checks.
- 2026-04-15: Reworked the UI toward the cleaner `mandarin-idioms` shell: narrow column, sticky utility nav, light neutral palette, flatter panels, and a less promotional overview layout.
