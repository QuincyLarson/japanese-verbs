# PRD Gap Action Plan

Audit date: 2026-04-19

This file tracks the remaining MVP work compared with [docs/PRD.md](/Users/m/Documents/code/japanese-verbs/docs/PRD.md), based on the current codebase and the later product-direction changes already made in the app.

## Already aligned enough for MVP

- Static Vite + TypeScript client
- Local-only persistence with JSON import/export
- 1000-verb seed deck
- Curriculum home route
- Study route
- Stats route
- Browse/index route
- Annex placeholder route
- Clean browser routing with direct deep-link fallback
- Dark mode support
- Mobile-first responsive shell
- Weak-pattern surfacing in Stats
- Browse popover with full glosses, alternate readings, and enabled forms
- Discoverable study-modes surface in Stats
- Trouble-items study mode

## Remaining MVP tasks

### 1. Resolve the study-loop spec mismatch

Priority: P0

The current app uses a typed-pronunciation flow with automatic correctness checks. The PRD still describes a reveal-and-self-grade recognition loop based on recalling English meaning.

Remaining work:

- Decide whether the PRD should be updated to match the shipped typed-pronunciation direction, or whether the app should restore the PRD loop as the default.
- If the current interaction stays, document the change clearly in `README.md` and `docs/PRD.md`.
- If the PRD stays authoritative, rebuild the study loop to support:
  - reveal step
  - `Again / Hard / Good / Easy`
  - bullet-style explanation block
  - multi-gloss answer display

### 2. Complete documentation consistency

Priority: P1

The implementation has moved away from parts of the original PRD.

Remaining work:

- Refresh `README.md` to match the current product behavior.
- Refresh `docs/PRD.md` if the typed-pronunciation study loop remains the intended MVP.
- Re-run a final PRD consistency pass after the study-loop decision is made.

## Work completed in this pass

- Added weak conjugation-family reporting to Stats
- Added weakest て-form pattern reporting to Stats
- Expanded the Index popover to show full glosses, full alternate readings, and all enabled forms
- Added a discoverable study-modes panel to Stats
- Added a deterministic trouble-items study mode to the scheduler and mode picker

## Recommended next move

Resolve the study-loop/spec mismatch next. That is now the single largest remaining MVP gap against the PRD.
