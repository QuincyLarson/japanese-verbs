import type { Grade, ProgressStore, ReviewProgress } from '../types/study';
import type { FormKey } from '../types/verb';

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const STORE_VERSION = 1;

export function createEmptyProgressStore(): ProgressStore {
  return {
    version: STORE_VERSION,
    items: {},
    meta: {
      currentStreak: 0,
      bestStreak: 0,
      totalReviews: 0,
    },
  };
}

export function createReviewProgress(nowIso: string): ReviewProgress {
  return {
    dueAt: nowIso,
    intervalDays: 0,
    ease: 2.3,
    streak: 0,
    lapses: 0,
    totalSeen: 0,
    totalCorrect: 0,
    introducedAt: nowIso,
    perFormFamily: {},
  };
}

export function getOrCreateProgress(
  store: ProgressStore,
  masteryKey: string,
  nowIso: string,
): ReviewProgress {
  return store.items[masteryKey] ?? createReviewProgress(nowIso);
}

export function isNewVerb(progress?: ReviewProgress): boolean {
  return !progress || progress.totalSeen === 0;
}

export function isDue(progress: ReviewProgress, now: Date): boolean {
  return Date.parse(progress.dueAt) <= now.getTime();
}

export function getAccuracy(progress?: ReviewProgress): number {
  if (!progress || progress.totalSeen === 0) {
    return 0;
  }

  return progress.totalCorrect / progress.totalSeen;
}

export function isBurned(progress?: ReviewProgress): boolean {
  if (!progress || progress.totalSeen < 8) {
    return false;
  }

  return progress.intervalDays >= 45 && getAccuracy(progress) >= 0.9;
}

export function hasRecentMistake(progress: ReviewProgress | undefined, now: Date): boolean {
  if (!progress?.lastWrongAt) {
    return false;
  }

  return now.getTime() - Date.parse(progress.lastWrongAt) <= 14 * DAY_MS;
}

export function getWeaknessScore(progress?: ReviewProgress): number {
  if (!progress || progress.totalSeen === 0) {
    return 0;
  }

  const inaccuracy = 1 - getAccuracy(progress);
  const lapseBias = Math.min(progress.lapses * 0.08, 0.5);
  return inaccuracy + lapseBias;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getNextIntervalDays(progress: ReviewProgress, grade: Grade): number {
  const previous = progress.intervalDays;

  if (grade === 'again') {
    return 10 / (24 * 60);
  }

  if (previous <= 0) {
    if (grade === 'hard') {
      return 1;
    }

    if (grade === 'good') {
      return 2;
    }

    return 4;
  }

  if (grade === 'hard') {
    return Math.max(1, previous * 1.2);
  }

  if (grade === 'good') {
    return Math.max(1, previous * progress.ease);
  }

  return Math.max(2, previous * (progress.ease + 0.45));
}

function getNextEase(progress: ReviewProgress, grade: Grade): number {
  const delta = {
    again: -0.2,
    hard: -0.05,
    good: 0.05,
    easy: 0.15,
  }[grade];

  return clamp(progress.ease + delta, 1.3, 3);
}

export function recordGrade(
  store: ProgressStore,
  masteryKey: string,
  formKey: FormKey,
  grade: Grade,
  now = new Date(),
): ProgressStore {
  const nowIso = now.toISOString();
  const current = getOrCreateProgress(store, masteryKey, nowIso);
  const isCorrect = grade !== 'again';
  const intervalDays = getNextIntervalDays(current, grade);
  const dueAt =
    grade === 'again'
      ? new Date(now.getTime() + 10 * MINUTE_MS).toISOString()
      : new Date(now.getTime() + intervalDays * DAY_MS).toISOString();
  const formProgress = current.perFormFamily[formKey] ?? {
    correct: 0,
    wrong: 0,
    difficultyWeight: 0,
  };
  const difficultyShift =
    grade === 'again' ? 1 : grade === 'hard' ? 0.35 : grade === 'good' ? -0.08 : -0.18;
  const nextFormProgress = {
    correct: formProgress.correct + (isCorrect ? 1 : 0),
    wrong: formProgress.wrong + (isCorrect ? 0 : 1),
    lastSeenAt: nowIso,
    lastWrongAt: isCorrect ? formProgress.lastWrongAt : nowIso,
    difficultyWeight: clamp(formProgress.difficultyWeight + difficultyShift, 0, 4),
  };
  const nextProgress: ReviewProgress = {
    ...current,
    dueAt,
    intervalDays,
    ease: getNextEase(current, grade),
    streak: isCorrect ? current.streak + 1 : 0,
    lapses: current.lapses + (isCorrect ? 0 : 1),
    totalSeen: current.totalSeen + 1,
    totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
    lastSeenAt: nowIso,
    lastSeenForm: formKey,
    lastGrade: grade,
    lastCorrectAt: isCorrect ? nowIso : current.lastCorrectAt,
    lastWrongAt: isCorrect ? current.lastWrongAt : nowIso,
    perFormFamily: {
      ...current.perFormFamily,
      [formKey]: nextFormProgress,
    },
  };
  const currentStreak = isCorrect ? store.meta.currentStreak + 1 : 0;

  return {
    ...store,
    items: {
      ...store.items,
      [masteryKey]: nextProgress,
    },
    meta: {
      currentStreak,
      bestStreak: Math.max(store.meta.bestStreak, currentStreak),
      totalReviews: store.meta.totalReviews + 1,
      lastReviewedAt: nowIso,
    },
  };
}
