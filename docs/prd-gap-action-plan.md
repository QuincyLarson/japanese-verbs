# PRD Gap Action Plan

Audit date: 2026-04-20

This file tracks the remaining work against the updated [docs/PRD.md](/Users/m/Documents/code/japanese-verbs/docs/PRD.md), which now reflects the current shipped product direction.

## Current status

There are no major product-spec blockers left caused by the old reveal/self-grade PRD.

The biggest mismatch has been resolved by updating the PRD itself to match the current app:

- typed-pronunciation default loop
- curriculum-first home route
- compact generated example sentences on reveal
- browser speech synthesis when available
- combined Stats/settings surface

## Remaining pre-ship work

### 1. Refresh README

Priority: P1

`README.md` still reads like repo-prep scaffolding rather than the current app.

Remaining work:

- rewrite `README.md` around the actual shipped product
- document the current routes, lesson model, local persistence, and speech behavior

### 2. Final QA pass

Priority: P1

Do one last manual regression sweep against the updated PRD.

Recommended checklist:

- direct lesson URLs work on reload
- curriculum completion return flow behaves correctly
- localStorage persistence survives refresh and remount
- lesson layout remains usable on narrow screens with the keyboard visible
- speech replay degrades gracefully on browsers with poor or missing voice support

### 3. Optional documentation cleanup

Priority: P2

Some older internal docs still mention the earlier reveal/self-grade shape.

Remaining work:

- refresh any remaining stale references in ancillary docs
- update internal review checklists if they continue to cite the old loop

## Recommendation

Treat the updated PRD as the source of truth.

The remaining work is now mostly documentation cleanup and final QA, not a product-direction decision.
