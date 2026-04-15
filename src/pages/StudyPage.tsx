import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { getInflectionExplanation } from '../lib/conjugation';
import {
  DECK_SLICE_OPTIONS,
  FORM_PRESET_OPTIONS,
  POOL_MODE_OPTIONS,
  getPresetFromSearchParam,
  resolveFormSelection,
} from '../lib/filters';
import { getOrCreateProgress, previewGradeResult } from '../lib/progress';
import { matchesReadingInput } from '../lib/romaji';
import { FORM_ORDER, FORM_PRESETS } from '../lib/dataset';
import { createStudySnapshot } from '../lib/scheduler';
import type { Grade } from '../types/study';

const REVIEW_BUTTONS: Array<{
  grade: Grade;
  label: string;
  buildMessage: (delayLabel: string) => string;
}> = [
  {
    grade: 'good',
    label: 'I know it',
    buildMessage: (delayLabel) => `Awesome. You'll see it in ${delayLabel}.`,
  },
  {
    grade: 'again',
    label: "I don't know it",
    buildMessage: (delayLabel) => `No worries. You'll see it again in ${delayLabel}.`,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDelayLabel(dueAt: string, now: Date) {
  const diffMs = Math.max(0, Date.parse(dueAt) - now.getTime());

  if (diffMs < DAY_MS) {
    const minutes = Math.max(1, Math.round(diffMs / (60 * 1000)));

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    const hours = Math.round(diffMs / (60 * 60 * 1000));
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = diffMs / DAY_MS;
  const roundedDays = days < 10 ? Math.round(days * 10) / 10 : Math.round(days);
  return `${roundedDays} day${roundedDays === 1 ? '' : 's'}`;
}

function SelectField<T extends string>({
  id,
  label,
  options,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  options: Array<{ id: T; label: string }>;
  selected: T;
  onSelect: (id: T) => void;
}) {
  return (
    <label className="field-stack" htmlFor={id}>
      <span className="label">{label}</span>
      <select
        className="text-input select-input"
        id={id}
        onChange={(event) => onSelect(event.target.value as T)}
        value={selected}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StudyPage() {
  const {
    verbs,
    catalogStatus,
    progressStore,
    settingsStore,
    applyStudyPreset,
    setStudySettings,
    toggleStudyForm,
    recordReview,
  } = useAppState();
  const [searchParams] = useSearchParams();
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string>();
  const presetFromUrl = getPresetFromSearchParam(searchParams.get('preset'));

  useEffect(() => {
    if (presetFromUrl) {
      applyStudyPreset(presetFromUrl);
    }
  }, [presetFromUrl]);

  const snapshot =
    catalogStatus === 'ready'
      ? createStudySnapshot(verbs, progressStore, settingsStore.study)
      : null;
  const activeForms = resolveFormSelection(settingsStore.study);
  const nextCard = snapshot?.nextCard ?? null;

  useEffect(() => {
    setIsRevealed(false);
    setTypedAnswer('');
  }, [nextCard?.entry.id, nextCard?.formKey]);

  useEffect(() => {
    if (!reviewFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setReviewFeedback(undefined);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [reviewFeedback]);

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Flash cards</p>
        <h2>Loading review workspace</h2>
        <p className="muted-text">The static verb catalog is still loading.</p>
      </section>
    );
  }

  const explanation = nextCard
    ? getInflectionExplanation(nextCard.formKey, nextCard.entry.englishPrimary)
    : [];
  const cleanedTypedAnswer = typedAnswer.trim();
  const typedAnswerMatches = nextCard ? matchesReadingInput(cleanedTypedAnswer, nextCard.surface.reading) : false;

  return (
    <section className="page-stack">
      <article className="panel workspace-card stack">
        {reviewFeedback ? (
          <p aria-live="polite" className="review-feedback" role="status">
            {reviewFeedback}
          </p>
        ) : null}

        {nextCard ? (
          <>
            <div className="surface-block">
              <p className="surface-form" lang="ja">
                {nextCard.surface.jp}
              </p>
              {!isRevealed ? (
                <textarea
                  aria-label="Type the reading in romaji or hiragana"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="text-input surface-response__input"
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  placeholder="Type the reading in romaji or hiragana"
                  rows={3}
                  spellCheck={false}
                  value={typedAnswer}
                />
              ) : null}
            </div>

            {isRevealed ? (
              <div className="answer-panel stack">
                <ul className="compact-list">
                  <li>
                    Base verb: <strong lang="ja">{nextCard.entry.orthography}</strong> - {nextCard.entry.reading} -{' '}
                    {nextCard.entry.englishPrimary}
                  </li>
                  <li>
                    Form shown: <strong lang="ja">{nextCard.surface.jp}</strong> - {nextCard.surface.reading}{' '}
                    ({FORM_PRESETS[nextCard.formKey].label})
                  </li>
                  {cleanedTypedAnswer ? (
                    <li>
                      Your reading: <strong>{cleanedTypedAnswer}</strong>
                      {typedAnswerMatches ? ' matched the expected reading.' : ''}
                    </li>
                  ) : null}
                  {cleanedTypedAnswer && !typedAnswerMatches ? (
                    <li>
                      Correct reading: <strong lang="ja">{nextCard.surface.reading}</strong>
                    </li>
                  ) : null}
                  {explanation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {nextCard.entry.inflectionNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <div className="grade-grid">
                  {REVIEW_BUTTONS.map((button) => (
                    <button
                      key={button.grade}
                      className={`grade-button grade-${button.grade}`}
                      onClick={() => {
                        const now = new Date();
                        const progress = getOrCreateProgress(
                          progressStore,
                          nextCard.entry.masteryKey,
                          now.toISOString(),
                        );
                        const preview = previewGradeResult(progress, button.grade, now);

                        recordReview(nextCard.entry.masteryKey, nextCard.formKey, button.grade);
                        setReviewFeedback(button.buildMessage(formatDelayLabel(preview.dueAt, now)));
                        setIsRevealed(false);
                        setTypedAnswer('');
                      }}
                      type="button"
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button className="block-link" onClick={() => setIsRevealed(true)} type="button">
                Check answer
              </button>
            )}
          </>
        ) : (
          <div className="stack">
            <p className="eyebrow">No matching cards</p>
            <h3>These filters currently produce an empty queue.</h3>
            <p className="muted-text">Try mixed mode, reopen burned items, or switch back to the default queue.</p>
          </div>
        )}

        <section className="study-controls stack-sm" aria-label="Flash card options">
          <div className="study-controls__grid">
            <SelectField
              id="study-form-preset"
              label="Forms"
              options={FORM_PRESET_OPTIONS.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              selected={settingsStore.study.formPresetId}
              onSelect={(preset) => applyStudyPreset(preset)}
            />

            <SelectField
              id="study-pool-mode"
              label="Pool"
              options={POOL_MODE_OPTIONS}
              selected={settingsStore.study.poolMode}
              onSelect={(poolMode) =>
                setStudySettings((current) => ({
                  ...current,
                  poolMode,
                }))
              }
            />

            <SelectField
              id="study-deck-slice"
              label="Focus"
              options={DECK_SLICE_OPTIONS.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              selected={settingsStore.study.deckSlice}
              onSelect={(deckSlice) =>
                setStudySettings((current) => ({
                  ...current,
                  deckSlice,
                }))
              }
            />
          </div>

          {settingsStore.study.formPresetId === 'custom' ? (
            <details className="debug-box study-custom-forms">
              <summary>Choose forms</summary>
              <div className="segmented-row">
                {FORM_ORDER.map((formKey) => (
                  <button
                    key={formKey}
                    aria-pressed={activeForms.includes(formKey)}
                    className={`filter-chip${activeForms.includes(formKey) ? ' is-active' : ''}`}
                    onClick={() => toggleStudyForm(formKey)}
                    type="button"
                  >
                    {FORM_PRESETS[formKey].label}
                  </button>
                ))}
              </div>
            </details>
          ) : null}

          {snapshot ? (
            <div className="mini-stats study-mini-stats">
              <div>
                <span>Due</span>
                <strong>{snapshot.counts.due}</strong>
              </div>
              <div>
                <span>Weak</span>
                <strong>{snapshot.counts.weak}</strong>
              </div>
              <div>
                <span>Recent misses</span>
                <strong>{snapshot.counts.recentMistakes}</strong>
              </div>
            </div>
          ) : null}
        </section>
      </article>
    </section>
  );
}
