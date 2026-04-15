import formPresetsData from '../../data/form_presets.json';
import verbData from '../../data/top_1000_japanese_verbs_v1.json';
import type { FormKey, VerbEntry } from '../types/verb';

export interface FormPresetDefinition {
  label: string;
  description: string;
  englishTemplate: string;
  enabledByDefault: boolean;
  group: 'core' | 'derived' | 'polite' | 'extended';
}

export const FORM_ORDER: FormKey[] = [
  'dictionary',
  'negative',
  'past',
  'te',
  'potential',
  'passive',
  'causative',
  'causativePassive',
  'polite',
  'politePast',
  'politeNegative',
  'volitional',
  'ba',
  'tara',
  'imperative',
  'prohibitive',
];

export const VERBS = verbData as VerbEntry[];

export const FORM_PRESETS = formPresetsData as Record<FormKey, FormPresetDefinition>;

export const DEFAULT_FORM_KEYS = FORM_ORDER.filter(
  (formKey) => FORM_PRESETS[formKey].enabledByDefault,
);

export const CORE_FORM_KEYS = FORM_ORDER.filter(
  (formKey) => FORM_PRESETS[formKey].group === 'core',
);

export const DERIVED_FORM_KEYS = FORM_ORDER.filter(
  (formKey) => FORM_PRESETS[formKey].group === 'derived',
);

export const POLITE_FORM_KEYS = FORM_ORDER.filter(
  (formKey) => FORM_PRESETS[formKey].group === 'polite',
);

export const VERB_COUNT = VERBS.length;

export const COMMON_TE_PATTERNS = Array.from(
  new Set(VERBS.map((entry) => entry.teFormPattern)),
);
