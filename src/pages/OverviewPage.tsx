import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import type { FormKey } from '../types/verb';

const HOME_ROWS: Array<{
  id: string;
  title: string;
  summary: string;
  to: string;
  formKey: FormKey | null;
}> = [
  {
    id: 'mixed-review',
    title: 'Mixed review',
    summary: 'Default endless review across the active form families.',
    to: '/study?preset=mixed-review',
    formKey: null,
  },
  {
    id: 'dictionary',
    title: 'Dictionary form',
    summary: 'Focus on written verb identity before broader inflection work.',
    to: '/study?preset=dictionary',
    formKey: 'dictionary',
  },
  {
    id: 'te',
    title: 'て-form focus',
    summary: 'Sharpen the connective form with compact repeated exposure.',
    to: '/study?preset=te',
    formKey: 'te',
  },
  {
    id: 'core',
    title: 'Core inflections',
    summary: 'Practice dictionary, negative, past, and て-form together.',
    to: '/study?preset=core',
    formKey: 'past',
  },
  {
    id: 'derived',
    title: 'Derived forms',
    summary: 'Review potential, passive, causative, and causative-passive forms.',
    to: '/study?preset=derived',
    formKey: 'causative',
  },
  {
    id: 'index',
    title: 'Index',
    summary: 'Open the full verb index with compact cells and hover details.',
    to: '/index',
    formKey: null,
  },
  {
    id: 'stats',
    title: 'Stats',
    summary: 'Inspect weak forms, trouble spots, and streaks.',
    to: '/stats',
    formKey: null,
  },
  {
    id: 'settings',
    title: 'Settings',
    summary: 'Export, import, or reset local progress.',
    to: '/settings',
    formKey: null,
  },
  {
    id: 'polite',
    title: 'Polite sweep',
    summary: 'Optional ます-family exposure for reading support.',
    to: '/study?preset=polite',
    formKey: 'polite',
  },
];

function hasAttemptForForm(progressItems: Record<string, { perFormFamily: Partial<Record<FormKey, { correct: number; wrong: number }>> }>, formKey: FormKey) {
  return Object.values(progressItems).some((progress) => {
    const form = progress.perFormFamily[formKey];
    return (form?.correct ?? 0) + (form?.wrong ?? 0) > 0;
  });
}

export function OverviewPage() {
  const { progressStore } = useAppState();
  const rows = useMemo(
    () =>
      HOME_ROWS.map((row, index) => ({
        ...row,
        chapterNumber: index + 1,
        completed:
          row.formKey === null
            ? row.id === 'mixed-review'
              ? progressStore.meta.totalReviews > 0
              : false
            : hasAttemptForForm(progressStore.items, row.formKey),
        isCurrent: row.id === 'mixed-review',
      })),
    [progressStore],
  );

  return (
    <div className="linear-curriculum linear-curriculum--stacked">
      <section className="linear-curriculum__intro">
        <h1>Curriculum overview</h1>
        <p className="muted-text">
          Start with mixed review, move into narrower drills when needed, and use the index when you want to inspect
          verbs directly.
        </p>
        <p className="linear-curriculum__meta">Local progress stays in this browser.</p>
      </section>

      <section className="unit-card" aria-labelledby="home-sequence-title">
        <div className="unit-card__body">
          <div className="unit-card__head">
            <h2 id="home-sequence-title">Start here</h2>
            <div className="unit-card__meta">
              <p className="unit-card__count">{rows.length} routes</p>
            </div>
          </div>
          <ol className="unit-card__subsections" aria-label="Home sequence">
            {rows.map((row) => (
              <li
                key={row.id}
                className={[
                  'unit-card__subsection',
                  row.completed ? 'is-completed' : '',
                  row.isCurrent ? 'is-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="unit-card__rail" aria-hidden="true">
                  <span className={row.completed ? 'unit-card__status is-completed' : 'unit-card__status'}>
                    {row.completed ? '✓' : ''}
                  </span>
                  <span className="unit-card__step">{String(row.chapterNumber).padStart(3, '0')}</span>
                </div>
                <div className="unit-card__copy">
                  <h3 className="unit-card__title-row">
                    <Link className="unit-card__link" to={row.to}>
                      {row.title}
                    </Link>
                  </h3>
                  <p>{row.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
