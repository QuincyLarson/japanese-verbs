import { FORM_ORDER } from './dataset';
import { STARTER_PRIORITY } from './curriculum';
import { resolveFormSelection } from './filters';
import {
  getOrCreateProgress,
  getWeaknessScore,
  hasRecentMistake,
  isBurned,
  isDue,
  isNewVerb,
} from './progress';
import type { ProgressStore, ReviewProgress, StudySettings } from '../types/study';
import type { FormKey, SurfaceForm, VerbEntry } from '../types/verb';

export interface ScheduledCard {
  entry: VerbEntry;
  formKey: FormKey;
  surface: SurfaceForm;
  verbScore: number;
  formScore: number;
  reasons: string[];
}

export interface StudySnapshot {
  counts: {
    due: number;
    introduced: number;
    new: number;
    burned: number;
    weak: number;
    recentMistakes: number;
    eligible: number;
  };
  activeForms: FormKey[];
  nextCard: ScheduledCard | null;
}

function getStarterBias(entry: VerbEntry, totalReviews: number) {
  if (totalReviews >= 24) {
    return 0;
  }

  const priorityIndex = STARTER_PRIORITY.indexOf(entry.masteryKey as (typeof STARTER_PRIORITY)[number]);

  if (priorityIndex === -1) {
    return entry.orthography === '居る' ? -26 : 0;
  }

  return 26 - priorityIndex;
}

function hashSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickCandidateFromWindow(candidates: ScheduledCard[], seed: string) {
  if (candidates.length === 0) {
    return null;
  }

  const topScore = candidates[0].verbScore;
  const window = candidates
    .filter((candidate) => candidate.verbScore >= topScore - 8)
    .slice(0, 8);

  return window[hashSeed(seed) % window.length] ?? candidates[0];
}

function getFormScore(progress: ReviewProgress, formKey: FormKey, now: Date): number {
  const formState = progress.perFormFamily[formKey];

  if (!formState) {
    return 12;
  }

  const daysSinceSeen = formState.lastSeenAt
    ? Math.min((now.getTime() - Date.parse(formState.lastSeenAt)) / (24 * 60 * 60 * 1000), 14)
    : 14;

  return (
    formState.wrong * 6 +
    formState.difficultyWeight * 5 +
    daysSinceSeen +
    (formState.correct === 0 ? 4 : 0)
  );
}

function sortForms(
  entry: VerbEntry,
  progress: ReviewProgress,
  activeForms: FormKey[],
  now: Date,
): Array<{ formKey: FormKey; surface: SurfaceForm; score: number }> {
  return activeForms
    .filter((formKey) => entry.allowedInflections.includes(formKey))
    .map((formKey) => {
      const surface = entry.forms[formKey];

      if (!surface) {
        return null;
      }

      return {
        formKey,
        surface,
        score: getFormScore(progress, formKey, now),
      };
    })
    .filter((value): value is { formKey: FormKey; surface: SurfaceForm; score: number } => value !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return FORM_ORDER.indexOf(left.formKey) - FORM_ORDER.indexOf(right.formKey);
    });
}

function matchesPoolMode(progress: ReviewProgress | undefined, poolMode: StudySettings['poolMode']): boolean {
  if (poolMode === 'mixed') {
    return true;
  }

  if (poolMode === 'new-only') {
    return isNewVerb(progress);
  }

  return !isNewVerb(progress);
}

function matchesDeckSlice(
  progress: ReviewProgress | undefined,
  deckSlice: StudySettings['deckSlice'],
  now: Date,
): boolean {
  if (!progress) {
    return deckSlice === 'due-and-new' || deckSlice === 'burned-hidden';
  }

  if (deckSlice === 'due-and-new') {
    return isDue(progress, now) || isNewVerb(progress);
  }

  if (deckSlice === 'due-only') {
    return isDue(progress, now);
  }

  if (deckSlice === 'burned-hidden') {
    return !isBurned(progress);
  }

  if (deckSlice === 'burned-only') {
    return isBurned(progress);
  }

  if (deckSlice === 'weak') {
    return getWeaknessScore(progress) >= 0.45;
  }

  return hasRecentMistake(progress, now);
}

function getVerbScore(
  entry: VerbEntry,
  progress: ReviewProgress,
  now: Date,
  formBias: number,
  totalReviews: number,
): number {
  const isNew = isNewVerb(progress);
  const overdueDays = Math.max(0, (now.getTime() - Date.parse(progress.dueAt)) / (24 * 60 * 60 * 1000));
  const dueBias = !isNew && isDue(progress, now) ? 140 + overdueDays * 8 : 0;
  const newBias = isNew ? 40 : 0;
  const weakBias = getWeaknessScore(progress) * 45;
  const mistakeBias = hasRecentMistake(progress, now) ? 32 : 0;
  const rankBias = Math.max(0, 18 - entry.bccwjRank / 300);
  const starterBias = isNew ? getStarterBias(entry, totalReviews) : 0;

  return dueBias + newBias + weakBias + mistakeBias + rankBias + formBias + starterBias;
}

export function createStudySnapshot(
  verbs: VerbEntry[],
  progressStore: ProgressStore,
  settings: StudySettings,
  now = new Date(),
): StudySnapshot {
  const activeForms = resolveFormSelection(settings);
  let due = 0;
  let introduced = 0;
  let newCount = 0;
  let burned = 0;
  let weak = 0;
  let recentMistakes = 0;
  const candidates: ScheduledCard[] = [];

  for (const entry of verbs) {
    const progress = progressStore.items[entry.masteryKey];

    if (progress) {
      introduced += progress.totalSeen > 0 ? 1 : 0;
      due += isDue(progress, now) ? 1 : 0;
      burned += isBurned(progress) ? 1 : 0;
      weak += getWeaknessScore(progress) >= 0.45 ? 1 : 0;
      recentMistakes += hasRecentMistake(progress, now) ? 1 : 0;
    } else {
      newCount += 1;
    }

    if (!matchesPoolMode(progress, settings.poolMode) || !matchesDeckSlice(progress, settings.deckSlice, now)) {
      continue;
    }

    const baseline = getOrCreateProgress(progressStore, entry.masteryKey, now.toISOString());
    const forms = sortForms(entry, baseline, activeForms, now);

    if (forms.length === 0) {
      continue;
    }

    const selectedForm = forms[0];
    const verbScore = getVerbScore(
      entry,
      baseline,
      now,
      selectedForm.score,
      progressStore.meta.totalReviews,
    );
    const isNew = isNewVerb(progress);
    const reasons = [
      isNew ? 'new verb' : 'existing review',
      isNew ? 'ready to introduce' : isDue(baseline, now) ? 'due now' : 'scheduled later',
      `focus form: ${selectedForm.formKey}`,
    ];

    candidates.push({
      entry,
      formKey: selectedForm.formKey,
      surface: selectedForm.surface,
      verbScore,
      formScore: selectedForm.score,
      reasons,
    });
  }

  candidates.sort((left, right) => {
    if (right.verbScore !== left.verbScore) {
      return right.verbScore - left.verbScore;
    }

    if (right.formScore !== left.formScore) {
      return right.formScore - left.formScore;
    }

    return left.entry.bccwjRank - right.entry.bccwjRank;
  });

  const seed = `${now.toISOString().slice(0, 10)}:${progressStore.meta.totalReviews}:${settings.formPresetId}:${settings.poolMode}:${settings.deckSlice}`;

  return {
    counts: {
      due,
      introduced,
      new: newCount,
      burned,
      weak,
      recentMistakes,
      eligible: candidates.length,
    },
    activeForms,
    nextCard: pickCandidateFromWindow(candidates, seed),
  };
}
