import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import {
  CORE_FORM_KEYS,
  DATASET_SUMMARY,
  DEFAULT_FORM_KEYS,
  DERIVED_FORM_KEYS,
  POLITE_FORM_KEYS,
  TE_FORM_PATTERNS,
  VERB_COUNT,
} from '../lib/dataset';
import { calculateOverviewStats } from '../lib/stats';

const QUICK_STATS = [
  { label: 'Seed verbs', value: `${VERB_COUNT}` },
  { label: 'Core families', value: `${CORE_FORM_KEYS.length}` },
  { label: 'Derived families', value: `${DERIVED_FORM_KEYS.length}` },
  { label: 'て-form buckets', value: `${TE_FORM_PATTERNS.length}` },
];

const TRACKS = [
  {
    title: 'Mixed review',
    note: 'Default rotation across all enabled form families.',
    detail: `${DEFAULT_FORM_KEYS.length} enabled form families`,
    to: '/study?preset=mixed-review',
  },
  {
    title: 'Dictionary form',
    note: 'Focus on written verb identity before broader inflection work.',
    detail: 'Single-form recognition drill',
    to: '/study?preset=dictionary',
  },
  {
    title: 'て-form focus',
    note: 'Sharpen the highest-value connective pattern with bucket-aware analytics.',
    detail: `${TE_FORM_PATTERNS.length} pattern buckets`,
    to: '/study?preset=te',
  },
  {
    title: 'Core inflections',
    note: 'Plain dictionary, negative, past, and て-form only.',
    detail: `${CORE_FORM_KEYS.length} core families`,
    to: '/study?preset=core',
  },
  {
    title: 'Derived forms',
    note: 'Potential, passive, causative, and causative-passive review.',
    detail: `${DERIVED_FORM_KEYS.length} derived families`,
    to: '/study?preset=derived',
  },
  {
    title: 'Polite sweep',
    note: 'Optional ます-family exposure for reading support.',
    detail: `${POLITE_FORM_KEYS.length} polite families`,
    to: '/study?preset=polite',
  },
];

const PRINCIPLES = [
  'Track mastery by written verb, not by isolated surface form.',
  'Keep explanations compositional and brief after reveal.',
  'Bias toward weak form families without creating duplicate cards.',
];

export function OverviewPage() {
  const { catalogStatus, progressStore, verbs } = useAppState();
  const progressStats =
    catalogStatus === 'ready' ? calculateOverviewStats(verbs, progressStore) : null;

  return (
    <section className="page-stack">
      <section className="panel stack">
        <p className="eyebrow">Home</p>
        <h2>Curriculum overview</h2>
        <p className="muted-text">
          Choose a review preset, inspect local progress, or browse the seed deck. This route is the working home
          screen, not a landing page.
        </p>
      </section>

      <section className="panel stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Deck</p>
            <h3>Seed deck summary</h3>
          </div>
          <p className="muted-text">
            {DATASET_SUMMARY.selected_unique_orthographic_verbs} selected orthographic verbs.
          </p>
        </div>
        <div className="stats-grid" aria-label="Dataset summary">
          {QUICK_STATS.map((stat) => (
            <article className="stat-block" key={stat.label}>
              <p className="label">{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Progress state</p>
            <h3>Local study status</h3>
          </div>
          <p className="muted-text">
            {catalogStatus === 'ready'
              ? 'Stored in this browser only.'
              : 'Loading the review deck for local progress.'}
          </p>
        </div>

        {progressStats ? (
          <div className="stats-grid">
            <article className="stat-block">
              <p className="label">Introduced</p>
              <strong>{progressStats.introduced}</strong>
            </article>
            <article className="stat-block">
              <p className="label">Due now</p>
              <strong>{progressStats.due}</strong>
            </article>
            <article className="stat-block">
              <p className="label">Current streak</p>
              <strong>{progressStats.currentStreak}</strong>
            </article>
            <article className="stat-block">
              <p className="label">Accuracy</p>
              <strong>{Math.round(progressStats.accuracy * 100)}%</strong>
            </article>
          </div>
        ) : (
          <p className="muted-text">The review deck is still loading.</p>
        )}
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Study tracks</p>
            <h3>Start with a constrained preset.</h3>
          </div>
          <Link className="ghost-link" to="/study?preset=mixed-review">
            Open default review
          </Link>
        </div>

        <div className="track-grid">
          {TRACKS.map((track) => (
            <article className="panel track-card stack" key={track.title}>
              <p className="label">{track.detail}</p>
              <h3>{track.title}</h3>
              <p className="muted-text">{track.note}</p>
              <Link className="block-link" to={track.to}>
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Study model</p>
        <ul className="compact-list">
          {PRINCIPLES.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
        <p className="muted-text">
          The selection pipeline kept {DATASET_SUMMARY.selected_unique_orthographic_verbs} items from a larger
          quality-gated pool and preserves alternate readings in metadata.
        </p>
      </section>
    </section>
  );
}
