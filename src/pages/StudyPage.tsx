import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { getInflectionExample } from '../lib/conjugation';
import { getSectionProgress } from '../lib/curriculumProgress';
import { getCurriculumSections } from '../lib/curriculum';
import { formatEnglishDefinition } from '../lib/definitions';
import { getLessonLabel, getLessonTitle } from '../lib/lessons';
import { getOrCreateProgress, previewGradeResult } from '../lib/progress';
import { matchesReadingInput } from '../lib/romaji';
import { getOverviewFocusState, parsePositiveRouteNumber } from '../lib/routes';
import { canSpeakJapanese, primeJapaneseVoices, speakJapanese } from '../lib/speech';
import { FORM_PRESETS } from '../lib/dataset';
import { formatDelayLabel } from '../lib/delayLabel';
import { createStudySnapshot, getScheduledCardForEntry, type ScheduledCard } from '../lib/scheduler';

function isTightStudyViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;

  return width <= 480 && height <= 560;
}

export function StudyPage() {
  const {
    verbs,
    catalogStatus,
    progressStore,
    settingsStore,
    ensureCurriculumSectionSession,
    recordCurriculumSectionAttempt,
    recordReview,
  } = useAppState();
  const navigate = useNavigate();
  const { sectionNumber } = useParams<{ sectionNumber?: string }>();
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [successDelayLabel, setSuccessDelayLabel] = useState<string>();
  const [revealedIsCorrect, setRevealedIsCorrect] = useState<boolean | null>(null);
  const [pendingCompletedSectionIndex, setPendingCompletedSectionIndex] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<ScheduledCard | null>(null);
  const [canSpeak, setCanSpeak] = useState(() => canSpeakJapanese());
  const [isTightViewport, setIsTightViewport] = useState(() => isTightStudyViewport());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectedSection = parsePositiveRouteNumber(sectionNumber);
  const sectionIndex = selectedSection !== null ? selectedSection - 1 : null;
  const selectedLessonLabel = selectedSection !== null ? getLessonLabel(selectedSection) : null;
  const selectedLessonTitle = selectedSection !== null ? getLessonTitle(selectedSection) : null;
  const curriculumLinkState = selectedSection !== null ? getOverviewFocusState(selectedSection) : undefined;

  useEffect(() => {
    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setSuccessDelayLabel(undefined);
    setRevealedIsCorrect(null);
    setPendingCompletedSectionIndex(null);
  }, [sectionNumber]);

  const studyVerbs = useMemo(
    () =>
      catalogStatus === 'ready' && sectionIndex !== null
        ? getCurriculumSections(verbs)[sectionIndex] ?? []
        : verbs,
    [catalogStatus, sectionIndex, verbs],
  );
  const sectionMasteryKeys = useMemo(
    () =>
      catalogStatus === 'ready' && sectionIndex !== null
        ? studyVerbs.map((entry) => entry.masteryKey)
        : [],
    [catalogStatus, sectionIndex, studyVerbs],
  );
  const sectionProgress =
    catalogStatus === 'ready' && sectionIndex !== null
      ? getSectionProgress(settingsStore.curriculum, sectionIndex, sectionMasteryKeys)
      : null;
  const sectionEntry =
    sectionIndex !== null && sectionProgress?.currentMasteryKey
      ? studyVerbs.find((entry) => entry.masteryKey === sectionProgress.currentMasteryKey) ?? null
      : null;
  const sectionCard =
    sectionEntry && sectionIndex !== null
      ? getScheduledCardForEntry(sectionEntry, progressStore, settingsStore.study)
      : null;

  const snapshot =
    catalogStatus === 'ready' && sectionIndex === null
      ? createStudySnapshot(studyVerbs, progressStore, settingsStore.study)
      : null;
  const suggestedCard = snapshot?.nextCard ?? null;
  const preferredCard = sectionIndex !== null ? sectionCard : suggestedCard;

  useEffect(() => {
    if (catalogStatus !== 'ready' || sectionIndex === null || sectionMasteryKeys.length === 0) {
      return;
    }

    ensureCurriculumSectionSession(sectionIndex, sectionMasteryKeys);
  }, [
    catalogStatus,
    ensureCurriculumSectionSession,
    sectionIndex,
    sectionMasteryKeys,
  ]);

  useEffect(() => {
    if (catalogStatus === 'ready' && selectedSection && sectionMasteryKeys.length === 0) {
      navigate('/', { replace: true });
    }
  }, [catalogStatus, navigate, sectionMasteryKeys.length, selectedSection]);

  useEffect(() => {
    if (!activeCard && preferredCard) {
      setActiveCard(preferredCard);
    }
  }, [activeCard, preferredCard]);

  useEffect(() => {
    setCanSpeak(primeJapaneseVoices());

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return undefined;
    }

    const synth = window.speechSynthesis;
    const update = () => setCanSpeak(canSpeakJapanese());

    synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleViewportChange = () => {
      setIsTightViewport(isTightStudyViewport());
    };

    handleViewportChange();
    const viewport = window.visualViewport;

    window.addEventListener('resize', handleViewportChange);
    viewport?.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      viewport?.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  if (catalogStatus !== 'ready') {
    return (
      <section className="panel stack">
        <p className="eyebrow">Next verb</p>
        <h2>Loading review workspace</h2>
        <p className="muted-text">The static verb catalog is still loading.</p>
      </section>
    );
  }

  const currentCard = activeCard ?? preferredCard;
  const example = currentCard ? getInflectionExample(currentCard.entry, currentCard.surface, currentCard.formKey) : null;
  const cleanedTypedAnswer = typedAnswer.trim();
  const acceptedJapaneseAnswers = currentCard
    ? currentCard.formKey === 'dictionary'
      ? [currentCard.surface.jp, currentCard.entry.orthography, ...currentCard.entry.alternateSpellings]
      : [currentCard.surface.jp]
    : [];
  const typedAnswerMatches = currentCard
    ? matchesReadingInput(cleanedTypedAnswer, currentCard.surface.reading, acceptedJapaneseAnswers)
    : false;
  const showEditableInput = !isRevealed || revealedIsCorrect === false;
  const requiresCorrection = isRevealed && revealedIsCorrect === false;
  const canAdvanceToNextCard = isRevealed && (!requiresCorrection || typedAnswerMatches);
  const shouldShowSurfaceDetails =
    currentCard && (currentCard.surface.jp !== currentCard.entry.orthography || currentCard.formKey !== 'dictionary');
  const completedReviewCount = Object.values(progressStore.items).reduce(
    (count, progress) => count + progress.totalCorrect,
    0,
  );
  const shouldShowInputPlaceholder = completedReviewCount < 3;

  function handleSubmit() {
    if (!currentCard || isRevealed) {
      return;
    }

    const now = new Date();
    const grade = typedAnswerMatches ? 'good' : 'again';
    const progress = getOrCreateProgress(progressStore, currentCard.entry.masteryKey, now.toISOString());
    const preview = previewGradeResult(progress, grade, now);

    if (!activeCard) {
      setActiveCard(currentCard);
    }

    recordReview(currentCard.entry.masteryKey, currentCard.formKey, grade);
    speakJapanese(currentCard.surface.reading);

    if (sectionIndex !== null) {
      const sectionResult = recordCurriculumSectionAttempt(
        sectionIndex,
        sectionMasteryKeys,
        currentCard.entry.masteryKey,
        typedAnswerMatches,
      );

      if (typedAnswerMatches && sectionResult.completed) {
        setPendingCompletedSectionIndex(sectionIndex);
      }
    }

    setSuccessDelayLabel(typedAnswerMatches ? formatDelayLabel(preview.dueAt, now) : undefined);
    setRevealedIsCorrect(typedAnswerMatches);
    setIsRevealed(true);
  }

  function handleNextVerb() {
    if (revealedIsCorrect === false && !typedAnswerMatches) {
      return;
    }

    if (pendingCompletedSectionIndex !== null) {
      navigate('/', {
        replace: true,
        state: {
          completedSectionIndex: pendingCompletedSectionIndex,
        },
      });
      return;
    }

    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setSuccessDelayLabel(undefined);
    setRevealedIsCorrect(null);
  }

  function handleHearAgain() {
    if (!currentCard) {
      return;
    }

    speakJapanese(currentCard.surface.reading);
  }

  useEffect(() => {
    if (!isRevealed || revealedIsCorrect === false) {
      inputRef.current?.focus();
    }
  }, [currentCard?.entry.id, currentCard?.formKey, isRevealed, revealedIsCorrect]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.isComposing || event.repeat) {
        return;
      }

      if (event.key === 'Enter') {
        if (isRevealed) {
          event.preventDefault();

          if (!canAdvanceToNextCard) {
            return;
          }

          handleNextVerb();
          return;
        }

        if (!currentCard) {
          return;
        }

        event.preventDefault();
        handleSubmit();
        return;
      }

      if (!isRevealed || !currentCard || !canSpeak) {
        return;
      }

      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        handleHearAgain();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canAdvanceToNextCard, canSpeak, currentCard, isRevealed, typedAnswerMatches, typedAnswer, progressStore]);

  return (
    <section className="page-stack">
      <article
        className={`study-sheet stack${isRevealed ? ' study-sheet--revealed' : ''}${isTightViewport ? ' study-sheet--tight' : ''}`}
      >
        {selectedLessonLabel ? (
          <div className="study-heading">
            <nav aria-label="Breadcrumb" className="breadcrumb breadcrumb--title">
              <Link className="breadcrumb__link" state={curriculumLinkState} to="/">
                Curriculum
              </Link>
              <span aria-hidden="true" className="breadcrumb__separator">
                &gt;
              </span>
              <span className="breadcrumb__current">
                {selectedLessonTitle ? `${selectedLessonLabel}: ${selectedLessonTitle}` : selectedLessonLabel}
              </span>
            </nav>
            <h1 className="visually-hidden">
              {selectedLessonTitle
                ? `Curriculum > ${selectedLessonLabel}: ${selectedLessonTitle}`
                : `Curriculum > ${selectedLessonLabel}`}
            </h1>
          </div>
        ) : null}

        {currentCard ? (
          <>
            <div className={`surface-block${isRevealed ? ' surface-block--revealed' : ''}`}>
              <p className="surface-form" lang="ja">
                {currentCard.surface.jp}
              </p>
              <div className="study-input-block stack-sm">
                {showEditableInput ? (
                  <>
                    <input
                      ref={inputRef}
                      aria-label="Type pronunciation here"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      className="text-input surface-response__input"
                      onChange={(event) => setTypedAnswer(event.target.value)}
                      placeholder={shouldShowInputPlaceholder ? 'Type pronunciation here' : undefined}
                      spellCheck={false}
                      type="text"
                      value={typedAnswer}
                    />
                    {!isRevealed ? (
                      <button className="block-link study-submit" onClick={handleSubmit} type="button">
                        Submit [enter]
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>

            {isRevealed ? (
              <div className="answer-panel stack">
                <div className="answer-copy stack-sm">
                  {revealedIsCorrect && successDelayLabel ? (
                    <p className="answer-line answer-line--success">
                      Correct! You&apos;ll see this again in {successDelayLabel}.
                    </p>
                  ) : null}
                  {revealedIsCorrect === false ? (
                    <p className="answer-line answer-line--error">Incorrect.</p>
                  ) : null}
                  <p className="answer-line">
                    <strong lang="ja">{currentCard.entry.orthography}</strong> - {currentCard.entry.reading} -{' '}
                    {formatEnglishDefinition(currentCard.entry, verbs)}
                  </p>
                  {shouldShowSurfaceDetails ? (
                    <p className="answer-line">
                      <strong lang="ja">{currentCard.surface.jp}</strong> - {currentCard.surface.reading}{' '}
                      ({FORM_PRESETS[currentCard.formKey].label})
                    </p>
                  ) : null}
                  {example ? (
                    <>
                      <p className="answer-line answer-line--example" lang="ja">
                        {example.japanese}
                      </p>
                      <p className="answer-note answer-note--translation">{example.english}</p>
                    </>
                  ) : null}
                </div>
                <div className="study-actions">
                  <button
                    className="ghost-link study-secondary-button"
                    disabled={!canSpeak}
                    onClick={handleHearAgain}
                    type="button"
                  >
                    Hear again [space]
                  </button>
                  <button
                    className="block-link study-submit"
                    disabled={!canAdvanceToNextCard}
                    onClick={handleNextVerb}
                    type="button"
                  >
                    Next verb [enter]
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : sectionIndex !== null ? (
          <div className="stack">
            <h3>Loading lesson stack</h3>
            <p className="muted-text">Restoring your saved progress for this lesson.</p>
          </div>
        ) : (
          <div className="stack">
            <p className="eyebrow">No matching cards</p>
            <h3>No cards are ready right now.</h3>
            <p className="muted-text">Keep going from the curriculum and the adaptive queue will reopen as items come due.</p>
          </div>
        )}
      </article>
    </section>
  );
}
