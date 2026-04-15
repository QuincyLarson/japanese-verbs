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
import { FORM_ORDER, FORM_PRESETS } from '../lib/dataset';
import { createStudySnapshot } from '../lib/scheduler';
import type { Grade } from '../types/study';

const GRADE_BUTTONS: Array<{ grade: Grade; label: string }> = [
  { grade: 'again', label: 'Again' },
  { grade: 'hard', label: 'Hard' },
  { grade: 'good', label: 'Good' },
  { grade: 'easy', label: 'Easy' },
];

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
  }, [nextCard?.entry.id, nextCard?.formKey]);

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

  return (
    <section className="page-stack">
      <article className="panel workspace-card stack">
        {nextCard ? (
          <>
            <div className="surface-block">
              <p className="surface-form" lang="ja">
                {nextCard.surface.jp}
              </p>
              {!isRevealed ? <p className="muted-text">Tap reveal when you have an answer in mind.</p> : null}
            </div>

            {isRevealed ? (
              <div className="answer-panel stack">
                <div className="mini-stats">
                  <div>
                    <span>Base verb</span>
                    <strong lang="ja">{nextCard.entry.orthography}</strong>
                  </div>
                  <div>
                    <span>Reading</span>
                    <strong lang="ja">{nextCard.entry.reading}</strong>
                  </div>
                  <div>
                    <span>Meaning</span>
                    <strong>{nextCard.entry.englishPrimary}</strong>
                  </div>
                </div>

                <ul className="compact-list">
                  <li>
                    Base verb: <strong lang="ja">{nextCard.entry.orthography}</strong> - {nextCard.entry.reading} -{' '}
                    {nextCard.entry.englishPrimary}
                  </li>
                  <li>
                    Form shown: <strong lang="ja">{nextCard.surface.jp}</strong> ({FORM_PRESETS[nextCard.formKey].label})
                  </li>
                  {explanation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {nextCard.entry.inflectionNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>

                <div className="grade-grid">
                  {GRADE_BUTTONS.map((button) => (
                    <button
                      key={button.grade}
                      className={`grade-button grade-${button.grade}`}
                      onClick={() => {
                        recordReview(nextCard.entry.masteryKey, nextCard.formKey, button.grade);
                        setIsRevealed(false);
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
                Reveal answer
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
