# PRD — JapaneseVerbs.com V1

## 1. Product summary

JapaneseVerbs.com is a static study app for recognizing the 1000 most useful Japanese verbs in written Japanese.

The app is not a landing page and not a general Japanese course. The home route is the curriculum itself. Learners can either:

- jump into the next lesson in the curriculum
- jump directly into a specific lesson
- run endless adaptive review across the broader deck

The core interaction is now typed-pronunciation recognition, not reveal plus self-grading. The learner sees a conjugated Japanese verb form, types the pronunciation, submits, and gets immediate feedback plus a compact answer reveal.

## 2. Audience

Primary user:

- English-speaking Japanese learners around B1 or higher
- already able to parse basic grammar
- trying to speed up recognition of high-frequency written verbs in real reading

Secondary user:

- intermediate readers who want a narrow, high-volume written-verb trainer rather than a broad course

## 3. Product stance

This product is:

- a narrow recognition trainer
- centered on high-frequency written verbs
- optimized for repeated exposure to many forms of the same orthographic item
- serious, supportive, and compact

This product is not:

- a sales site
- a general Japanese curriculum
- a noun-plus-する trainer in the main loop
- a sentence mining tool
- a backend product

## 4. Core user problem

Learners encounter inflected written verbs in books, manga, subtitles, articles, and game text, but they recognize the base verb and pronunciation too slowly.

They often know the grammar in theory. What they lack is rapid, repeated recognition under light pressure.

## 5. Core value proposition

"Master the 1000 most common Japanese verbs."

The app wins by staying narrow and practical:

- one written form at a time
- many conjugated exposures
- deterministic review scheduling
- compact progression through a 1000-verb curriculum

## 6. Tracked item

V1 tracks mastery at the written-verb level, not at the individual inflected-form level.

Examples:

- `読む`
- `考える`
- `受ける`

Inflected forms are surfaced during review and lesson study, but they do not become separate primary cards.

Per-form-family performance still matters. Mistakes on specific families should bias future scheduling without exploding the deck into separate SRS items.

## 7. Content scope

### Included in V1

- 1000 high-frequency Japanese verbs with kanji + okurigana
- non-する core verbs only
- precomputed conjugated forms from the seed dataset
- base meaning, reading, class, transitivity, and alternate-reading metadata
- a curriculum view broken into 100 lessons of 10 verbs each
- endless adaptive review across the deck
- compact generated example sentences on reveal
- browser speech synthesis when available

### Excluded from V1 core

- noun + する verbs in the main study loop
- backend, login, sync, or database storage
- monetization
- social features
- sentence mining workflows
- hand-authored corpus example sentences for every verb

### Annex

- a single reference page for common する verbs may exist as a placeholder in V1

## 8. Home route and information architecture

The home route must be the curriculum overview.

There is no landing page and no sales copy.

### Main screens

- Curriculum overview
- Lesson study
- Endless study
- Index
- Stats and settings combined on one route
- Annex placeholder

### Curriculum overview requirements

- show the lesson sequence directly on the home route
- 100 lessons total, 10 verbs per lesson
- each lesson can be opened directly
- current lesson is visibly highlighted
- completed lessons show a green check
- skipped lessons can show a green curved-arrow state
- after completing a lesson, return to the curriculum with the current lesson centered and celebrated

## 9. Lesson study loop

Lesson mode is a finite stack of 10 verbs.

### Default loop

1. Show one Japanese verb form
2. Learner types the pronunciation
3. `Enter` or `Submit [enter]` submits the answer
4. The app grades automatically
5. The reveal state shows compact answer context
6. Learner advances with `Next verb [enter]`

### Important lesson behavior

- wrong answers stay in the lesson stack and move to the back
- a lesson is not complete until every card in the lesson has been answered correctly
- partial lesson progress persists locally for returning users
- the last correct card must still show its reveal state before the app returns to the curriculum
- if the learner misses a card, they must correct the pronunciation before they can advance

## 10. Endless review mode

Endless review is the adaptive mode across the wider deck.

It should:

- choose cards deterministically from the current filter state
- combine due priority, novelty, weakness, and recent mistakes
- keep surfacing troublesome items without making the experience feel random or opaque

## 11. Why typed pronunciation is the default

The shipped V1 uses typed pronunciation as the main proof of recognition.

Reasons:

- English grading is too fuzzy and context-sensitive for a strict default validator
- typed pronunciation is deterministic and lightweight
- it still supports reading recognition because the learner must map the written form to a pronunciation
- it keeps the loop fast on both lesson mode and endless review

### Matching rules

The answer matcher should be forgiving when the learner clearly knows the reading:

- accept romaji
- accept hiragana
- accept katakana where reasonable
- accept IME-converted Japanese forms when they resolve to the displayed answer
- accept a few keystroke-saving conventions such as `tukuru` for `tsukuru` and `siru` for `shiru`

The logic should stay fast and predictable rather than trying to become a full romanization engine.

## 12. Reveal block requirements

The reveal block should stay compact and avoid repeating information the learner already saw above.

### Reveal should show

- correctness feedback
- base verb, reading, and English meaning
- form shown only when it differs from the base form
- one short Japanese example sentence
- one English translation line
- speech replay control when speech is supported

### Reveal should not show

- redundant "Correct reading" copy
- redundant "Base plain form" labels
- verbose grammar badge spam
- duplicated metadata that is already obvious from the answer lines

### Example sentence rules

- short and compact
- typically no more than roughly 10 to 15 kana / kanji characters
- meant to give context, not to become a full reading passage
- English line should be equally short and compositional

## 13. Audio behavior

V1 includes optional browser speech synthesis.

### Requirements

- say the verb after submission
- expose `Hear again [space]`
- use the best available Japanese system voice for the platform
- degrade gracefully when speech synthesis is unavailable
- prefer learner clarity over native-style compression when the voice is too aggressive

Because Web Speech quality varies across browsers and operating systems, the app may normalize certain kana readings before playback to make mora boundaries clearer.

## 14. Study modes and filters

### Pool modes

- Mixed
- New only
- Review only

### Deck slices

- Due + new
- Due only
- Hide burned
- Burned only
- Weak items
- Recent mistakes
- Trouble items

### Form presets

- Mixed review
- Dictionary only
- て-form only
- Core bundle
- Derived bundle
- Polite bundle
- Custom multi-select

These controls can live on the combined Stats/settings surface rather than in a heavy lesson sidebar.

## 15. Progress model

Use localStorage only in V1.

Track at minimum:

- per-item SRS state
  - `dueAt`
  - `intervalDays`
  - `ease`
  - `streak`
  - `lapses`
  - `totalSeen`
  - `totalCorrect`
- per-form-family stats
  - correct count
  - wrong count
  - last seen
  - last wrong
  - rolling difficulty weight
- curriculum state
  - completed lesson indexes
  - partial lesson sessions
  - remaining lesson stack
  - completed items inside the active lesson

## 16. Scheduling rules

Scheduling should remain deterministic and debuggable.

The next card choice should combine:

- due priority
- novelty
- recent mistakes
- weak form-family bias
- current filter mode
- a light starter bias so brand-new users begin on especially useful print-heavy verbs

In lesson mode, misses go to the back of the current lesson queue rather than disappearing into the global scheduler.

## 17. Stats and settings

The Stats route also serves as the main settings surface for V1.

It should include:

- introduced count
- burned count
- streak and total review context
- weakest conjugation families
- weakest て-form patterns
- JSON export
- JSON import
- reset progress with confirmation
- study mode controls

The settings copy should stay minimal and practical.

## 18. Index / browse

The index should show all 1000 verbs compactly, not a tiny subset.

### Index requirements

- compact multi-column layout on larger viewports
- search by Japanese form, reading, romaji, or English
- tap or hover detail treatment for metadata
- show alternate readings where available
- show transitivity
- show all enabled forms

The default header should stay minimal. A search field is enough.

## 19. UI and interaction style

### Visual direction

- close to freeCodeCamp's design language
- minimalist, block-like, high-contrast UI
- serious but supportive tone
- custom constrained layout rather than a glossy landing page
- no decorative sales stats or marketing copy on the home route

### Layout rules

- mobile-first
- study view should stay usable on small phones with the keyboard visible
- avoid unnecessary scrolling during the active answer phase
- keep the study input visually minimal, closer to a centered caret line than a heavy boxed form
- narrow viewports must use a hamburger nav so the header never wraps

### Theme

- support light and dark mode
- use a compact day/night toggle

### Keyboard and hotkeys

- `Enter` submits
- `Enter` advances after reveal when allowed
- `Space` replays audio on the reveal state

## 20. Routing and platform behavior

Use clean browser paths rather than hash routes.

Examples:

- `/`
- `/study`
- `/study/section/3`
- `/index`
- `/stats`

Direct deep links must work on static hosting. GitHub Pages deployment should preserve lesson URLs through a static fallback mechanism.

Bad or stale paths should degrade gracefully back to the curriculum view.

## 21. Technical requirements

- Vite
- React
- TypeScript
- static assets only
- localStorage-only persistence
- no backend
- no auth
- no database
- GitHub Pages deployability from the start
- light dependency footprint

## 22. Success criteria for V1

V1 is ready to ship when:

- the app boots reliably
- the home route is the curriculum overview
- a learner can open any lesson directly by URL
- lesson progress persists locally across refresh
- endless review works with filters
- the index covers all 1000 verbs
- stats surface weak patterns and trouble items
- JSON import/export works
- the app remains usable on narrow mobile viewports

## 23. Risks and tradeoffs

- Web Speech pronunciation quality varies by browser and operating system
- some generated example sentences are intentionally templated rather than natural corpus examples
- some verbs have broad meanings that still need richer gloss support
- same-spelling alternate readings remain a dataset-review area for future refinement
- some mechanically valid written forms are less common than kana-heavy spellings in real-world text

## 24. Recommendation

Ship V1 as the current typed-pronunciation verb trainer:

- curriculum-first
- client-side only
- adaptive endless review
- compact lesson mode
- local persistence
- lightweight speech support

This PRD overrides the earlier reveal/self-grade concept and should be treated as the current product specification.
