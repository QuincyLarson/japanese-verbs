import {
  kanaToRomaji,
  matchesReadingInput,
  normalizeLatinSearch,
  normalizeKanaText,
  normalizeRomajiForMatch,
} from './romaji';
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

const MAKE_ENTRY: VerbEntry = {
  ...READ_ENTRY,
  id: 'verb-make',
  orthography: '作る',
  reading: 'つくる',
  masteryKey: '作る',
  endingGroup: 'ru',
  teFormPattern: 'godan-って',
  englishPrimary: 'make',
  englishGlosses: ['make', 'build'],
  forms: {
    dictionary: {
      jp: '作る',
      reading: 'つくる',
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

  it('normalizes common IME-style romaji shortcuts', () => {
    expect(normalizeRomajiForMatch('tsukuru')).toBe('tukuru');
    expect(normalizeRomajiForMatch('tukuru')).toBe('tukuru');
    expect(normalizeRomajiForMatch('shiru')).toBe('siru');
    expect(normalizeRomajiForMatch('sha')).toBe('sya');
    expect(normalizeRomajiForMatch('sya')).toBe('sya');
    expect(normalizeRomajiForMatch('cha')).toBe('tya');
    expect(normalizeRomajiForMatch('tya')).toBe('tya');
    expect(normalizeRomajiForMatch('ja')).toBe('zya');
    expect(normalizeRomajiForMatch('jya')).toBe('zya');
  });

  it('matches typed readings in hiragana, katakana, or romaji', () => {
    expect(normalizeKanaText('ヨム')).toBe('よむ');
    expect(matchesReadingInput('よむ', 'よむ')).toBe(true);
    expect(matchesReadingInput('ヨム', 'よむ')).toBe(true);
    expect(matchesReadingInput('yomu', 'よむ')).toBe(true);
    expect(matchesReadingInput('tukuru', 'つくる')).toBe(true);
    expect(matchesReadingInput('siru', 'しる')).toBe(true);
    expect(matchesReadingInput('syaberu', 'しゃべる')).toBe(true);
    expect(matchesReadingInput('tyau', 'ちゃう')).toBe(true);
    expect(matchesReadingInput('huru', 'ふる')).toBe(true);
    expect(matchesReadingInput('taberu', 'よむ')).toBe(false);
  });
});

describe('searchVerbs', () => {
  it('matches romaji queries against kana readings', () => {
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY, MAKE_ENTRY], 'yomu')).toEqual([READ_ENTRY]);
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY, MAKE_ENTRY], 'shaberu')).toEqual([SPEAK_ENTRY]);
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY, MAKE_ENTRY], 'syaberu')).toEqual([SPEAK_ENTRY]);
    expect(searchVerbs([READ_ENTRY, SPEAK_ENTRY, MAKE_ENTRY], 'tukuru')).toEqual([MAKE_ENTRY]);
  });
});
