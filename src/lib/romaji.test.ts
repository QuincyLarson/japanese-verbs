import { kanaToRomaji, matchesReadingInput, normalizeLatinSearch, normalizeKanaText } from './romaji';
import { searchVerbs } from './stats';
import type { VerbEntry } from '../types/verb';

const READ_ENTRY: VerbEntry = {
  id: 'verb-read',
  orthography: '読む',
  reading: 'よむ',
  masteryKey: '読む',
  bccwjRank: 1,
  bccwjOrigin: '和',
  edictCommon: true,
  inKyoikuBasicVocab: true,
  inRokusyuTaisyo: true,
  rawPos: 'v5m',
  verbClass: 'godan',
  endingGroup: 'mu',
  teFormPattern: 'godan-んで',
  transitivity: 'transitive',
  englishPrimary: 'read',
  englishGlosses: ['read'],
  alternateSpellings: [],
  sameSpellingOtherReadings: [],
  allowedInflections: ['dictionary'],
  inflectionNotes: [],
  forms: {
    dictionary: {
      jp: '読む',
      reading: 'よむ',
    },
  },
};

const SPEAK_ENTRY: VerbEntry = {
  ...READ_ENTRY,
  id: 'verb-speak',
  orthography: 'しゃべる',
  reading: 'しゃべる',
  masteryKey: 'しゃべる',
  teFormPattern: 'ichidan-て',
  verbClass: 'ichidan',
  endingGroup: 'ichidan_ru',
  englishPrimary: 'chat',
  englishGlosses: ['chat', 'talk'],
  forms: {
    dictionary: {
      jp: 'しゃべる',
      reading: 'しゃべる',
    },
  },
};

describe('kanaToRomaji', () => {
  it('romanizes hiragana readings', () => {
    expect(kanaToRomaji('よむ')).toBe('yomu');
    expect(kanaToRomaji('しゃべる')).toBe('shaberu');
  });

  it('normalizes latin input for romaji search', () => {
    expect(normalizeLatinSearch('Yo-mu')).toBe('yomu');
  });

  it('matches typed readings in hiragana, katakana, or romaji', () => {
    expect(normalizeKanaText('ヨム')).toBe('よむ');
    expect(matchesReadingInput('よむ', 'よむ')).toBe(true);
    expect(matchesReadingInput('ヨム', 'よむ')).toBe(true);
    expect(matchesReadingInput('yomu', 'よむ')).toBe(true);
    expect(matchesReadingInput('taberu', 'よむ')).toBe(false);
  });
});

describe('searchVerbs', () => {
  it('matches romaji queries against kana readings', () => {
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY], 'yomu')).toEqual([READ_ENTRY]);
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY], 'shaberu')).toEqual([SPEAK_ENTRY]);
  });
});
