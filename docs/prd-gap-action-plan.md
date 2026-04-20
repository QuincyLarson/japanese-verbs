# PRD Gap Action Plan

Audit date: 2026-04-15

This plan compares the current app against [docs/PRD.md](/Users/m/Documents/code/japanese-verbs/docs/PRD.md) and breaks out the remaining work needed to fully align the product with the PRD.

## Current status

Already in place:

- Static Vite + TypeScript app
- Client-side only
- `localStorage` persistence plus JSON import/export
- 1000-verb seed deck
- Curriculum home route
- Study route
- Browse/index route
- Stats route
- Annex placeholder route
- Hash-router fallback for bad paths
- Dark mode support
- Mobile-first responsive layout

Implemented but not fully aligned with the PRD:

- The study loop is now a typed-pronunciation flow with automatic grading and audio replay.
- The PRD default is a reveal/self-grade recognition loop based on English meaning recall.
- The scheduler and state model support many filters, but the UI no longer exposes them in a discoverable way.

## Main gaps against the PRD

### 1. Re-align the default study loop

Priority: P0

PRD expectation:

- Show a conjugated Japanese form
- User recalls the English meaning
- User reveals the answer
- App shows base verb, reading, base English meaning(s), and a compact bullet explanation
- User self-grades with `Again / Hard / Good / Easy`

Current state:

- User types the pronunciation
- The app auto-grades `good` vs `again`
- The review flow no longer uses reveal + self-grade

Work to do:

- Restore a reveal state between prompt and grading
- Bring back the four-grade review controls
- Show multiple English glosses, not only `englishPrimary`
- Render the explanation as an actual compact bullet list
- Keep the current typed-pronunciation flow only if it is moved behind an optional mode

Decision note:

- This is the single biggest product gap.
- If the typed-pronunciation flow is intentional, then the PRD should be updated. If the PRD remains the source of truth, the study loop needs to be rebuilt.

### 2. Restore a real filters / mode picker UI

Priority: P0

PRD expectation:

- Main information architecture includes a filters / mode picker surface
- Required study modes are user-selectable

Current state:

- The data model still supports most required filters
- The UI removed the mode picker from the study route
- There is no dedicated filters screen or route

Work to do:

- Add a dedicated filters / mode picker view or a strong equivalent sheet/panel
- Expose:
  - `New only`
  - `Review only`
  - `Weak items`
  - `Recently missed`
  - `Dictionary only`
  - `て-form only`
  - `Plain core bundle`
  - `Derived bundle`
  - `Custom multi-select`
  - `Due + new`
  - `Due only`
  - `Burned hidden`
  - `Burned only`
- Add a true leech-like trouble-items mode instead of relying only on generic weakness scoring
- Make filtered sessions deep-linkable and easy to restart

### 3. Finish the PRD progress model in Stats

Priority: P1

PRD expectation:

- Track and surface:
  - total verbs introduced
  - total burned
  - current streak
  - accuracy by form family
  - weakest endings for て-form drills
  - weakest conjugation families overall

Current state:

- Introduced, burned, accuracy, and streak are shown
- Weakest verbs are shown
- The library already computes form-family stats and て-pattern stats
- The UI does not render those deeper weakness views

Work to do:

- Add a conjugation-family accuracy section
- Add a weakest て-form ending/pattern section
- Add a weakest conjugation family summary ranked by mistakes / low accuracy
- Keep the page compact, but make weak-pattern surfacing explicit

### 4. Complete the browse/detail experience

Priority: P1

PRD expectation:

- Each verb detail card/page should show:
  - written form
  - reading
  - base meaning(s)
  - class
  - transitivity
  - all enabled forms
  - alternate readings if any

Current state:

- The popover shows the base item, class, transitivity, partial gloss info, and sample forms
- It only previews a subset of forms
- It only surfaces a limited alternate-reading summary

Work to do:

- Expand the popover or add a detail drawer/page
- Show all English glosses cleanly
- Show the full alternate-reading list
- Show all enabled surface forms, not just labels plus a short sample

### 5. Tighten PRD/spec consistency

Priority: P1

PRD expectation:

- V1 excludes audio
- The product stance is a recognition engine, not a pronunciation trainer

Current state:

- The app now includes speech synthesis and typed-reading interaction

Work to do:

- Decide whether to:
  - keep these features and update the PRD, or
  - remove/demote them to stay strict with the PRD
- Align README and docs once that decision is made

## Lower-priority nice-to-have gaps

Priority: P2

From the PRD nice-to-have list:

- fuzzy typed-English mode
- saved custom study presets
- tiny sparkline-like summaries
- per-ending て-form drill stats presentation

Recommendation:

- Only do these after the P0 and P1 product-alignment work is complete.

## Suggested implementation order

### Phase 1. Product alignment decision

Goal:

- Decide whether the PRD is still the source of truth for the study loop

Deliverables:

- Short written decision in docs
- Either:
  - keep current typed-pronunciation flow and revise the PRD, or
  - restore reveal/self-grade as the default and move typing behind an optional mode

### Phase 2. Study loop rebuild

Goal:

- Match the PRD default review loop

Deliverables:

- Reveal step
- `Again / Hard / Good / Easy`
- bullet-style explanation block
- multi-gloss answer display
- tests for the new study state machine

### Phase 3. Filters and mode picker

Goal:

- Make the required study modes usable from the UI

Deliverables:

- filters route or modal
- discoverable pool/filter controls
- leech-like trouble mode
- deep-link support for common modes like `て-form only`

### Phase 4. Stats and browse completeness

Goal:

- Finish the PRD reporting and browse-detail requirements

Deliverables:

- form-family stats UI
- て-pattern weakness UI
- expanded browse detail view with all enabled forms and alternate readings

### Phase 5. Final alignment pass

Goal:

- Close documentation and QA gaps

Deliverables:

- README refresh
- PRD consistency check
- test pass over routing, study flow, filters, stats, and import/export

## Recommended next move

If the goal is strict PRD alignment, start with Phase 1 and Phase 2 first. The current app is closest to complete on infrastructure and farthest from the PRD on the actual review loop.
