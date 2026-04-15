You are building a static Vite + TypeScript app for Japanese verb recognition practice.

Read these files first:
- AGENTS.md
- docs/PRD.md
- docs/DATA_SOURCES.md
- docs/CONJUGATION_ENGINE.md
- docs/REPO_PREP.md

Then use these data files:
- data/top_1000_japanese_verbs_v1.json
- data/form_presets.json
- data/selection_manifest.json

Constraints:
- static site only
- localStorage only
- no backend
- no auth in V1
- mobile-first
- freeCodeCamp-style simplicity
- GitHub Pages deployable
- V1 core excludes all noun+する verbs

Most important product rule:
Track mastery at the written-verb level, not at the per-surface-form level.
Inflections should bias scheduling, but they should not become separate primary cards.

Primary study loop:
- show one Japanese verb form
- user thinks of the English meaning
- reveal answer
- show base verb + reading + meaning + bullet explanation of the inflection
- self-grade Again / Hard / Good / Easy

Required filters:
- dictionary only
- て-form only
- mixed core inflections
- custom inflection filter
- new / review / mixed
- weak items

Implementation goals:
1. Create a clean study card UI
2. Create a deterministic scheduler
3. Persist progress/settings to localStorage
4. Create browse/stats/settings views
5. Make the app usable immediately with the included dataset

Use the provided precomputed forms as the source of truth for irregular verbs.
