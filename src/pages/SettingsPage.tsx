import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppState';

export function SettingsPage() {
  const { exportPayload, importPayload, resetProgress } = useAppState();
  const [message, setMessage] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }

    const raw = await file.text();
    const result = importPayload(raw);
    setMessage(result.ok ? 'Progress import applied.' : result.error);
  }

  return (
    <section className="page-stack">
      <section className="panel stack">
        <p className="eyebrow">Settings</p>
        <h2>Manage local progress safely.</h2>
        <p className="muted-text">Everything lives in localStorage in V1. Use JSON export if you want a manual backup.</p>
      </section>

      <section className="panel stack">
        <button className="block-link" onClick={handleExport} type="button">
          Export progress JSON
        </button>
        <button
          className="ghost-link"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Import progress JSON
        </button>
        <button
          className="filter-chip danger-chip"
          onClick={() => {
            resetProgress();
            setMessage('Local progress reset.');
          }}
          type="button"
        >
          Reset local progress
        </button>
        <input
          accept="application/json"
          className="hidden-input"
          onChange={(event) => void handleImport(event.target.files?.[0])}
          ref={fileInputRef}
          type="file"
        />
        {message ? (
          <p aria-live="polite" className="muted-text" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <section className="panel stack">
        <p className="label">Scope reminder</p>
        <ul className="compact-list">
          <li>No backend or sync in V1</li>
          <li>No account system</li>
          <li>Progress is portable through the export file</li>
        </ul>
        <Link className="ghost-link" to="/annex">
          Open annex placeholder
        </Link>
      </section>
    </section>
  );
}
