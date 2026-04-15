# Repo prep guidance

## Recommended repo layout

```text
/
  AGENTS.md
  CODEX_PROMPT.md
  package.json
  src/
    app/
    components/
    lib/
      conjugation.ts
      scheduler.ts
      storage.ts
      filters.ts
    types/
      verb.ts
  data/
    top_1000_japanese_verbs_v1.json
    form_presets.json
    selection_manifest.json
  docs/
    PRD.md
    DATA_SOURCES.md
    CONJUGATION_ENGINE.md
```

## Suggested implementation order

1. load seed data
2. build study-session state machine
3. build review card UI
4. implement reveal/self-grade loop
5. add scheduler + localStorage
6. add filters and stats
7. add browse/detail pages
8. polish GitHub Pages deployment

## Data-loading recommendation

Load the JSON dataset directly as a static asset or import it during the build.
Avoid unnecessary fetch indirection if it complicates GitHub Pages deployment.

## Persistence recommendation

Use a versioned localStorage key such as:
- `jp-verbs-v1-progress`
- `jp-verbs-v1-settings`

Support export/import as JSON from the settings page.

## Suggested initial screens

- `/` dashboard
- `/study`
- `/browse`
- `/stats`
- `/settings`

## Scheduler note

Because mastery is orthography-based, the scheduler should:
- select an item
- then select an allowed inflection form for that item
- bias toward form families the user misses often

That is the core product insight.
