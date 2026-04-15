import { Link } from 'react-router-dom';
import {
  COMMON_TE_PATTERNS,
  CORE_FORM_KEYS,
  DEFAULT_FORM_KEYS,
  DERIVED_FORM_KEYS,
  POLITE_FORM_KEYS,
  VERB_COUNT,
} from '../lib/dataset';

const QUICK_STATS = [
  { label: 'Seed verbs', value: `${VERB_COUNT}` },
  { label: 'Core families', value: `${CORE_FORM_KEYS.length}` },
  { label: 'Derived families', value: `${DERIVED_FORM_KEYS.length}` },
  { label: 'て-form buckets', value: `${COMMON_TE_PATTERNS.length}` },
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
    detail: `${COMMON_TE_PATTERNS.length} pattern buckets`,
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
  return (
    <section className="page-stack">
      <section className="panel stack">
        <p className="eyebrow">Curriculum overview</p>
        <h2>Build recognition speed across the core written verb deck.</h2>
        <p className="muted-text">
          Start with the study track that matches your current goal, then branch into stats or browse when you need
          targeted cleanup.
        </p>
      </section>

      <section className="stats-grid" aria-label="Dataset summary">
        {QUICK_STATS.map((stat) => (
          <article className="stat-block" key={stat.label}>
            <p className="label">{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="page-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Study tracks</p>
            <h3>Choose a constrained drill.</h3>
          </div>
          <Link className="ghost-link" to="/stats">
            View progress space
          </Link>
        </div>

        <div className="track-grid">
          {TRACKS.map((track) => (
            <article className="panel track-card stack" key={track.title}>
              <p className="label">{track.detail}</p>
              <h3>{track.title}</h3>
              <p className="muted-text">{track.note}</p>
              <Link className="block-link" to={track.to}>
                Open track
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <p className="eyebrow">Operating rules</p>
        <ul className="compact-list">
          {PRINCIPLES.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
