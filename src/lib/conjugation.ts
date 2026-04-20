import type { FormKey, SurfaceForm, VerbEntry } from '../types/verb';

interface EnglishVerbForms {
  gerund: string;
  past: string;
  pastParticiple: string;
}

export interface InflectionExample {
  japanese: string;
  english: string;
}

const IRREGULAR_ENGLISH_VERBS: Record<string, EnglishVerbForms> = {
  be: { gerund: 'being', past: 'was', pastParticiple: 'been' },
  begin: { gerund: 'beginning', past: 'began', pastParticiple: 'begun' },
  bring: { gerund: 'bringing', past: 'brought', pastParticiple: 'brought' },
  buy: { gerund: 'buying', past: 'bought', pastParticiple: 'bought' },
  come: { gerund: 'coming', past: 'came', pastParticiple: 'come' },
  do: { gerund: 'doing', past: 'did', pastParticiple: 'done' },
  feel: { gerund: 'feeling', past: 'felt', pastParticiple: 'felt' },
  find: { gerund: 'finding', past: 'found', pastParticiple: 'found' },
  get: { gerund: 'getting', past: 'got', pastParticiple: 'gotten' },
  give: { gerund: 'giving', past: 'gave', pastParticiple: 'given' },
  go: { gerund: 'going', past: 'went', pastParticiple: 'gone' },
  have: { gerund: 'having', past: 'had', pastParticiple: 'had' },
  hear: { gerund: 'hearing', past: 'heard', pastParticiple: 'heard' },
  keep: { gerund: 'keeping', past: 'kept', pastParticiple: 'kept' },
  know: { gerund: 'knowing', past: 'knew', pastParticiple: 'known' },
  leave: { gerund: 'leaving', past: 'left', pastParticiple: 'left' },
  let: { gerund: 'letting', past: 'let', pastParticiple: 'let' },
  make: { gerund: 'making', past: 'made', pastParticiple: 'made' },
  meet: { gerund: 'meeting', past: 'met', pastParticiple: 'met' },
  put: { gerund: 'putting', past: 'put', pastParticiple: 'put' },
  read: { gerund: 'reading', past: 'read', pastParticiple: 'read' },
  run: { gerund: 'running', past: 'ran', pastParticiple: 'run' },
  say: { gerund: 'saying', past: 'said', pastParticiple: 'said' },
  see: { gerund: 'seeing', past: 'saw', pastParticiple: 'seen' },
  sell: { gerund: 'selling', past: 'sold', pastParticiple: 'sold' },
  sit: { gerund: 'sitting', past: 'sat', pastParticiple: 'sat' },
  sleep: { gerund: 'sleeping', past: 'slept', pastParticiple: 'slept' },
  speak: { gerund: 'speaking', past: 'spoke', pastParticiple: 'spoken' },
  stand: { gerund: 'standing', past: 'stood', pastParticiple: 'stood' },
  take: { gerund: 'taking', past: 'took', pastParticiple: 'taken' },
  teach: { gerund: 'teaching', past: 'taught', pastParticiple: 'taught' },
  tell: { gerund: 'telling', past: 'told', pastParticiple: 'told' },
  think: { gerund: 'thinking', past: 'thought', pastParticiple: 'thought' },
  write: { gerund: 'writing', past: 'wrote', pastParticiple: 'written' },
};

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

function sanitizeEnglishGloss(entry: Pick<VerbEntry, 'englishPrimary' | 'englishGlosses'>) {
  const source =
    entry.englishGlosses.find((gloss) => gloss.trim().length > 0 && gloss.length <= 36) ?? entry.englishPrimary;

  const normalized = source
    .replace(/\([^)]*\)/g, '')
    .split(/[;/]/)[0]
    ?.trim()
    .replace(/^to\s+/i, '')
    .replace(/\s+/g, ' ');

  return normalized || entry.englishPrimary.replace(/\([^)]*\)/g, '').trim() || entry.englishPrimary;
}

function inflectEnglishBaseWord(word: string, form: keyof EnglishVerbForms) {
  const irregular = IRREGULAR_ENGLISH_VERBS[word.toLowerCase()];

  if (irregular) {
    return irregular[form];
  }

  if (form === 'gerund') {
    if (word.endsWith('ie')) {
      return `${word.slice(0, -2)}ying`;
    }

    if (word.endsWith('e') && !/(ee|oe|ye)$/.test(word)) {
      return `${word.slice(0, -1)}ing`;
    }

    if (/[aeiou][bcdfghjklmnpqrstvwxyz]$/i.test(word) && !/[wxy]$/i.test(word)) {
      return `${word}${word.slice(-1)}ing`;
    }

    return `${word}ing`;
  }

  if (word.endsWith('e')) {
    return `${word}d`;
  }

  if (/[bcdfghjklmnpqrstvwxyz]y$/i.test(word)) {
    return `${word.slice(0, -1)}ied`;
  }

  if (/[aeiou][bcdfghjklmnpqrstvwxyz]$/i.test(word) && !/[wxy]$/i.test(word)) {
    return `${word}${word.slice(-1)}ed`;
  }

  return `${word}ed`;
}

function inflectEnglishGloss(gloss: string, form: keyof EnglishVerbForms) {
  const [firstWord, ...restWords] = gloss.split(' ');

  if (!firstWord) {
    return gloss;
  }

  const inflectedFirstWord = inflectEnglishBaseWord(firstWord, form);
  return [inflectedFirstWord, ...restWords].join(' ');
}

function capitalizeSentence(value: string) {
  if (!value) {
    return value;
  }

  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function appendExampleObject(gloss: string, entry: Pick<VerbEntry, 'transitivity'>) {
  return entry.transitivity === 'transitive' || entry.transitivity === 'both' ? `${gloss} it` : gloss;
}

function buildJapaneseExample(surface: SurfaceForm, formKey: FormKey) {
  switch (formKey) {
    case 'dictionary':
      return `もう${surface.jp}。`;
    case 'negative':
      return `まだ${surface.jp}。`;
    case 'past':
      return `さっき${surface.jp}。`;
    case 'te':
      return `今、${surface.jp}いる。`;
    case 'potential':
      return `今日は${surface.jp}。`;
    case 'passive':
      return `また${surface.jp}。`;
    case 'causative':
      return `子に${surface.jp}。`;
    case 'causativePassive':
      return `また${surface.jp}。`;
    case 'polite':
      return `今、${surface.jp}。`;
    case 'politePast':
      return `さっき${surface.jp}。`;
    case 'politeNegative':
      return `今日は${surface.jp}。`;
    case 'volitional':
      return `一緒に${surface.jp}。`;
    case 'ba':
      return `${surface.jp}、いい。`;
    case 'tara':
      return `${surface.jp}、帰る。`;
    case 'imperative':
      return `早く${surface.jp}。`;
    case 'prohibitive':
      return `もう${surface.jp}。`;
    default:
      return `${surface.jp}。`;
  }
}

function buildBeExample(formKey: FormKey) {
  switch (formKey) {
    case 'dictionary':
    case 'polite':
      return 'Someone is there now.';
    case 'negative':
    case 'politeNegative':
      return 'No one is there yet.';
    case 'past':
    case 'politePast':
      return 'Someone was there earlier.';
    case 'te':
      return 'Someone is there now.';
    case 'potential':
      return 'Someone can stay there.';
    case 'passive':
      return 'Someone is affected again.';
    case 'causative':
      return 'I make someone stay there.';
    case 'causativePassive':
      return 'I am made to stay there.';
    case 'volitional':
      return "Let's stay there.";
    case 'ba':
      return "If someone is there, that's fine.";
    case 'tara':
      return 'If someone is there, I head home.';
    case 'imperative':
      return 'Be there now.';
    case 'prohibitive':
      return 'Do not stay there.';
    default:
      return 'Someone is there.';
  }
}

function buildEnglishExample(entry: Pick<VerbEntry, 'englishPrimary' | 'englishGlosses' | 'transitivity'>, formKey: FormKey) {
  const gloss = sanitizeEnglishGloss(entry);

  if (gloss === 'be') {
    return buildBeExample(formKey);
  }

  const basePhrase = appendExampleObject(gloss, entry);
  const gerundPhrase = appendExampleObject(inflectEnglishGloss(gloss, 'gerund'), entry);
  const pastPhrase = appendExampleObject(inflectEnglishGloss(gloss, 'past'), entry);
  const pastParticiplePhrase = inflectEnglishGloss(gloss, 'pastParticiple');

  switch (formKey) {
    case 'dictionary':
    case 'polite':
      return `I ${basePhrase} now.`;
    case 'negative':
    case 'politeNegative':
      return `I do not ${basePhrase} yet.`;
    case 'past':
    case 'politePast':
      return `I ${pastPhrase} earlier.`;
    case 'te':
      return `I am ${gerundPhrase} now.`;
    case 'potential':
      return `I can ${basePhrase} today.`;
    case 'passive':
      return entry.transitivity === 'transitive' || entry.transitivity === 'both'
        ? `It gets ${pastParticiplePhrase} again.`
        : 'It happens to someone again.';
    case 'causative':
      return `I make someone ${basePhrase}.`;
    case 'causativePassive':
      return `I am made to ${basePhrase} again.`;
    case 'volitional':
      return `Let's ${basePhrase} together.`;
    case 'ba':
      return `If I ${basePhrase}, that's fine.`;
    case 'tara':
      return `After I ${basePhrase}, I head home.`;
    case 'imperative':
      return `${capitalizeSentence(basePhrase)} now.`;
    case 'prohibitive':
      return `Do not ${basePhrase} anymore.`;
    default:
      return capitalizeSentence(gloss);
  }
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

export function getInflectionExample(
  entry: Pick<VerbEntry, 'englishPrimary' | 'englishGlosses' | 'transitivity'>,
  surface: SurfaceForm,
  formKey: FormKey,
): InflectionExample {
  return {
    japanese: buildJapaneseExample(surface, formKey),
    english: buildEnglishExample(entry, formKey),
  };
}
