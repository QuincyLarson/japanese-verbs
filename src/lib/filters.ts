import { CORE_FORM_KEYS, DEFAULT_FORM_KEYS, DERIVED_FORM_KEYS, POLITE_FORM_KEYS } from './dataset';
import type { DeckSlice, FormPresetId, PoolMode, StudySettings } from '../types/study';
import type { FormKey } from '../types/verb';

export const FORM_PRESET_OPTIONS: Array<{
  id: FormPresetId;
  label: string;
  description: string;
}> = [
  {
    id: 'mixed-review',
    label: 'Mixed',
    description: 'Default review rotation across the enabled families.',
  },
  {
    id: 'dictionary',
    label: 'Dictionary',
    description: 'Written verb identity only.',
  },
  {
    id: 'te',
    label: 'て-form',
    description: 'Connective-form focus.',
  },
  {
    id: 'core',
    label: 'Core',
    description: 'Dictionary, negative, past, and て-form.',
  },
  {
    id: 'derived',
    label: 'Derived',
    description: 'Potential, passive, causative, and causative-passive.',
  },
  {
    id: 'polite',
    label: 'Polite',
    description: 'Optional ます-family review.',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Manual multi-select.',
  },
];

export const POOL_MODE_OPTIONS: Array<{ id: PoolMode; label: string }> = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'new-only', label: 'New only' },
  { id: 'review-only', label: 'Review only' },
];

export const DECK_SLICE_OPTIONS: Array<{ id: DeckSlice; label: string }> = [
  { id: 'due-and-new', label: 'Due + new' },
  { id: 'due-only', label: 'Due only' },
  { id: 'burned-hidden', label: 'Hide burned' },
  { id: 'burned-only', label: 'Burned only' },
  { id: 'weak', label: 'Weak' },
  { id: 'recent-mistakes', label: 'Recent mistakes' },
];

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  poolMode: 'mixed',
  deckSlice: 'due-and-new',
  formPresetId: 'mixed-review',
  customForms: [...CORE_FORM_KEYS],
};

const PRESET_FORM_MAP: Record<FormPresetId, FormKey[]> = {
  'mixed-review': DEFAULT_FORM_KEYS,
  dictionary: ['dictionary'],
  te: ['te'],
  core: CORE_FORM_KEYS,
  derived: DERIVED_FORM_KEYS,
  polite: POLITE_FORM_KEYS,
  custom: DEFAULT_STUDY_SETTINGS.customForms,
};

export function resolveFormSelection(settings: StudySettings): FormKey[] {
  if (settings.formPresetId === 'custom') {
    return settings.customForms.length > 0 ? [...new Set(settings.customForms)] : [...CORE_FORM_KEYS];
  }

  return [...PRESET_FORM_MAP[settings.formPresetId]];
}

export function applyPreset(settings: StudySettings, presetId: FormPresetId): StudySettings {
  if (presetId === 'custom') {
    return {
      ...settings,
      formPresetId: 'custom',
      customForms: settings.customForms.length > 0 ? settings.customForms : [...CORE_FORM_KEYS],
    };
  }

  return {
    ...settings,
    formPresetId: presetId,
    customForms: [...PRESET_FORM_MAP[presetId]],
  };
}

export function toggleCustomForm(settings: StudySettings, formKey: FormKey): StudySettings {
  const base = applyPreset(settings, 'custom');
  const current = new Set(base.customForms);

  if (current.has(formKey)) {
    current.delete(formKey);
  } else {
    current.add(formKey);
  }

  return {
    ...base,
    customForms: Array.from(current),
  };
}

export function getPresetFromSearchParam(value: string | null): FormPresetId | null {
  if (!value) {
    return null;
  }

  const match = FORM_PRESET_OPTIONS.find((option) => option.id === value);
  return match?.id ?? null;
}
