# Conjugation engine notes

## Goal

Generate enough inflected forms to support a recognition-focused quiz app, while staying simple and deterministic.

## Supported classes

- ichidan
- godan
- 来る
- 有る
- honorific `-aru` verbs such as `下さる`, `為さる`, `仰る`

## Why precomputed forms matter

The app should not rely on runtime guesswork for:
- `行く`
- `来る`
- `有る`
- honorific `-aru` verbs
- orthography-sensitive cases

Use the JSON seed data as the source of truth for actual review forms.

## て-form buckets

For drill analytics, every verb should expose a `teFormPattern`:

- `ichidan-て`
- `godan-って`
- `godan-んで`
- `godan-いて`
- `godan-いで`
- `godan-して`
- `godan-行く-って`
- `irregular-kuru`
- `aru-って`
- `honorific-aru-って`

This lets the app show useful stats like:
- weakest て-form bucket
- current て-form success rate by pattern

## English explanation strategy

Keep English explanations compositional.

Examples:
- passive: `be written`
- causative: `make/let someone write`
- causative-passive: `be made to write`

Do not over-fit to a single polished English word.

## Recommended reveal block

- Base verb: `書く`
- Reading: `かく`
- Base meaning: `write`
- Shown form: `書かされる`
- Explanation:
  - base stem + causative + passive
  - read as: `be made to write`

## Special handling notes

### 有る
Treat negative as `無い`.
Do not make passive/causative review forms part of V1.

### Honorific -aru verbs
Use a narrower allowed-inflection set in V1.
Avoid passive/causative drills for these.

### Same-form alternate readings
Keep metadata for later manual review.
Do not turn those into duplicate orthographic cards in V1.
