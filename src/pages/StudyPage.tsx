import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { getInflectionExplanation } from '../lib/conjugation';
import { getSectionProgress } from '../lib/curriculumProgress';
import { getCurriculumSections } from '../lib/curriculum';
import { getPresetFromSearchParam } from '../lib/filters';
import { getOrCreateProgress, previewGradeResult } from '../lib/progress';
import { matchesReadingInput } from '../lib/romaji';
import { canSpeakJapanese, primeJapaneseVoices, speakJapanese } from '../lib/speech';
import { FORM_PRESETS } from '../lib/dataset';
import { createStudySnapshot, getScheduledCardForEntry, type ScheduledCard } from '../lib/scheduler';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDelayLabel(dueAt: string, now: Date) {
  const diffMs = Math.max(0, Date.parse(dueAt) - now.getTime());

  if (diffMs < DAY_MS) {
    const minutes = Math.max(1, Math.round(diffMs / (60 * 1000)));

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }

    const hours = Math.round(diffMs / (60 * 60 * 1000));
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = diffMs / DAY_MS;
  const roundedDays = days < 10 ? Math.round(days * 10) / 10 : Math.round(days);
  return `${roundedDays} day${roundedDays === 1 ? '' : 's'}`;
}

export function StudyPage() {
  const {
    verbs,
    catalogStatus,
    progressStore,
    settingsStore,
    applyStudyPreset,
    ensureCurriculumSectionSession,
    recordCurriculumSectionAttempt,
    recordReview,
  } = useAppState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [successDelayLabel, setSuccessDelayLabel] = useState<string>();
  const [activeCard, setActiveCard] = useState<ScheduledCard | null>(null);
  const [canSpeak, setCanSpeak] = useState(() => canSpeakJapanese());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const presetFromUrl = getPresetFromSearchParam(searchParams.get('preset'));
  const sectionParam = searchParams.get('section');
  const selectedSection = sectionParam ? Number.parseInt(sectionParam, 10) : null;
  const sectionIndex = selectedSection && Number.isFinite(selectedSection) && selectedSection > 0 ? selectedSection - 1 : null;

  useEffect(() => {
    if (presetFromUrl) {
      applyStudyPreset(presetFromUrl);
    }
    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setSuccessDelayLabel(undefined);
  }, [presetFromUrl, sectionParam]);

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
  const explanation = currentCard
    ? getInflectionExplanation(currentCard.formKey, currentCard.entry.englishPrimary)
    : [];
  const cleanedTypedAnswer = typedAnswer.trim();
  const typedAnswerMatches = currentCard ? matchesReadingInput(cleanedTypedAnswer, currentCard.surface.reading) : false;
  const guessedLabel = cleanedTypedAnswer || 'nothing';
  const shouldShowSurfaceDetails =
    currentCard && (currentCard.surface.jp !== currentCard.entry.orthography || currentCard.formKey !== 'dictionary');

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
        navigate(`/?completedSection=${sectionIndex + 1}`, { replace: true });
        return;
      }
    }

    setSuccessDelayLabel(typedAnswerMatches ? formatDelayLabel(preview.dueAt, now) : undefined);
    setIsRevealed(true);
  }

  function handleNextVerb() {
    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setSuccessDelayLabel(undefined);
  }

  function handleHearAgain() {
    if (!currentCard) {
      return;
    }

    speakJapanese(currentCard.surface.reading);
  }

  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus();
    }
  }, [currentCard?.entry.id, currentCard?.formKey, isRevealed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.isComposing || event.repeat) {
        return;
      }

      if (event.key === 'Enter') {
        if (isRevealed) {
          event.preventDefault();
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
  }, [canSpeak, currentCard, isRevealed, typedAnswerMatches, typedAnswer, progressStore]);

  return (
    <section className="page-stack">
      <article className={`study-sheet stack${isRevealed ? ' study-sheet--revealed' : ''}`}>
        {selectedSection && Number.isFinite(selectedSection) ? (
          <p className="eyebrow">Section {String(selectedSection).padStart(3, '0')}</p>
        ) : null}

        {currentCard ? (
          <>
            <div className={`surface-block${isRevealed ? ' surface-block--revealed' : ''}`}>
              <p className={`surface-form${isRevealed ? ' surface-form--revealed' : ''}`} lang="ja">
                {currentCard.surface.jp}
              </p>
              <div className="study-input-block stack-sm">
                {!isRevealed ? (
                  <>
                    <input
                      ref={inputRef}
                      aria-label="Type pronunciation here"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      className="text-input surface-response__input"
                      onChange={(event) => setTypedAnswer(event.target.value)}
                      placeholder="Type pronunciation here"
                      spellCheck={false}
                      type="text"
                      value={typedAnswer}
                    />
                    <button className="block-link study-submit" onClick={handleSubmit} type="button">
                      Submit [enter]
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {isRevealed ? (
              <div className="answer-panel stack">
                <div className="answer-copy stack-sm">
                  <p className="answer-line">
                    <strong lang="ja">{currentCard.entry.orthography}</strong> - {currentCard.entry.reading} -{' '}
                    {currentCard.entry.englishPrimary}
                  </p>
                  {shouldShowSurfaceDetails ? (
                    <p className="answer-line">
                      <strong lang="ja">{currentCard.surface.jp}</strong> - {currentCard.surface.reading}{' '}
                      ({FORM_PRESETS[currentCard.formKey].label})
                    </p>
                  ) : null}
                  {typedAnswerMatches && successDelayLabel ? (
                    <p className="answer-line answer-line--success">
                      Correct! You&apos;ll see this again in {successDelayLabel}.
                    </p>
                  ) : null}
                  {!typedAnswerMatches ? (
                    <p className="answer-line answer-line--error">
                      Incorrect. You guessed <strong>{guessedLabel}</strong>.
                    </p>
                  ) : null}
                  {!typedAnswerMatches ? (
                    <p className="answer-line">
                      Correct reading: <strong lang="ja">{currentCard.surface.reading}</strong>
                    </p>
                  ) : null}
                  {explanation.map((line) => (
                    <p className="answer-note" key={line}>
                      {line}
                    </p>
                  ))}
                  {currentCard.entry.inflectionNotes.map((note) => (
                    <p className="answer-note" key={note}>
                      {note}
                    </p>
                  ))}
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
                  <button className="block-link study-submit" onClick={handleNextVerb} type="button">
                    Next verb [enter]
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : sectionIndex !== null ? (
          <div className="stack">
            <p className="eyebrow">Section {String(selectedSection).padStart(3, '0')}</p>
            <h3>Loading section stack</h3>
            <p className="muted-text">Restoring your saved progress for this section.</p>
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
