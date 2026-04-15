import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { applyPreset, toggleCustomForm } from '../lib/filters';
import { loadVerbCatalog } from '../lib/dataset';
import { createEmptyProgressStore, recordGrade } from '../lib/progress';
import {
  buildExportPayload,
  createDefaultSettingsStore,
  loadProgressStore,
  loadSettingsStore,
  parseImportPayload,
  saveProgressStore,
  saveSettingsStore,
} from '../lib/storage';
import type {
  ExportPayload,
  FormPresetId,
  Grade,
  ProgressStore,
  SettingsStore,
  StudySettings,
  ThemePreference,
} from '../types/study';
import type { FormKey, VerbEntry } from '../types/verb';

interface AppStateValue {
  verbs: VerbEntry[];
  catalogStatus: 'loading' | 'ready' | 'error';
  catalogError?: string;
  progressStore: ProgressStore;
  settingsStore: SettingsStore;
  setThemePreference: (themePreference: ThemePreference) => void;
  setStudySettings: (updater: StudySettings | ((current: StudySettings) => StudySettings)) => void;
  applyStudyPreset: (presetId: FormPresetId) => void;
  toggleStudyForm: (formKey: FormKey) => void;
  recordReview: (masteryKey: string, formKey: FormKey, grade: Grade) => void;
  exportPayload: () => ExportPayload;
  importPayload: (raw: string) => { ok: true } | { ok: false; error: string };
  resetProgress: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [verbs, setVerbs] = useState<VerbEntry[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [catalogError, setCatalogError] = useState<string>();
  const [progressStore, setProgressStore] = useState<ProgressStore>(() => loadProgressStore());
  const [settingsStore, setSettingsStore] = useState<SettingsStore>(() => loadSettingsStore());

  useEffect(() => {
    loadVerbCatalog()
      .then((catalog) => {
        setVerbs(catalog);
        setCatalogStatus('ready');
      })
      .catch((error: unknown) => {
        setCatalogError(error instanceof Error ? error.message : 'Failed to load the verb catalog.');
        setCatalogStatus('error');
      });
  }, []);

  useEffect(() => {
    saveProgressStore(progressStore);
  }, [progressStore]);

  useEffect(() => {
    saveSettingsStore(settingsStore);
  }, [settingsStore]);

  const value: AppStateValue = {
    verbs,
    catalogStatus,
    catalogError,
    progressStore,
    settingsStore,
    setThemePreference(themePreference) {
      setSettingsStore((current) => ({
        ...current,
        themePreference,
      }));
    },
    setStudySettings(updater) {
      setSettingsStore((current) => ({
        ...current,
        study: typeof updater === 'function' ? updater(current.study) : updater,
      }));
    },
    applyStudyPreset(presetId) {
      setSettingsStore((current) => ({
        ...current,
        study: applyPreset(current.study, presetId),
      }));
    },
    toggleStudyForm(formKey) {
      setSettingsStore((current) => ({
        ...current,
        study: toggleCustomForm(current.study, formKey),
      }));
    },
    recordReview(masteryKey, formKey, grade) {
      setProgressStore((current) => recordGrade(current, masteryKey, formKey, grade));
    },
    exportPayload() {
      return buildExportPayload(progressStore, settingsStore);
    },
    importPayload(raw) {
      const parsed = parseImportPayload(raw);

      if (!parsed.ok) {
        return parsed;
      }

      setProgressStore(parsed.data.progress);
      setSettingsStore(parsed.data.settings);
      return { ok: true };
    },
    resetProgress() {
      setProgressStore(createEmptyProgressStore());
      setSettingsStore(createDefaultSettingsStore());
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider.');
  }

  return context;
}
