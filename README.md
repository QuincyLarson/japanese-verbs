# Japanese Verb App Repo Prep

This folder is a repo-ready prep package for a static Japanese verb recognition app.

## What is included

- `data/top_1000_japanese_verbs_v1.json` — primary seed data for the first 1000 orthographic verbs
- `data/top_1000_japanese_verbs_v1.csv` — flat inspection-friendly export
- `data/form_presets.json` — inflection-mode definitions and English-explanation templates
- `data/selection_manifest.json` — reproducible selection logic and summary stats
- `data/manual_review_candidates.json` — a short list of items worth manual review
- `docs/PRD.md` — product requirements document
- `docs/DATA_SOURCES.md` — source and pipeline notes
- `docs/CONJUGATION_ENGINE.md` — conjugation and explanation rules
- `docs/REPO_PREP.md` — implementation and file-layout guidance
- `AGENTS.md` — build-agent guardrails
- `CODEX_PROMPT.md` — one-shot handoff prompt for Codex
- `scripts/build_verbs_dataset.py` — reproducible local pipeline
- `src/types/verb.ts` and `src/lib/conjugation.ts` — TypeScript scaffolding for the app

## Current dataset shape

- Raw BCCWJ-derived rows inspected: 36396
- Exact modern verb matches: 2607
- After kanji+hiragana and origin filter: 2550
- Final selected unique orthographic verbs: 1000

## Important design choice

V1 tracks mastery by the **written kanji+okurigana item**.  
Inflection mistakes are still recorded, but they only bias future review; they do not create separate SRS cards for every conjugated surface form.
