import type { FormKey, SurfaceForm, VerbEntry } from '../types/verb';

const A_ROW: Record<string, string> = {
  'う': 'わ',
  'く': 'か',
  'ぐ': 'が',
  'す': 'さ',
  'つ': 'た',
  'ぬ': 'な',
  'ぶ': 'ば',
  'む': 'ま',
  'る': 'ら',
};

const I_ROW: Record<string, string> = {
  'う': 'い',
  'く': 'き',
  'ぐ': 'ぎ',
  'す': 'し',
  'つ': 'ち',
  'ぬ': 'に',
  'ぶ': 'び',
  'む': 'み',
  'る': 'り',
};

const E_ROW: Record<string, string> = {
  'う': 'え',
  'く': 'け',
  'ぐ': 'げ',
  'す': 'せ',
  'つ': 'て',
  'ぬ': 'ね',
  'ぶ': 'べ',
  'む': 'め',
  'る': 'れ',
};

const O_ROW: Record<string, string> = {
  'う': 'お',
  'く': 'こ',
  'ぐ': 'ご',
  'す': 'そ',
  'つ': 'と',
  'ぬ': 'の',
  'ぶ': 'ぼ',
  'む': 'も',
  'る': 'ろ',
};

function form(jp: string, reading: string): SurfaceForm {
  return { jp, reading };
}

export function conjugateFromProfile(entry: Pick<VerbEntry, 'orthography' | 'reading' | 'rawPos' | 'verbClass'>): Partial<Record<FormKey, SurfaceForm | null>> {
  const word = entry.orthography;
  const reading = entry.reading;
  const end = reading.slice(-1);

  if (!end) return {};

  if (entry.verbClass === 'ichidan') {
    const stemJp = word.slice(0, -1);
    const stemReading = reading.slice(0, -1);

    return {
      dictionary: form(word, reading),
      polite: form(`${stemJp}ます`, `${stemReading}ます`),
      politePast: form(`${stemJp}ました`, `${stemReading}ました`),
      politeNegative: form(`${stemJp}ません`, `${stemReading}ません`),
      negative: form(`${stemJp}ない`, `${stemReading}ない`),
      past: form(`${stemJp}た`, `${stemReading}た`),
      te: form(`${stemJp}て`, `${stemReading}て`),
      potential: form(`${stemJp}られる`, `${stemReading}られる`),
      passive: form(`${stemJp}られる`, `${stemReading}られる`),
      causative: form(`${stemJp}させる`, `${stemReading}させる`),
      causativePassive: form(`${stemJp}させられる`, `${stemReading}させられる`),
      volitional: form(`${stemJp}よう`, `${stemReading}よう`),
      ba: form(`${stemJp}れば`, `${stemReading}れば`),
      tara: form(`${stemJp}たら`, `${stemReading}たら`),
      imperative: form(`${stemJp}ろ`, `${stemReading}ろ`),
      prohibitive: form(`${word}な`, `${reading}な`),
    };
  }

  if (entry.verbClass === 'godan') {
    const stemJp = word.slice(0, -1);
    const stemReading = reading.slice(0, -1);
    const a = A_ROW[end];
    const i = I_ROW[end];
    const e = E_ROW[end];
    const o = O_ROW[end];

    if (!(a && i && e && o)) return {};

    let teEnding = 'て';
    let pastEnding = 'た';

    if (entry.rawPos === 'v5k-s') {
      teEnding = 'って';
      pastEnding = 'った';
    } else if (['う', 'つ', 'る'].includes(end)) {
      teEnding = 'って';
      pastEnding = 'った';
    } else if (['む', 'ぶ', 'ぬ'].includes(end)) {
      teEnding = 'んで';
      pastEnding = 'んだ';
    } else if (end === 'く') {
      teEnding = 'いて';
      pastEnding = 'いた';
    } else if (end === 'ぐ') {
      teEnding = 'いで';
      pastEnding = 'いだ';
    } else if (end === 'す') {
      teEnding = 'して';
      pastEnding = 'した';
    }

    return {
      dictionary: form(word, reading),
      polite: form(`${stemJp}${i}ます`, `${stemReading}${i}ます`),
      politePast: form(`${stemJp}${i}ました`, `${stemReading}${i}ました`),
      politeNegative: form(`${stemJp}${i}ません`, `${stemReading}${i}ません`),
      negative: form(`${stemJp}${a}ない`, `${stemReading}${a}ない`),
      past: form(`${stemJp}${pastEnding}`, `${stemReading}${pastEnding}`),
      te: form(`${stemJp}${teEnding}`, `${stemReading}${teEnding}`),
      potential: form(`${stemJp}${e}る`, `${stemReading}${e}る`),
      passive: form(`${stemJp}${a}れる`, `${stemReading}${a}れる`),
      causative: form(`${stemJp}${a}せる`, `${stemReading}${a}せる`),
      causativePassive: form(`${stemJp}${a}せられる`, `${stemReading}${a}せられる`),
      volitional: form(`${stemJp}${o}う`, `${stemReading}${o}う`),
      ba: form(`${stemJp}${e}ば`, `${stemReading}${e}ば`),
      tara: form(`${stemJp}${pastEnding}ら`, `${stemReading}${pastEnding}ら`),
      imperative: form(`${stemJp}${e}`, `${stemReading}${e}`),
      prohibitive: form(`${word}な`, `${reading}な`),
    };
  }

  if (entry.verbClass === 'kuru') {
    const stemJp = word.slice(0, -1); // 来
    return {
      dictionary: form(word, reading),
      polite: form(`${stemJp}ます`, 'きます'),
      politePast: form(`${stemJp}ました`, 'きました'),
      politeNegative: form(`${stemJp}ません`, 'きません'),
      negative: form(`${stemJp}ない`, 'こない'),
      past: form(`${stemJp}た`, 'きた'),
      te: form(`${stemJp}て`, 'きて'),
      potential: form(`${stemJp}られる`, 'こられる'),
      passive: form(`${stemJp}られる`, 'こられる'),
      causative: form(`${stemJp}させる`, 'こさせる'),
      causativePassive: form(`${stemJp}させられる`, 'こさせられる'),
      volitional: form(`${stemJp}よう`, 'こよう'),
      ba: form(`${stemJp}れば`, 'くれば'),
      tara: form(`${stemJp}たら`, 'きたら'),
      imperative: form(`${stemJp}い`, 'こい'),
      prohibitive: form(`${word}な`, `${reading}な`),
    };
  }

  if (entry.verbClass === 'aru_irregular') {
    return {
      dictionary: form(word, reading),
      polite: form('あります', 'あります'),
      politePast: form('ありました', 'ありました'),
      politeNegative: form('ありません', 'ありません'),
      negative: form('無い', 'ない'),
      past: form('あった', 'あった'),
      te: form('あって', 'あって'),
      volitional: form('あろう', 'あろう'),
      ba: form('あれば', 'あれば'),
      tara: form('あったら', 'あったら'),
      imperative: form('あれ', 'あれ'),
      prohibitive: form(`${word}な`, `${reading}な`),
      potential: null,
      passive: null,
      causative: null,
      causativePassive: null,
    };
  }

  if (entry.verbClass === 'honorific_aru') {
    const stemJp = word.slice(0, -1);
    const stemReading = reading.slice(0, -1);

    return {
      dictionary: form(word, reading),
      polite: form(`${stemJp}います`, `${stemReading}います`),
      politePast: form(`${stemJp}いました`, `${stemReading}いました`),
      politeNegative: form(`${stemJp}いません`, `${stemReading}いません`),
      negative: form(`${stemJp}らない`, `${stemReading}らない`),
      past: form(`${stemJp}った`, `${stemReading}った`),
      te: form(`${stemJp}って`, `${stemReading}って`),
      volitional: form(`${stemJp}ろう`, `${stemReading}ろう`),
      ba: form(`${stemJp}れば`, `${stemReading}れば`),
      tara: form(`${stemJp}ったら`, `${stemReading}ったら`),
      prohibitive: form(`${word}な`, `${reading}な`),
      potential: null,
      passive: null,
      causative: null,
      causativePassive: null,
      imperative: null,
    };
  }

  return {};
}

export function getInflectionExplanation(formKey: FormKey, baseMeaning: string): string[] {
  switch (formKey) {
    case 'dictionary':
      return ['Base plain form', `Read it as: ${baseMeaning}`];
    case 'negative':
      return ['Plain negative form', `Read it as: do not ${baseMeaning}`];
    case 'past':
      return ['Plain past form', `Read it as: did ${baseMeaning}`];
    case 'te':
      return ['て-form', `Read it as: ${baseMeaning} and... / ${baseMeaning}ing / after ${baseMeaning}ing`];
    case 'potential':
      return ['Potential form', `Read it as: can ${baseMeaning}`];
    case 'passive':
      return ['Passive form', `Read it as: be ${baseMeaning}ed`];
    case 'causative':
      return ['Causative form', `Read it as: make/let someone ${baseMeaning}`];
    case 'causativePassive':
      return ['Causative-passive form', `Read it as: be made to ${baseMeaning}`];
    case 'polite':
      return ['Polite non-past', `Read it as: ${baseMeaning} (polite)`];
    case 'politePast':
      return ['Polite past', `Read it as: ${baseMeaning} (polite past)`];
    case 'politeNegative':
      return ['Polite negative', `Read it as: do not ${baseMeaning} (polite)`];
    case 'volitional':
      return ['Volitional form', `Read it as: let\'s ${baseMeaning}`];
    case 'ba':
      return ['ば conditional', `Read it as: if someone ${baseMeaning}`];
    case 'tara':
      return ['たら conditional', `Read it as: if/when someone ${baseMeaning}`];
    case 'imperative':
      return ['Imperative form', `Read it as: ${baseMeaning}!`];
    case 'prohibitive':
      return ['Prohibitive form', `Read it as: do not ${baseMeaning}!`];
    default:
      return [];
  }
}
