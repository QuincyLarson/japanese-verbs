import { useState } from 'react';
import { useAppState } from '../app/AppState';
import { calculateOverviewStats, listWeakestVerbs } from '../lib/stats';

export function StatsPage() {
  const { verbs, catalogStatus, progressStore, exportPayload, importPayload, resetProgress } = useAppState();
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
                <strong lang="ja">{item.entry.orthography}</strong> - {item.entry.reading} - {item.entry.englishPrimary}
              </li>
            ))
          ) : (
            <li>No weak verbs yet. Study a few rounds first.</li>
          )}
        </ul>
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
