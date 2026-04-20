import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSectionProgress } from '../lib/curriculumProgress';
import { getCurriculumSections } from '../lib/curriculum';
import { getLessonLabel } from '../lib/lessons';
import { getCompletedSectionIndexFromNavigationState, getSectionStudyPath } from '../lib/routes';
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
  const location = useLocation();
  const navigate = useNavigate();
  const [celebratingSectionIndex, setCelebratingSectionIndex] = useState<number | null>(null);
  const sectionRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const completedSectionIndex = getCompletedSectionIndexFromNavigationState(location.state);
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
  const selectedSection = useMemo(
    () => sections.find((section) => section.isCurrent) ?? sections.find((section) => !section.completed) ?? sections[0] ?? null,
    [sections],
  );

  useEffect(() => {
    if (!selectedSection) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== 'Enter' ||
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.repeat
      ) {
        return;
      }

      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName))
      ) {
        return;
      }

      event.preventDefault();
      navigate(getSectionStudyPath(selectedSection.index + 1));
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, selectedSection]);

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
    navigate(location.pathname, { replace: true, state: null });

    const timeoutId = window.setTimeout(() => {
      setCelebratingSectionIndex((current) => (current === completedSectionIndex ? null : current));
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [completedSectionIndex, location.pathname, navigate, sections.length]);

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
        <p className="linear-curriculum__meta">Each lesson contains 10 verbs. Completed lessons are checked off.</p>
        <Link className="block-link curriculum-start" to="/study">
          Next verb
        </Link>
      </section>

      <section className="unit-card" aria-labelledby="home-sequence-title">
        <div className="unit-card__body">
          <div className="unit-card__head">
            <h2 id="home-sequence-title">Curriculum</h2>
            <div className="unit-card__meta">
              <p className="unit-card__count">{sections.length} lessons</p>
            </div>
          </div>
          <ol className="unit-card__subsections" aria-label="Curriculum lessons">
            {sections.map((section) => {
              const lessonPath = getSectionStudyPath(section.index + 1);

              return (
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
                    <span className="unit-card__step">{section.index + 1}</span>
                  </div>
                  <div className="unit-card__copy">
                    <h3 className="unit-card__title-row">
                      <Link className="unit-card__link" to={lessonPath}>
                        {getLessonLabel(section.index + 1)}
                      </Link>
                      {section.completed ? <span className="unit-card__badge">Completed</span> : null}
                      {section.skipped ? <span className="unit-card__badge">Skipped</span> : null}
                      {section.isCurrent ? <span className="unit-card__badge unit-card__badge--current">You are here</span> : null}
                    </h3>
                    <p>{section.preview}</p>
                    <p className="unit-card__progress-copy">
                      {section.completedCount}/{section.entries.length} cards cleared
                    </p>
                    {section.isCurrent ? (
                      <Link className="block-link unit-card__start-link" to={lessonPath}>
                        Start Lesson [enter]
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}
