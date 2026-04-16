import { createStudySnapshot } from './scheduler';
import { createEmptyProgressStore, recordGrade } from './progress';
import type { StudySettings } from '../types/study';
import type { VerbEntry } from '../types/verb';

const BASE_SETTINGS: StudySettings = {
  poolMode: 'mixed',
  deckSlice: 'due-and-new',
  formPresetId: 'mixed-review',
  customForms: ['dictionary', 'te'],
};

const VERBS: VerbEntry[] = [
  {
    id: 'verb-0',
    orthography: '居る',
    reading: 'いる',
    masteryKey: '居る',
    bccwjRank: 4,
    bccwjOrigin: '和',
    edictCommon: true,
    inKyoikuBasicVocab: true,
    inRokusyuTaisyo: true,
    rawPos: 'v1',
    verbClass: 'ichidan',
    endingGroup: 'ichidan_ru',
    teFormPattern: 'ichidan-て',
    transitivity: 'intransitive',
    englishPrimary: 'be (of animate objects)',
    englishGlosses: ['be (of animate objects)'],
    alternateSpellings: [],
    sameSpellingOtherReadings: [],
    allowedInflections: ['dictionary', 'te'],
    inflectionNotes: [],
    forms: {
      dictionary: { jp: '居る', reading: 'いる' },
      te: { jp: '居て', reading: 'いて' },
    },
  },
  {
    id: 'verb-1',
    orthography: '食べる',
    reading: 'たべる',
    masteryKey: '食べる',
    bccwjRank: 12,
    bccwjOrigin: '和',
    edictCommon: true,
    inKyoikuBasicVocab: true,
    inRokusyuTaisyo: true,
    rawPos: 'v1',
    verbClass: 'ichidan',
    endingGroup: 'ichidan_ru',
    teFormPattern: 'ichidan-て',
    transitivity: 'transitive',
    englishPrimary: 'eat',
    englishGlosses: ['eat'],
    alternateSpellings: [],
    sameSpellingOtherReadings: [],
    allowedInflections: ['dictionary', 'te'],
    inflectionNotes: [],
    forms: {
      dictionary: { jp: '食べる', reading: 'たべる' },
      te: { jp: '食べて', reading: 'たべて' },
    },
  },
  {
    id: 'verb-2',
    orthography: '読む',
    reading: 'よむ',
    masteryKey: '読む',
    bccwjRank: 42,
    bccwjOrigin: '和',
    edictCommon: true,
    inKyoikuBasicVocab: true,
    inRokusyuTaisyo: true,
    rawPos: 'v5m',
    verbClass: 'godan',
    endingGroup: 'godan_mu',
    teFormPattern: 'godan-んで',
    transitivity: 'transitive',
    englishPrimary: 'read',
    englishGlosses: ['read'],
    alternateSpellings: [],
    sameSpellingOtherReadings: [],
    allowedInflections: ['dictionary', 'te'],
    inflectionNotes: [],
    forms: {
      dictionary: { jp: '読む', reading: 'よむ' },
      te: { jp: '読んで', reading: 'よんで' },
    },
  },
];

describe('createStudySnapshot', () => {
  it('prioritizes a due card over a new card', () => {
    let store = createEmptyProgressStore();
    store = recordGrade(store, '食べる', 'dictionary', 'good', new Date('2026-04-10T12:00:00.000Z'));

    const snapshot = createStudySnapshot(VERBS, store, BASE_SETTINGS, new Date('2026-04-15T12:00:00.000Z'));

    expect(snapshot.nextCard?.entry.masteryKey).toBe('食べる');
    expect(snapshot.counts.new).toBe(2);
    expect(snapshot.counts.due).toBe(1);
  });

  it('honors a dictionary-only preset', () => {
    const snapshot = createStudySnapshot(
      VERBS,
      createEmptyProgressStore(),
      {
        ...BASE_SETTINGS,
        formPresetId: 'dictionary',
      },
      new Date('2026-04-15T12:00:00.000Z'),
    );

    expect(snapshot.activeForms).toEqual(['dictionary']);
    expect(snapshot.nextCard?.formKey).toBe('dictionary');
  });

  it('starts new learners inside the starter window instead of always opening on 居る', () => {
    const snapshot = createStudySnapshot(
      VERBS,
      createEmptyProgressStore(),
      BASE_SETTINGS,
      new Date('2026-04-15T12:00:00.000Z'),
    );

    expect(['食べる', '読む']).toContain(snapshot.nextCard?.entry.masteryKey);
    expect(snapshot.nextCard?.entry.masteryKey).not.toBe('居る');
  });
});
