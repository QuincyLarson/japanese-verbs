# Data sources and pipeline notes

## Practical source stack used for this prep package

### 1. Frequency backbone
A rank-ordered BCCWJ-derived frequency list was used as the frequency spine.

Working local file:
- `pared_BCCWJ.csv`

Fields used:
- surface form
- katakana reading
- origin label

### 2. Dictionary matching
A local EDICT2-style dictionary dump was used to identify verb entries, readings, part-of-speech labels, and English glosses.

Working local file:
- `edict2.txt`

Used for:
- modern verb filtering
- class detection
- English gloss collection
- alternate spelling metadata
- commonness flag `(P)`

### 3. Educational/basic-vocabulary cross-check
Two NINJAL-style educational/basic-vocabulary CSVs were used as quality gates.

Working local files:
- `kyoikukihongoi_2009B.csv`
- `rokusyutaisyo.csv`

Used for:
- checking whether a candidate verb appears in educational/basic vocabulary lists
- lightly suppressing literary outliers from the top 1000 seed

## Selection logic

1. Start from the BCCWJ-derived ranking list
2. Normalize katakana readings to hiragana
3. Exact-match surface + reading against modern dictionary verb entries
4. Exclude suru-family and noun-plus-suru verbs from the core deck
5. Keep only kanji + hiragana orthographic forms
6. Keep only entries labeled 和 / 漢 / 混 in the working rank file
7. Keep candidates that are either:
   - marked common in the dictionary source, or
   - present in the educational/basic-vocabulary sources
8. Collapse to one selected entry per orthographic form
9. Take the first 1000 unique orthographic verbs

## Why there is no official JLPT tag in the seed data

The JLPT no longer provides official vocabulary and kanji specification lists in the old way.
For that reason, this prep package does **not** add unofficial JLPT level tags to the core dataset.

A later version can add optional unofficial JLPT tags, but they should not be treated as canonical.

## Important caveat

The inflected written forms in this seed dataset are primarily **mechanically generated from the chosen lemma spelling**.
That is good enough for V1 practice and implementation scaffolding, but later polish can add corpus-backed spelling overrides where kana-only inflected spellings are more natural.
