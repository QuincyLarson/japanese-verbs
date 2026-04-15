import { useState } from 'react';
import { useAppState } from '../app/AppState';
import { getFormLabel, searchVerbs } from '../lib/stats';

export function BrowsePage() {
  const { verbs, catalogStatus } = useAppState();
  const [query, setQuery] = useState('');

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Browse</p>
        <h2>Loading the verb reference.</h2>
      </section>
    );
  }

  const results = searchVerbs(verbs, query).slice(0, 60);

  return (
    <section className="page-stack">
      <section className="panel stack">
        <p className="eyebrow">Browse</p>
        <h2>Inspect verbs outside the study loop.</h2>
        <p className="muted-text">
          Search by Japanese form, reading, or English meaning. Results stay compact for mobile review.
        </p>
        <label className="field-stack">
          <span className="label">Search</span>
          <input
            className="text-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="読む / よむ / read"
            type="search"
            value={query}
          />
        </label>
        <p className="muted-text">Showing {results.length} results.</p>
      </section>

      {results.map((entry) => (
        <details className="panel detail-card" key={entry.id}>
          <summary className="detail-summary">
            <div>
              <p className="eyebrow">{entry.reading}</p>
              <h3 lang="ja">{entry.orthography}</h3>
            </div>
            <p className="muted-text">{entry.englishPrimary}</p>
          </summary>

          <div className="stack">
            <div className="mini-stats">
              <div>
                <span>Class</span>
                <strong>{entry.verbClass}</strong>
              </div>
              <div>
                <span>Transitivity</span>
                <strong>{entry.transitivity}</strong>
              </div>
              <div>
                <span>Rank</span>
                <strong>{entry.bccwjRank}</strong>
              </div>
            </div>

            <p className="muted-text">{entry.englishGlosses.join(' / ')}</p>

            <div className="pill-wrap">
              {entry.allowedInflections.map((formKey) => (
                <span className="pill" key={formKey}>
                  {getFormLabel(formKey)}
                </span>
              ))}
            </div>

            <ul className="compact-list">
              {entry.sameSpellingOtherReadings.map((alternate) => (
                <li key={`${entry.id}-${alternate.reading}`}>
                  Alternate reading: {alternate.reading} - {alternate.english_primary}
                </li>
              ))}
              {entry.alternateSpellings.map((spelling) => (
                <li key={`${entry.id}-${spelling}`}>Alternate spelling: {spelling}</li>
              ))}
            </ul>

            <div className="form-list">
              {entry.allowedInflections.map((formKey) => {
                const surface = entry.forms[formKey];

                if (!surface) {
                  return null;
                }

                return (
                  <div className="form-row" key={`${entry.id}-${formKey}`}>
                    <span>{getFormLabel(formKey)}</span>
                    <strong lang="ja">{surface.jp}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}
