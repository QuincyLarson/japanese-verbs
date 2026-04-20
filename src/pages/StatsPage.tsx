import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { FORM_ORDER } from '../lib/dataset';
import { formatEnglishDefinition } from '../lib/definitions';
import { DECK_SLICE_OPTIONS, FORM_PRESET_OPTIONS, POOL_MODE_OPTIONS } from '../lib/filters';
import {
  calculateFormFamilyStats,
  calculateOverviewStats,
  calculateTePatternStats,
  getFormLabel,
  getTePatternLabel,
  listWeakestVerbs,
} from '../lib/stats';

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function StatsPage() {
  const {
    verbs,
    catalogStatus,
    progressStore,
    settingsStore,
    setStudySettings,
    applyStudyPreset,
    toggleStudyForm,
    exportPayload,
    importPayload,
    resetProgress,
  } = useAppState();
  const [message, setMessage] = useState<string>();
  const [importText, setImportText] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Progress</p>
        <h2>Loading progress</h2>
      </section>
    );
  }

  const overview = calculateOverviewStats(verbs, progressStore);
  const weakestVerbs = listWeakestVerbs(verbs, progressStore, 5);
  const formFamilyStats = calculateFormFamilyStats(verbs, progressStore)
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.attempts - left.attempts;
    })
    .slice(0, 6);
  const tePatternStats = calculateTePatternStats(verbs, progressStore).slice(0, 5);

  function handleExport() {
    const payload = exportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `jp-verbs-progress-${payload.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Progress export downloaded.');
  }

  function handleImport() {
    const result = importPayload(importText);
    if (result.ok) {
      setMessage('Progress restored.');
      setImportText('');
      return;
    }

    setMessage(result.error);
  }

  return (
    <section className="page-stack">
      <section className="stats-grid">
        <article className="stat-block">
          <p className="label">Due now</p>
          <strong>{overview.due}</strong>
        </article>
        <article className="stat-block">
          <p className="label">Introduced</p>
          <strong>{overview.introduced}</strong>
        </article>
        <article className="stat-block">
          <p className="label">Accuracy</p>
          <strong>{Math.round(overview.accuracy * 100)}%</strong>
        </article>
        <article className="stat-block">
          <p className="label">Current streak</p>
          <strong>{overview.currentStreak}</strong>
        </article>
      </section>

      <section className="panel stack">
        <div className="simple-stat-row">
          <div>
            <p className="label">Burned</p>
            <strong>{overview.burned}</strong>
          </div>
          <p className="muted-text">
            Burned verbs are items you know well enough that they are hidden from normal review because they are on a
            long interval with strong accuracy.
          </p>
        </div>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Needs work</p>
        <ul className="compact-list">
          {weakestVerbs.length > 0 ? (
            weakestVerbs.map((item) => (
              <li key={item.entry.id}>
                <strong lang="ja">{item.entry.orthography}</strong> - {item.entry.reading} - {formatEnglishDefinition(item.entry, verbs)}
              </li>
            ))
          ) : (
            <li>No weak verbs yet. Study a few rounds first.</li>
          )}
        </ul>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Weak conjugation families</p>
        {formFamilyStats.length > 0 ? (
          <div className="metric-list" role="list" aria-label="Weakest conjugation families">
            {formFamilyStats.map((row) => (
              <div className="metric-row" key={row.formKey} role="listitem">
                <div>
                  <p className="metric-row__title">{row.label}</p>
                  <p className="metric-row__meta">
                    {row.attempts} attempts across {row.verbsSeen} verbs
                  </p>
                </div>
                <strong>{formatPercent(row.accuracy)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-text">Conjugation-family stats will appear after a few reviews.</p>
        )}
      </section>

      <section className="panel stack">
        <p className="eyebrow">Weakest て-form patterns</p>
        {tePatternStats.length > 0 ? (
          <div className="metric-list" role="list" aria-label="Weakest te-form patterns">
            {tePatternStats.map((row) => (
              <div className="metric-row" key={row.pattern} role="listitem">
                <div>
                  <p className="metric-row__title">{getTePatternLabel(row.pattern)}</p>
                  <p className="metric-row__meta">{row.attempts} て-form attempts</p>
                </div>
                <strong>{formatPercent(row.accuracy)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-text">て-form weakness patterns will appear after te-form reviews.</p>
        )}
      </section>

      <section className="panel stack">
        <p className="eyebrow">Study modes</p>
        <div className="study-controls__grid">
          <label className="field-stack">
            <span className="label">Verb pool</span>
            <select
              className="text-input select-input"
              onChange={(event) =>
                setStudySettings((current) => ({
                  ...current,
                  poolMode: event.target.value as (typeof settingsStore.study.poolMode),
                }))
              }
              value={settingsStore.study.poolMode}
            >
              {POOL_MODE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span className="label">Scheduling</span>
            <select
              className="text-input select-input"
              onChange={(event) =>
                setStudySettings((current) => ({
                  ...current,
                  deckSlice: event.target.value as (typeof settingsStore.study.deckSlice),
                }))
              }
              value={settingsStore.study.deckSlice}
            >
              {DECK_SLICE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span className="label">Form bundle</span>
            <select
              className="text-input select-input"
              onChange={(event) => applyStudyPreset(event.target.value as (typeof settingsStore.study.formPresetId))}
              value={settingsStore.study.formPresetId}
            >
              {FORM_PRESET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {settingsStore.study.formPresetId === 'custom' ? (
          <div className="field-stack">
            <span className="label">Custom forms</span>
            <div className="segmented-row">
              {FORM_ORDER.map((formKey) => {
                const isActive = settingsStore.study.customForms.includes(formKey);

                return (
                  <button
                    key={formKey}
                    aria-pressed={isActive}
                    className={isActive ? 'filter-chip is-active' : 'filter-chip'}
                    onClick={() => toggleStudyForm(formKey)}
                    type="button"
                  >
                    {getFormLabel(formKey)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <Link className="action-button action-button--primary" to="/study">
          Start selected session
        </Link>
      </section>

      <section className="panel stack">
        <p>We store your progress in your browser.</p>

        <div className="settings-actions">
          <button className="action-button action-button--primary" onClick={handleExport} type="button">
            Export my progress as a JSON file
          </button>

          <label className="field-stack">
            <span className="label">Paste in JSON to restore my progress</span>
            <textarea
              className="text-input text-input--multiline"
              onChange={(event) => setImportText(event.target.value)}
              placeholder="Paste exported progress JSON here"
              rows={8}
              value={importText}
            />
          </label>

          <button
            className="action-button"
            disabled={importText.trim().length === 0}
            onClick={handleImport}
            type="button"
          >
            Paste in JSON to restore my progress
          </button>

          <button className="action-button action-button--danger" onClick={() => setShowResetConfirm(true)} type="button">
            Reset my progress
          </button>
        </div>

        {message ? (
          <p aria-live="polite" className="muted-text" role="status">
            {message}
          </p>
        ) : null}
      </section>

      {showResetConfirm ? (
        <div className="modal-backdrop" role="presentation">
          <section
            aria-labelledby="reset-progress-title"
            aria-modal="true"
            className="modal-card"
            role="dialog"
          >
            <div className="stack">
              <h2 id="reset-progress-title">Reset progress?</h2>
              <p className="muted-text">This clears your local review history and cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={() => setShowResetConfirm(false)} type="button">
                Cancel
              </button>
              <button
                className="action-button action-button--danger"
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                  setMessage('Progress reset.');
                }}
                type="button"
              >
                Reset my progress
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
