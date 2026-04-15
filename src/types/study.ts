import type { FormKey } from './verb';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface FormFamilyProgress {
  correct: number;
  wrong: number;
  lastSeenAt?: string;
  lastWrongAt?: string;
  difficultyWeight: number;
}

export interface ReviewProgress {
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  lapses: number;
  totalSeen: number;
  totalCorrect: number;
  introducedAt?: string;
  lastSeenAt?: string;
  lastSeenForm?: FormKey;
  lastGrade?: Grade;
  lastCorrectAt?: string;
  lastWrongAt?: string;
  perFormFamily: Partial<Record<FormKey, FormFamilyProgress>>;
}

export type ReviewStateMap = Record<string, ReviewProgress>;

export interface ProgressMeta {
  currentStreak: number;
  bestStreak: number;
  totalReviews: number;
  lastReviewedAt?: string;
}

export interface ProgressStore {
  version: number;
  items: ReviewStateMap;
  meta: ProgressMeta;
}

export type PoolMode = 'mixed' | 'new-only' | 'review-only';

export type DeckSlice =
  | 'due-and-new'
  | 'due-only'
  | 'burned-hidden'
  | 'burned-only'
  | 'weak'
  | 'recent-mistakes';

export type FormPresetId =
  | 'mixed-review'
  | 'dictionary'
  | 'te'
  | 'core'
  | 'derived'
  | 'polite'
  | 'custom';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface StudySettings {
  poolMode: PoolMode;
  deckSlice: DeckSlice;
  formPresetId: FormPresetId;
  customForms: FormKey[];
}

export interface SettingsStore {
  version: number;
  themePreference: ThemePreference;
  study: StudySettings;
}

export interface ExportPayload {
  version: number;
  exportedAt: string;
  progress: ProgressStore;
  settings: SettingsStore;
}
