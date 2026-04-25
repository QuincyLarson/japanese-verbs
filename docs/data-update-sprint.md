# Codex handoff: replace Japanese verb data source

You are working in an existing Japanese verb learning app. I have replaced the older verb data files with this single canonical CSV:

`japanese_verbs_composite_frequency.csv`

Use this CSV as the source of truth for verb curriculum sequencing and verb metadata. Do not regenerate, re-rank, merge, deduplicate, or “improve” the rows.

## Schema

The CSV is UTF-8 with BOM and has exactly 2,000 data rows. Columns:

- `id`: stable unique row id, generated after final curriculum ordering.
- `frequency_rank`: canonical curriculum order. Numeric ascending order is the sequence learners should see.
- `source`: one of `native_bccwj`, `kango_suru`, or `slang`.
- `source_id`: original row id from the source sheet.
- `source_rank`: original source rank (`bccwjRank` for native rows, `rankApprox` for kango/slang rows).
- `orthography`: Japanese written form to display.
- `reading`: kana reading.
- `romaji`: compact ASCII pronunciation helper.
- `english`: concise English meaning/gloss.
- `verb_class`: conjugation/business-logic class. Native rows use the original detailed ending group; kango rows use `suru`; slang rows use their source `verbClass`.
- `te_form_pattern`: conjugation hint where available/inferred.
- `transitivity`: original transitivity for native rows; `unspecified` for rows that did not provide it.
- `register`: `standard`, `colloquial`, `internet`, `slang`, `gaming`, `fandom`, etc.
- `example_ja`: short informal Japanese example sentence, usually plain past tense.
- `example_en`: English translation/example sentence.

## Example sentence policy

The `example_ja` values are intentionally short, informal/plain Japanese examples, usually plain past tense. Do not rewrite them into polite form, do not convert them to dictionary-form placeholders, and do not replace them with generic sentences like “I like to ___.” The examples are authored content for the curriculum and should be loaded as-is.

## Non-negotiable curriculum rule

`frequency_rank` is gospel. Preserve it exactly. Sort by it numerically ascending. Never calculate a replacement ranking from `source`, `source_rank`, text order, glosses, corpus assumptions, or model judgment.

This file intentionally demotes some high-frequency but rarely printed kanji spellings, such as `居る`, `有る`, and `仕舞う`, because the app curriculum teaches the written form in `orthography`. Do not move them back to the top just because their kana equivalents are common.

Sanity checks from the canonical CSV:

- `勉強する` (`source=kango_suru`) has `frequency_rank=15`.
- `飲む` (`source=native_bccwj`) has `frequency_rank=71`.
- `サボる` (`source=slang`) has `frequency_rank=56`.
- `ググる` (`source=slang`) has `frequency_rank=61`.
- `居る` (`source=native_bccwj`) has `frequency_rank=499`.
- `有る` (`source=native_bccwj`) has `frequency_rank=500`.
- `仕舞う` (`source=native_bccwj`) has `frequency_rank=511`.

## Implementation tasks

1. Locate all existing verb-data loaders, imports, hardcoded seed data, fixtures, validators, and tests that reference the older separate files.
2. Replace those references with a loader for `japanese_verbs_composite_frequency.csv`.
3. Update TypeScript/Swift/Kotlin/Python schemas or model types to match the columns above.
4. Use `id` as the unique row key. Do not use `orthography` or `reading` as the unique key because some rows intentionally share the same written form/reading but represent different senses or registers.
5. Ensure curriculum screens, review queues, lesson unlock logic, and sorting functions use numeric `frequency_rank` ascending.
6. Use `orthography`, `reading`, `romaji`, `english`, `example_ja`, and `example_en` for display cards.
7. Preserve conjugation/business logic by reading `verb_class` and `te_form_pattern`; do not assume every row uses the same conjugation source.
8. Add or update tests that assert: row count is 2,000; `frequency_rank` is unique and contiguous from 1 to 2,000; sorting is numeric; the sanity-check ranks above match; duplicate orthography+reading pairs remain separate rows with separate ids.
9. Remove obsolete assumptions that there are three separate datasets or that kango/slang verbs should be appended after all native verbs.

Treat the data file as authoritative content. Only change application code around it.
