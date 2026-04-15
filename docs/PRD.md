# PRD — Master the 1000 Most Common Japanese Verbs

## 1. Product summary

A static study app for recognizing the 1000 most useful Japanese verbs in real written Japanese.

The app drills one written verb at a time and systematically rotates through inflected forms so learners get heavy exposure to:
- dictionary form
- negative
- past
- て-form
- potential
- passive
- causative
- causative-passive
- selected polite and extended forms

The learner goal is reading recognition, not native-like active production.

## 2. Audience

Primary user:
- English-speaking Japanese learners around B1 or higher
- already able to express basic ideas with simpler language
- trying to expand reading vocabulary through repeated exposure

Secondary user:
- intermediate learners doing extensive reading who want a focused high-frequency verb deck

## 3. Product stance

This is not a generic conjugation table reference.
This is not a する-verb trainer.
This is not a beginner app.

The app should feel like an endless quiz engine for high-frequency written verbs.

## 4. User problem

Learners repeatedly encounter written verbs in inflected forms and recognize the base meaning too slowly.
They may know grammar in theory, but they need large-volume exposure to real written verb forms.

## 5. Core value proposition

"Master the 1000 most common Japanese verbs."

That is the pitch.
The app wins by giving repeated, targeted, high-frequency recognition practice.

## 6. What counts as the tracked item

V1 tracks mastery at the written-verb level:
- `読む`
- `考える`
- `受ける`

Inflected forms are generated views of that item.
They should influence scheduling, but they should not create separate primary cards.

### Important caveat
Some written forms have alternate readings.
Keep that metadata in the dataset.
V1 should still choose one primary entry per orthographic item to keep the deck coherent.

## 7. Content scope

### Included
- 1000 high-frequency Japanese verbs with kanji + okurigana
- non-する core verbs only
- generated inflected forms
- base meaning, reading, class, and conjugation metadata

### Excluded from V1 core
- noun + する verbs
- annex content inside the main SRS loop
- sentence examples unless time remains
- audio
- login/sync

### Later annex
- a single reference page for common する verbs with conjugation of する

## 8. Default quiz loop

1. Show a conjugated Japanese verb form
2. User recalls its English equivalent
3. User reveals answer
4. App shows:
   - base verb
   - reading
   - base English meaning(s)
   - short bullet explanation of the inflection
5. User self-grades with Again / Hard / Good / Easy

## 9. Why self-grading is the default

English equivalents for inflected Japanese verbs are often many-to-one and context-sensitive.
A rigid typed-answer validator will reject too many reasonable answers.

Therefore:
- V1 default: reveal + self-grade
- optional: relaxed typed-English mode if implementation remains simple

## 10. Required study modes

### Core
- Endless mixed
- New only
- Review only
- Weak items
- Recently missed

### Inflection filters
- Dictionary only
- て-form only
- Plain core bundle
- Derived bundle
- Custom multi-select

### Scheduling filters
- All due
- Due + new
- Burned hidden
- Burned only
- Leech-like trouble items

## 11. Inflection explanation style

Do not use tiny grammar badges as the main explanation.

Instead show a compact bullet list such as:
- Base verb: `書く` — かく — write
- Form shown: `書かされる`
- This is the causative-passive form
- Read it as: “be made to write”

The English explanation should stay compositional.
Do not replace a morphologically transparent form with an overly fancy English word.

## 12. SRS model

Use localStorage in V1.

Recommended structure:
- per-item state:
  - dueAt
  - intervalDays
  - ease
  - streak
  - lapses
  - totalSeen
  - totalCorrect
- per-form-family stats:
  - correct count
  - wrong count
  - last seen
  - rolling difficulty weight

### Scheduling rule
Choose the next item by combining:
- due priority
- novelty
- recent mistakes
- weak form-family bias
- optional current filter mode

## 13. Progress model

Track:
- total verbs introduced
- total burned
- current streak
- accuracy by form family
- weakest endings for て-form drills
- weakest conjugation families overall

## 14. Information architecture

### Main screens
- Home / continue studying
- Study
- Filters / mode picker
- Stats
- Browse all verbs
- Single annex page for common する verbs (placeholder in V1)

### Browse view
Each verb detail page/card should show:
- written form
- reading
- base meaning(s)
- class
- transitivity
- all enabled forms
- alternate readings if any

## 15. UI style

- freeCodeCamp-style simplicity
- dark mode support
- mobile-first
- no visual clutter
- clear review buttons
- high contrast
- fast load on GitHub Pages

## 16. Technical requirements

- Vite
- TypeScript
- static assets only
- localStorage persistence
- GitHub Pages deployability
- import/export progress JSON
- no backend in V1

## 17. Success criteria for V1

- user can immediately start an endless review session
- app can filter down to て-form only
- app remembers progress locally
- app surfaces weak conjugation patterns
- app ships with a coherent 1000-verb seed deck
- Codex can build from the provided JSON and TS scaffolding without inventing the data model

## 18. Nice-to-have if time remains

- keyboard shortcuts
- fuzzy typed-English mode
- saved custom study presets
- tiny sparkline-like progress summaries
- per-ending て-form drill stats

## 19. Risks

- some mechanically generated written forms are less common orthographically than kana-only spellings
- some verbs are semantically broad and need UI support for multiple English glosses
- some same-spelling alternate readings will need later manual review

## 20. Recommendation

Ship V1 with the current 1000-item deck, clear filters, a strong study loop, and a transparent reveal/self-grade workflow.
