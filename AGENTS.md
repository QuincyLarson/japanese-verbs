# AGENTS.md

## Build target

Build a static Vite + TypeScript application for Japanese verb recognition practice.
Use localStorage only in V1. No backend. No auth in V1. No monetization logic in V1.

## Product intent

This app is a narrow tool, not a general Japanese course.

It should help B1+ learners recognize high-frequency Japanese verbs in writing by exposing them to many conjugated forms of the same core verb.

The V1 core deck excludes noun-plus-する verbs. Those can become a later annex/reference page.

## Core study model

Track mastery at the orthographic verb level, not at the individual inflected-form level.

Example:
- tracked item: `食べる`
- review surfaces can include `食べる`, `食べて`, `食べない`, `食べさせられる`, etc.

Store:
- per-verb SRS state
- per-form-family error counters so the scheduler can bias toward weak patterns without creating separate cards

## Quiz flow

Default flow should be:
1. show Japanese form
2. user thinks of the English meaning
3. reveal answer
4. show the base verb, reading, base meaning, and a bullet list explaining the inflection
5. user self-grades: Again / Hard / Good / Easy

A typed-English mode is optional. If implemented, it must be relaxed and forgiving.

## UX rules

- Visual style should feel aligned with freeCodeCamp's current design language
- Keep layout simple and mobile-first
- Avoid clutter
- Use clear typography, generous spacing, and obvious primary actions
- Favor cards, pills, segmented controls, and compact stats
- Explanation of the conjugation should be a short bullet list, not badge spam

## Modes required for V1

- Endless mixed review
- Dictionary form only
- て-form only
- Core inflections only
- Custom inflection filters
- New-only / review-only / mixed
- Burned / weak / recent mistake filters

## Data rules

- Use `data/top_1000_japanese_verbs_v1.json` as the initial seed
- Prefer precomputed forms over naive runtime generation for irregulars
- Preserve alternate readings metadata even if V1 only surfaces the primary reading
- Never add する verbs to the core deck

## Non-goals for V1

- sentence mining
- audio
- login
- cloud sync
- donations
- leaderboards
- JLPT mode based on unofficial tags

## Engineering rules

- Strong typing everywhere
- Small pure utility functions
- No heavyweight state manager unless needed
- Keep data loading simple
- Make the scheduler deterministic and debuggable
- Provide import/export of local progress as JSON
- GitHub Pages deployment should work from the start
