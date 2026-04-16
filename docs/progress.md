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
- 2026-04-15: Added a persisted day/night theme switch modeled on `learn-cantonese` and shifted the shell toward that warmer light palette and softer dark mode.
- 2026-04-15: Rebuilt the home route into a Cantonese-style curriculum sequence and replaced the old browse list with a full compact index of all verbs using Mandarin-Idioms-style hover and pinned popovers.
- 2026-04-15: Simplified the shell again by renaming the brand to `JapaneseVerbs.com`, moving settings into the stats route, clarifying burned items, stripping extra explanatory copy, adding a reset confirmation modal, and switching the navbar to a single active underline state.
- 2026-04-15: Simplified the flash-card route by removing the Home nav item, renaming `Study` to `Flash cards`, deleting the extra study-page intro copy, and replacing the old sidebar filters with compact dropdown controls beneath the card.
- 2026-04-15: Trimmed the index header down to a single search field and added romaji-aware verb search so queries like `yomu` match kana readings without adding a new dependency.
- 2026-04-15: Removed the redundant revealed-answer summary tiles from the flash-card page so the answer view only shows the explanation list and grading controls.
- 2026-04-15: Reworked the flash-card interaction to use typed reading input, collapsed grading to `I know it` and `I don't know it`, and added interval feedback after each review with lightweight hiragana/romaji answer matching.
- 2026-04-15: Switched the main lesson route to an adaptive typed-answer flow with `Submit [enter]`, `Next verb [enter]`, automatic correctness grading from the typed pronunciation, voice synthesis on submit with a `Hear again` control, and randomized top-window card selection with starter bias so new sessions begin on more useful print-first verbs.
- 2026-04-15: Rebuilt the home route into 10-card curriculum sections driven by shared curriculum ordering, renamed the main nav action to `Next verb`, and added completed and skipped section states with check and curved-arrow status icons.
- 2026-04-15: Restored direct curriculum jumping by making each section on the home view link into `/study?section=n`, and taught the adaptive study route to scope its queue to the selected section when that parameter is present.
- 2026-04-15: Aligned the shell and lesson input more closely to freeCodeCamp styling by switching to a Lato + Hack-ZeroSlash stack, updating the core gray/yellow/navy token palette, matching hotkey label color to button text, and hiding the pronunciation helper after the first 10 reviews so later sessions show only the centered input cursor.
- 2026-04-15: Moved the interval feedback line into the revealed action row between `Hear again` and `Next verb`, forced that feedback block to stay centered independently of neighboring buttons, and shortened the onboarding helper so it only appears for the first few reviews.
- 2026-04-15: Replaced the naive speech hook with platform-aware Japanese voice selection that waits for `speechSynthesis.getVoices()`, ranks Apple/Google/Microsoft Japanese voices by browser platform, and falls back cleanly when the voice list arrives late on first use.
- 2026-04-15: Flattened the flash-card screen by removing the extra nested box treatment, removed the divider under the navbar, and normalized the button labels so `Submit [enter]` and `Next verb [enter]` render as single uniform button strings.
- 2026-04-15: Tweaked the success feedback copy to `You'll see this again ...` and made browser speech more reliable by prewarming and caching the best Japanese voice before submit, so playback does not depend on an async first-call `voiceschanged` path.
- 2026-04-15: Added a catch-all route redirect back to `/` so bad hash paths degrade to the curriculum view instead of rendering a blank screen, and covered that behavior in the router test.
- 2026-04-15: Added a `Hear again [space]` replay hotkey on revealed cards, removed the initial false disabled state from the replay control so supported browsers do not render it as muted on first reveal, and covered the keyboard replay path in a focused study-page test.
- 2026-04-15: Tightened the revealed study-card layout for short laptop viewports by collapsing the post-submit verb block, reducing answer/action spacing, and adding a low-height media pass so the review state stays above the fold more reliably on an 11-inch MacBook Air-sized Chrome window.
