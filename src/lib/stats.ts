import { FORM_ORDER, FORM_PRESETS } from './dataset';
import { getAccuracy, getWeaknessScore, hasRecentMistake, isBurned, isDue } from './progress';
import { kanaToRomaji, normalizeLatinSearch } from './romaji';
import type { ProgressStore } from '../types/study';
import type { FormKey, VerbEntry } from '../types/verb';

export interface OverviewStats {
  introduced: number;
  burned: number;
  due: number;
  new: number;
  weak: number;
  recentMistakes: number;
  accuracy: number;
  totalReviews: number;
  currentStreak: number;
  bestStreak: number;
}

export function calculateOverviewStats(
  verbs: VerbEntry[],
  progressStore: ProgressStore,
  now = new Date(),
): OverviewStats {
  let introduced = 0;
  let burned = 0;
  let due = 0;
  let newCount = 0;
  let weak = 0;
  let recentMistakes = 0;
  let totalSeen = 0;
  let totalCorrect = 0;

  for (const entry of verbs) {
    const progress = progressStore.items[entry.masteryKey];

    if (!progress || progress.totalSeen === 0) {
      newCount += 1;
      continue;
    }

    introduced += 1;
    burned += isBurned(progress) ? 1 : 0;
    due += isDue(progress, now) ? 1 : 0;
    weak += getWeaknessScore(progress) >= 0.45 ? 1 : 0;
    recentMistakes += hasRecentMistake(progress, now) ? 1 : 0;
    totalSeen += progress.totalSeen;
    totalCorrect += progress.totalCorrect;
  }

  return {
    introduced,
    burned,
    due,
    new: newCount,
    weak,
    recentMistakes,
    accuracy: totalSeen === 0 ? 0 : totalCorrect / totalSeen,
    totalReviews: progressStore.meta.totalReviews,
    currentStreak: progressStore.meta.currentStreak,
    bestStreak: progressStore.meta.bestStreak,
  };
}

export function calculateFormFamilyStats(verbs: VerbEntry[], progressStore: ProgressStore) {
  return FORM_ORDER.map((formKey) => {
    let correct = 0;
    let wrong = 0;
    let verbsSeen = 0;
    let difficultyWeight = 0;

    for (const entry of verbs) {
      const progress = progressStore.items[entry.masteryKey];
      const formState = progress?.perFormFamily[formKey];

      if (!formState) {
        continue;
      }

      correct += formState.correct;
      wrong += formState.wrong;
      verbsSeen += 1;
      difficultyWeight += formState.difficultyWeight;
    }

    const attempts = correct + wrong;

    return {
      formKey,
      label: FORM_PRESETS[formKey].label,
      attempts,
      accuracy: attempts === 0 ? 0 : correct / attempts,
      verbsSeen,
      difficultyWeight,
    };
  }).filter((row) => row.attempts > 0);
}

export function calculateTePatternStats(verbs: VerbEntry[], progressStore: ProgressStore) {
  const buckets = new Map<
    string,
    {
      attempts: number;
      correct: number;
      wrong: number;
    }
  >();

  for (const entry of verbs) {
    const progress = progressStore.items[entry.masteryKey];
    const teProgress = progress?.perFormFamily.te;

    if (!teProgress) {
      continue;
    }

    const bucket = buckets.get(entry.teFormPattern) ?? {
      attempts: 0,
      correct: 0,
      wrong: 0,
    };

    bucket.correct += teProgress.correct;
    bucket.wrong += teProgress.wrong;
    bucket.attempts += teProgress.correct + teProgress.wrong;
    buckets.set(entry.teFormPattern, bucket);
  }

  return Array.from(buckets.entries())
    .map(([pattern, value]) => ({
      pattern,
      attempts: value.attempts,
      accuracy: value.attempts === 0 ? 0 : value.correct / value.attempts,
    }))
    .sort((left, right) => left.accuracy - right.accuracy);
}

export function listWeakestVerbs(verbs: VerbEntry[], progressStore: ProgressStore, limit = 8) {
  return verbs
    .map((entry) => {
      const progress = progressStore.items[entry.masteryKey];
      return {
        entry,
        progress,
        score: getWeaknessScore(progress),
      };
    })
    .filter((item) => item.progress && item.progress.totalSeen > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.entry.bccwjRank - right.entry.bccwjRank;
    })
    .slice(0, limit);
}

export function searchVerbs(verbs: VerbEntry[], query: string): VerbEntry[] {
  const trimmed = query.trim().toLowerCase();
  const normalizedLatin = normalizeLatinSearch(query);

  if (!trimmed) {
    return verbs;
  }

  return verbs.filter((entry) => {
    const directHaystacks = [
      entry.orthography,
      entry.reading,
      entry.englishPrimary,
      entry.englishGlosses.join(' '),
      entry.alternateSpellings.join(' '),
      entry.sameSpellingOtherReadings.map((reading) => reading.reading).join(' '),
    ];

    if (directHaystacks.some((value) => value.toLowerCase().includes(trimmed))) {
      return true;
    }

    if (!normalizedLatin) {
      return false;
    }

    const romanizedHaystacks = [
      entry.reading,
      ...entry.sameSpellingOtherReadings.map((reading) => reading.reading),
    ]
      .map((value) => normalizeLatinSearch(kanaToRomaji(value)))
      .filter(Boolean);

    return romanizedHaystacks.some((value) => value.includes(normalizedLatin));
  });
}

export function getFormLabel(formKey: FormKey) {
  return FORM_PRESETS[formKey].label;
}
