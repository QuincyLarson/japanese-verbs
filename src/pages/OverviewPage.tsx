import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CURRICULUM_SECTION_SIZE, orderVerbsForCurriculum } from '../lib/curriculum';
import { useAppState } from '../app/AppState';

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="unit-card__status-icon" viewBox="0 0 24 24">
      <path d="M5 12.5 9.5 17 19 7.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg aria-hidden="true" className="unit-card__status-icon" viewBox="0 0 24 24">
      <path d="M5 16c0-5.8 4.6-10 9.5-10S24 10.2 24 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      <path d="M18 16h6v6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="m24 22-4.8-4.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

export function OverviewPage() {
  const { verbs, progressStore, catalogStatus } = useAppState();
  const sections = useMemo(() => {
    if (catalogStatus !== 'ready') {
      return [];
    }

    const ordered = orderVerbsForCurriculum(verbs);
    const chunks = Array.from({ length: Math.ceil(ordered.length / CURRICULUM_SECTION_SIZE) }, (_, index) =>
      ordered.slice(index * CURRICULUM_SECTION_SIZE, (index + 1) * CURRICULUM_SECTION_SIZE),
    ).filter((chunk) => chunk.length > 0);

    const withCounts = chunks.map((entries, index) => {
      const seenCount = entries.filter((entry) => (progressStore.items[entry.masteryKey]?.totalSeen ?? 0) > 0).length;

      return {
        id: `section-${index + 1}`,
        index,
        entries,
        seenCount,
        completed: seenCount === entries.length,
      };
    });

    const furthestSeenIndex = withCounts.reduce((highest, section) => (section.seenCount > 0 ? section.index : highest), -1);
    const currentIndex = withCounts.findIndex((section) => !section.completed && !(section.seenCount === 0 && section.index < furthestSeenIndex));

    return withCounts.map((section) => {
      const skipped = !section.completed && section.seenCount === 0 && section.index < furthestSeenIndex;

      return {
        ...section,
        skipped,
        isCurrent: currentIndex === section.index,
        preview: section.entries.slice(0, 3).map((entry) => entry.orthography).join(' / '),
      };
    });
  }, [catalogStatus, progressStore, verbs]);

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Curriculum</p>
        <h2>Loading curriculum</h2>
      </section>
    );
  }

  return (
    <div className="linear-curriculum linear-curriculum--stacked">
      <section className="linear-curriculum__intro">
        <h1>Curriculum overview</h1>
        <p className="muted-text">
          Our curriculum is adaptive. Start typing the pronunciation and the deck will adapt to your current
          proficiency level and give you harder verbs as you improve.
        </p>
        <p className="linear-curriculum__meta">Each section contains 10 verbs. Completed sections are checked off.</p>
        <Link className="block-link curriculum-start" to="/study">
          Next verb
        </Link>
      </section>

      <section className="unit-card" aria-labelledby="home-sequence-title">
        <div className="unit-card__body">
          <div className="unit-card__head">
            <h2 id="home-sequence-title">Curriculum</h2>
            <div className="unit-card__meta">
              <p className="unit-card__count">{sections.length} sections</p>
            </div>
          </div>
          <ol className="unit-card__subsections" aria-label="Curriculum sections">
            {sections.map((section) => (
              <li
                key={section.id}
                className={[
                  'unit-card__subsection',
                  section.completed ? 'is-completed' : '',
                  section.skipped ? 'is-skipped' : '',
                  section.isCurrent ? 'is-current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="unit-card__rail" aria-hidden="true">
                  <span
                    className={[
                      'unit-card__status',
                      section.completed ? 'is-completed' : '',
                      section.skipped ? 'is-skipped' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {section.completed ? <CheckIcon /> : section.skipped ? <SkipIcon /> : null}
                  </span>
                  <span className="unit-card__step">{String(section.index + 1).padStart(3, '0')}</span>
                </div>
                <div className="unit-card__copy">
                  <h3 className="unit-card__title-row">
                    <span>Section {String(section.index + 1).padStart(3, '0')}</span>
                    {section.completed ? <span className="unit-card__badge">Completed</span> : null}
                    {section.skipped ? <span className="unit-card__badge">Skipped</span> : null}
                  </h3>
                  <p>{section.preview}</p>
                  <p className="unit-card__progress-copy">
                    {section.seenCount}/{section.entries.length} cards seen
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
