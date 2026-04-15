export type VerbClass =
  | 'ichidan'
  | 'godan'
  | 'kuru'
  | 'aru_irregular'
  | 'honorific_aru';

export type FormKey =
  | 'dictionary'
  | 'polite'
  | 'politePast'
  | 'politeNegative'
  | 'negative'
  | 'past'
  | 'te'
  | 'potential'
  | 'passive'
  | 'causative'
  | 'causativePassive'
  | 'volitional'
  | 'ba'
  | 'tara'
  | 'imperative'
  | 'prohibitive';

export interface SurfaceForm {
  jp: string;
  reading: string;
}

export interface AlternateReading {
  reading: string;
  rank_bccwj: number;
  english_primary: string;
}

export interface VerbEntry {
  id: string;
  orthography: string;
  reading: string;
  masteryKey: string;
  bccwjRank: number;
  bccwjOrigin: string;
  edictCommon: boolean;
  inKyoikuBasicVocab: boolean;
  inRokusyuTaisyo: boolean;
  rawPos: string;
  verbClass: VerbClass;
  endingGroup: string;
  teFormPattern: string;
  transitivity: 'transitive' | 'intransitive' | 'both' | 'unspecified';
  englishPrimary: string;
  englishGlosses: string[];
  alternateSpellings: string[];
  sameSpellingOtherReadings: AlternateReading[];
  allowedInflections: FormKey[];
  inflectionNotes: string[];
  forms: Partial<Record<FormKey, SurfaceForm | null>>;
}
