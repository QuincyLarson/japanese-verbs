import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { getInflectionExplanation } from '../lib/conjugation';
import { getCurriculumSections } from '../lib/curriculum';
import { getPresetFromSearchParam } from '../lib/filters';
import { getOrCreateProgress, previewGradeResult } from '../lib/progress';
import { matchesReadingInput } from '../lib/romaji';
import { canSpeakJapanese, speakJapanese } from '../lib/speech';
import { FORM_PRESETS } from '../lib/dataset';
import { createStudySnapshot, type ScheduledCard } from '../lib/scheduler';

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
  const { verbs, catalogStatus, progressStore, settingsStore, applyStudyPreset, recordReview } = useAppState();
  const [searchParams] = useSearchParams();
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string>();
  const [activeCard, setActiveCard] = useState<ScheduledCard | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const presetFromUrl = getPresetFromSearchParam(searchParams.get('preset'));
  const sectionParam = searchParams.get('section');
  const selectedSection = sectionParam ? Number.parseInt(sectionParam, 10) : null;

  useEffect(() => {
    if (presetFromUrl) {
      applyStudyPreset(presetFromUrl);
    }
    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setReviewFeedback(undefined);
  }, [presetFromUrl, sectionParam]);

  const studyVerbs =
    catalogStatus === 'ready' && selectedSection && Number.isFinite(selectedSection) && selectedSection > 0
      ? getCurriculumSections(verbs)[selectedSection - 1] ?? verbs
      : verbs;

  const snapshot =
    catalogStatus === 'ready'
      ? createStudySnapshot(studyVerbs, progressStore, settingsStore.study)
      : null;
  const suggestedCard = snapshot?.nextCard ?? null;

  useEffect(() => {
    if (!activeCard && suggestedCard) {
      setActiveCard(suggestedCard);
    }
  }, [activeCard, suggestedCard]);

  useEffect(() => {
    setCanSpeak(canSpeakJapanese());

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

  const currentCard = activeCard ?? suggestedCard;
  const explanation = currentCard
    ? getInflectionExplanation(currentCard.formKey, currentCard.entry.englishPrimary)
    : [];
  const cleanedTypedAnswer = typedAnswer.trim();
  const typedAnswerMatches = currentCard ? matchesReadingInput(cleanedTypedAnswer, currentCard.surface.reading) : false;
  const showPronunciationHint = progressStore.meta.totalReviews < 4;
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
    setReviewFeedback(
      typedAnswerMatches
        ? `Awesome. You'll see it in ${formatDelayLabel(preview.dueAt, now)}.`
        : `No worries. You'll see it again in ${formatDelayLabel(preview.dueAt, now)}.`,
    );
    setIsRevealed(true);
  }

  function handleNextVerb() {
    setActiveCard(null);
    setIsRevealed(false);
    setTypedAnswer('');
    setReviewFeedback(undefined);
  }

  useEffect(() => {
    if (!isRevealed) {
      inputRef.current?.focus();
    }
  }, [currentCard?.entry.id, currentCard?.formKey, isRevealed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.isComposing) {
        return;
      }

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
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCard, isRevealed, typedAnswerMatches, typedAnswer, progressStore]);

  return (
    <section className="page-stack">
      <article className="study-sheet stack">
        {selectedSection && Number.isFinite(selectedSection) ? (
          <p className="eyebrow">Section {String(selectedSection).padStart(3, '0')}</p>
        ) : null}

        {currentCard ? (
          <>
            <div className="surface-block">
              <p className="surface-form" lang="ja">
                {currentCard.surface.jp}
              </p>
              <div className="study-input-block stack-sm">
                {showPronunciationHint ? (
                  <p className="helper-note">
                    Our curriculum is adaptive. Just start typing the pronunciation and we&apos;ll adapt to your current
                    proficiency level and give you harder verbs.
                  </p>
                ) : null}
                {!isRevealed ? (
                  <>
                    <input
                      ref={inputRef}
                      aria-label="Type the pronunciation in romaji or hiragana"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      className="text-input surface-response__input"
                      onChange={(event) => setTypedAnswer(event.target.value)}
                      placeholder={showPronunciationHint ? 'type the pronunciation' : ''}
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
                  {cleanedTypedAnswer ? (
                    <p className={`answer-line${typedAnswerMatches ? ' answer-line--success' : ''}`}>
                      Your reading: <strong>{cleanedTypedAnswer}</strong>
                      {typedAnswerMatches ? ' matched the expected reading.' : ''}
                    </p>
                  ) : null}
                  {cleanedTypedAnswer && !typedAnswerMatches ? (
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
                    onClick={() => speakJapanese(currentCard.surface.reading)}
                    type="button"
                  >
                    Hear again
                  </button>
                  {reviewFeedback ? (
                    <p aria-live="polite" className="review-feedback" role="status">
                      {reviewFeedback}
                    </p>
                  ) : null}
                  <button className="block-link study-submit" onClick={handleNextVerb} type="button">
                    Next verb [enter]
                  </button>
                </div>
              </div>
            ) : null}
          </>
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
