import { FORM_ORDER } from './dataset';
import { DEFAULT_STUDY_SETTINGS } from './filters';
import { createEmptyProgressStore } from './progress';
import type { ExportPayload, ProgressStore, SettingsStore } from '../types/study';
import type { FormKey } from '../types/verb';

const PROGRESS_KEY = 'jp-verbs-v1-progress';
const SETTINGS_KEY = 'jp-verbs-v1-settings';
const EXPORT_VERSION = 1;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFormKey(value: unknown): value is FormKey {
  return typeof value === 'string' && FORM_ORDER.includes(value as FormKey);
}

function isThemePreference(value: unknown): value is SettingsStore['themePreference'] {
  return value === 'system' || value === 'light' || value === 'dark';
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createDefaultSettingsStore(): SettingsStore {
  return {
    version: 1,
    themePreference: 'system',
    study: DEFAULT_STUDY_SETTINGS,
  };
}

export function loadProgressStore(): ProgressStore {
  const storage = getStorage();
  const parsed = parseJson<ProgressStore>(storage?.getItem(PROGRESS_KEY) ?? null);

  if (!parsed || !isObject(parsed) || !isObject(parsed.items) || !isObject(parsed.meta)) {
    return createEmptyProgressStore();
  }

  return {
    version: 1,
    items: parsed.items,
    meta: {
      currentStreak: Number(parsed.meta.currentStreak ?? 0),
      bestStreak: Number(parsed.meta.bestStreak ?? 0),
      totalReviews: Number(parsed.meta.totalReviews ?? 0),
      lastReviewedAt:
        typeof parsed.meta.lastReviewedAt === 'string' ? parsed.meta.lastReviewedAt : undefined,
    },
  };
}

export function saveProgressStore(store: ProgressStore) {
  const storage = getStorage();
  storage?.setItem(PROGRESS_KEY, JSON.stringify(store));
}

export function loadSettingsStore(): SettingsStore {
  const storage = getStorage();
  const parsed = parseJson<SettingsStore>(storage?.getItem(SETTINGS_KEY) ?? null);

  if (!parsed || !isObject(parsed) || !isObject(parsed.study)) {
    return createDefaultSettingsStore();
  }

  return {
    version: 1,
    themePreference: isThemePreference(parsed.themePreference) ? parsed.themePreference : 'system',
    study: {
      ...DEFAULT_STUDY_SETTINGS,
      ...parsed.study,
      customForms: Array.isArray(parsed.study.customForms)
        ? parsed.study.customForms.filter(isFormKey)
        : DEFAULT_STUDY_SETTINGS.customForms,
    },
  };
}

export function saveSettingsStore(store: SettingsStore) {
  const storage = getStorage();
  storage?.setItem(SETTINGS_KEY, JSON.stringify(store));
}

export function buildExportPayload(progress: ProgressStore, settings: SettingsStore): ExportPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
  };
}

export function parseImportPayload(
  raw: string,
): { ok: true; data: ExportPayload } | { ok: false; error: string } {
  const parsed = parseJson<ExportPayload>(raw);

  if (!parsed || !isObject(parsed) || !isObject(parsed.progress) || !isObject(parsed.settings)) {
    return {
      ok: false,
      error: 'The selected file is not a valid progress export.',
    };
  }

  return {
    ok: true,
    data: {
      version: 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      progress: parsed.progress,
      settings: parsed.settings,
    },
  };
}
