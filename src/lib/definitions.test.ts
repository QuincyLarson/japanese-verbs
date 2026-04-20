import { formatEnglishDefinition, shouldShowTransitivityDefinitionHint } from './definitions';
import type { VerbEntry } from '../types/verb';

function createVerb(overrides: Partial<VerbEntry>): VerbEntry {
  const orthography = overrides.orthography ?? '読む';
  const reading = overrides.reading ?? 'よむ';
  const englishPrimary = overrides.englishPrimary ?? 'read';

  return {
    id: overrides.id ?? orthography,
    orthography,
    reading,
    masteryKey: overrides.masteryKey ?? orthography,
    bccwjRank: overrides.bccwjRank ?? 1,
    bccwjOrigin: overrides.bccwjOrigin ?? 'bccwj',
    edictCommon: overrides.edictCommon ?? true,
    inKyoikuBasicVocab: overrides.inKyoikuBasicVocab ?? true,
    inRokusyuTaisyo: overrides.inRokusyuTaisyo ?? true,
    rawPos: overrides.rawPos ?? 'v5m',
    verbClass: overrides.verbClass ?? 'godan',
    endingGroup: overrides.endingGroup ?? 'mu',
    teFormPattern: overrides.teFormPattern ?? 'godan-んで',
    transitivity: overrides.transitivity ?? 'transitive',
    englishPrimary,
    englishGlosses: overrides.englishGlosses ?? [englishPrimary],
    alternateSpellings: overrides.alternateSpellings ?? [],
    sameSpellingOtherReadings: overrides.sameSpellingOtherReadings ?? [],
    allowedInflections: overrides.allowedInflections ?? ['dictionary'],
    inflectionNotes: overrides.inflectionNotes ?? [],
    forms: overrides.forms ?? {
      dictionary: {
        jp: orthography,
        reading,
      },
    },
  };
}

describe('formatEnglishDefinition', () => {
  it('adds a hint for common pair-like transitive and intransitive verbs', () => {
    const wataru = createVerb({
      orthography: '渡る',
      reading: 'わたる',
      transitivity: 'intransitive',
      englishPrimary: 'cross over',
    });
    const watasu = createVerb({
      orthography: '渡す',
      reading: 'わたす',
      transitivity: 'transitive',
      englishPrimary: 'ferry across (a river, etc.)',
    });

    expect(shouldShowTransitivityDefinitionHint(wataru, [wataru, watasu])).toBe(true);
    expect(formatEnglishDefinition(wataru, [wataru, watasu])).toBe('cross over [intransitive]');
    expect(formatEnglishDefinition(watasu, [wataru, watasu])).toBe('ferry across (a river, etc.) [transitive]');
  });

  it('does not add a hint for unrelated verbs that only share a broad gloss', () => {
    const hanasu = createVerb({
      orthography: '話す',
      reading: 'はなす',
      transitivity: 'transitive',
      englishPrimary: 'talk',
    });
    const shaberu = createVerb({
      orthography: '喋る',
      reading: 'しゃべる',
      transitivity: 'intransitive',
      englishPrimary: 'talk',
    });

    expect(shouldShowTransitivityDefinitionHint(hanasu, [hanasu, shaberu])).toBe(false);
    expect(formatEnglishDefinition(hanasu, [hanasu, shaberu])).toBe('talk');
  });

  it('does not add a hint when the counterpart is not common', () => {
    const kawaru = createVerb({
      orthography: '変わる',
      reading: 'かわる',
      transitivity: 'intransitive',
      englishPrimary: 'change',
      edictCommon: true,
    });
    const kaeru = createVerb({
      orthography: '変える',
      reading: 'かえる',
      transitivity: 'transitive',
      englishPrimary: 'change',
      edictCommon: false,
    });

    expect(shouldShowTransitivityDefinitionHint(kawaru, [kawaru, kaeru])).toBe(false);
    expect(formatEnglishDefinition(kawaru, [kawaru, kaeru])).toBe('change');
  });
});
