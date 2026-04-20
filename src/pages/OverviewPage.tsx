import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSectionProgress } from '../lib/curriculumProgress';
import { getCurriculumSections } from '../lib/curriculum';
import { useAppState } from '../app/AppState';

function CheckIcon({ animate = false }: { animate?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={animate ? 'unit-card__status-icon unit-card__status-icon--animated' : 'unit-card__status-icon'}
      viewBox="0 0 24 24"
    >
      <path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
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
  const { verbs, settingsStore, catalogStatus } = useAppState();
  const [searchParams] = useSearchParams();
  const [celebratingSectionIndex, setCelebratingSectionIndex] = useState<number | null>(null);
  const sectionRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const completedSectionParam = searchParams.get('completedSection');
  const completedSectionIndex = completedSectionParam ? Number.parseInt(completedSectionParam, 10) - 1 : null;
  const sections = useMemo(() => {
    if (catalogStatus !== 'ready') {
      return [];
    }

    const chunks = getCurriculumSections(verbs);

    const withCounts = chunks.map((entries, index) => {
      const masteryKeys = entries.map((entry) => entry.masteryKey);
      const sectionProgress = getSectionProgress(settingsStore.curriculum, index, masteryKeys);

      return {
        id: `section-${index + 1}`,
        index,
        entries,
        completedCount: sectionProgress.completedCount,
        completed: sectionProgress.completed,
        activeSession: sectionProgress.activeSession,
      };
    });

    const furthestCompletedIndex = withCounts.reduce(
      (highest, section) => (section.completed ? section.index : highest),
      -1,
    );
    const activeSessionIndex = withCounts.findIndex((section) => section.activeSession && !section.completed);
    const currentIndex =
      activeSessionIndex !== -1
        ? activeSessionIndex
        : withCounts.findIndex((section) => !section.completed && section.index >= furthestCompletedIndex + 1);

    return withCounts.map((section) => {
      const skipped = !section.completed && section.completedCount === 0 && section.index < furthestCompletedIndex;

      return {
        ...section,
        skipped,
        isCurrent: currentIndex === section.index,
        preview: section.entries.slice(0, 3).map((entry) => entry.orthography).join(' / '),
      };
    });
  }, [catalogStatus, settingsStore.curriculum, verbs]);

  useLayoutEffect(() => {
    if (completedSectionIndex === null || completedSectionIndex < 0) {
      return;
    }

    const targetSection = sectionRefs.current[completedSectionIndex];

    if (!targetSection || typeof window === 'undefined') {
      return;
    }

    const { top, height } = targetSection.getBoundingClientRect();
    const targetTop = window.scrollY + top - window.innerHeight / 2 + height / 2;
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    window.scrollTo({
      top: Math.max(0, Math.min(targetTop, maxScrollTop)),
      left: 0,
      behavior: 'auto',
    });
    setCelebratingSectionIndex(completedSectionIndex);

    const timeoutId = window.setTimeout(() => {
      setCelebratingSectionIndex((current) => (current === completedSectionIndex ? null : current));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [completedSectionIndex, sections.length]);

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
                ref={(node) => {
                  sectionRefs.current[section.index] = node;
                }}
                className={[
                  'unit-card__subsection',
                  section.completed ? 'is-completed' : '',
                  section.skipped ? 'is-skipped' : '',
                  section.isCurrent ? 'is-current' : '',
                  celebratingSectionIndex === section.index ? 'is-celebrating' : '',
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
                    {section.completed ? <CheckIcon animate={celebratingSectionIndex === section.index} /> : section.skipped ? <SkipIcon /> : null}
                    {celebratingSectionIndex === section.index ? (
                      <span className="unit-card__confetti" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, confettiIndex) => (
                          <span
                            className={`unit-card__confetti-piece unit-card__confetti-piece--${(confettiIndex % 5) + 1}`}
                            key={`${section.id}-confetti-${confettiIndex}`}
                          />
                        ))}
                      </span>
                    ) : null}
                  </span>
                  <span className="unit-card__step">{String(section.index + 1).padStart(3, '0')}</span>
                </div>
                <div className="unit-card__copy">
                  <h3 className="unit-card__title-row">
                    <Link className="unit-card__link" to={`/study?section=${section.index + 1}`}>
                      Section {String(section.index + 1).padStart(3, '0')}
                    </Link>
                    {section.completed ? <span className="unit-card__badge">Completed</span> : null}
                    {section.skipped ? <span className="unit-card__badge">Skipped</span> : null}
                  </h3>
                  <p>{section.preview}</p>
                  <p className="unit-card__progress-copy">
                    {section.completedCount}/{section.entries.length} cards cleared
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
