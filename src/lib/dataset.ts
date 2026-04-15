import formPresetsData from '../../data/form_presets.json';
import selectionManifestData from '../../data/selection_manifest.json';
import verbCatalogUrl from '../../data/top_1000_japanese_verbs_v1.json?url';
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

export const FORM_PRESETS = formPresetsData as Record<FormKey, FormPresetDefinition>;

export const TE_FORM_PATTERNS = [
  'ichidan-て',
  'godan-って',
  'godan-んで',
  'godan-いて',
  'godan-いで',
  'godan-して',
  'godan-行く-って',
  'irregular-kuru',
  'aru-って',
  'honorific-aru-って',
] as const;

export const DATASET_SUMMARY = (
  selectionManifestData as {
    summaryStats: {
      selected_unique_orthographic_verbs: number;
    };
  }
).summaryStats;

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

export const VERB_COUNT = DATASET_SUMMARY.selected_unique_orthographic_verbs;

let verbCatalogPromise: Promise<VerbEntry[]> | null = null;

export function loadVerbCatalog(): Promise<VerbEntry[]> {
  if (!verbCatalogPromise) {
    verbCatalogPromise = fetch(verbCatalogUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load verb catalog (${response.status}).`);
      }

      return (await response.json()) as VerbEntry[];
    });
  }

  return verbCatalogPromise;
}
