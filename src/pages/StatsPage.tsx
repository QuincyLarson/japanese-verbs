import { useAppState } from '../app/AppState';
import {
  calculateFormFamilyStats,
  calculateOverviewStats,
  calculateTePatternStats,
  listWeakestVerbs,
} from '../lib/stats';

export function StatsPage() {
  const { verbs, catalogStatus, progressStore } = useAppState();

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Stats</p>
        <h2>Loading progress diagnostics</h2>
      </section>
    );
  }

  const overview = calculateOverviewStats(verbs, progressStore);
  const formStats = calculateFormFamilyStats(verbs, progressStore);
  const teStats = calculateTePatternStats(verbs, progressStore).slice(0, 5);
  const weakestVerbs = listWeakestVerbs(verbs, progressStore, 6);

  return (
    <section className="page-stack">
      <section className="panel stack">
        <p className="eyebrow">Stats</p>
        <h2>Surface weak patterns before they spread.</h2>
        <p className="muted-text">Progress is computed from local review history only.</p>
      </section>

      <section className="stats-grid">
        <article className="stat-block">
          <p className="label">Introduced</p>
          <strong>{overview.introduced}</strong>
        </article>
        <article className="stat-block">
          <p className="label">Burned</p>
          <strong>{overview.burned}</strong>
        </article>
        <article className="stat-block">
          <p className="label">Total reviews</p>
          <strong>{overview.totalReviews}</strong>
        </article>
        <article className="stat-block">
          <p className="label">Best streak</p>
          <strong>{overview.bestStreak}</strong>
        </article>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Form families</p>
        <div className="form-list">
          {formStats.length > 0 ? (
            formStats.map((row) => (
              <div className="form-row" key={row.formKey}>
                <span>{row.label}</span>
                <strong>{Math.round(row.accuracy * 100)}%</strong>
              </div>
            ))
          ) : (
            <p className="muted-text">No form-family attempts recorded yet.</p>
          )}
        </div>
      </section>

      <section className="panel stack">
        <p className="eyebrow">て-form buckets</p>
        <div className="form-list">
          {teStats.length > 0 ? (
            teStats.map((row) => (
              <div className="form-row" key={row.pattern}>
                <span>{row.pattern}</span>
                <strong>{Math.round(row.accuracy * 100)}%</strong>
              </div>
            ))
          ) : (
            <p className="muted-text">No て-form attempts recorded yet.</p>
          )}
        </div>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Weak verbs</p>
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
    </section>
  );
}
