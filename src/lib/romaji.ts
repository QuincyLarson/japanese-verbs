const DIGRAPH_MAP: Record<string, string> = {
  きゃ: 'kya',
  きゅ: 'kyu',
  きょ: 'kyo',
  ぎゃ: 'gya',
  ぎゅ: 'gyu',
  ぎょ: 'gyo',
  しゃ: 'sha',
  しゅ: 'shu',
  しょ: 'sho',
  じゃ: 'ja',
  じゅ: 'ju',
  じょ: 'jo',
  ちゃ: 'cha',
  ちゅ: 'chu',
  ちょ: 'cho',
  にゃ: 'nya',
  にゅ: 'nyu',
  にょ: 'nyo',
  ひゃ: 'hya',
  ひゅ: 'hyu',
  ひょ: 'hyo',
  びゃ: 'bya',
  びゅ: 'byu',
  びょ: 'byo',
  ぴゃ: 'pya',
  ぴゅ: 'pyu',
  ぴょ: 'pyo',
  みゃ: 'mya',
  みゅ: 'myu',
  みょ: 'myo',
  りゃ: 'rya',
  りゅ: 'ryu',
  りょ: 'ryo',
  ゔぁ: 'va',
  ゔぃ: 'vi',
  ゔぇ: 've',
  ゔぉ: 'vo',
  ゔゅ: 'vyu',
};

const MONOGRAPH_MAP: Record<string, string> = {
  あ: 'a',
  い: 'i',
  う: 'u',
  え: 'e',
  お: 'o',
  か: 'ka',
  き: 'ki',
  く: 'ku',
  け: 'ke',
  こ: 'ko',
  が: 'ga',
  ぎ: 'gi',
  ぐ: 'gu',
  げ: 'ge',
  ご: 'go',
  さ: 'sa',
  し: 'shi',
  す: 'su',
  せ: 'se',
  そ: 'so',
  ざ: 'za',
  じ: 'ji',
  ず: 'zu',
  ぜ: 'ze',
  ぞ: 'zo',
  た: 'ta',
  ち: 'chi',
  つ: 'tsu',
  て: 'te',
  と: 'to',
  だ: 'da',
  ぢ: 'ji',
  づ: 'zu',
  で: 'de',
  ど: 'do',
  な: 'na',
  に: 'ni',
  ぬ: 'nu',
  ね: 'ne',
  の: 'no',
  は: 'ha',
  ひ: 'hi',
  ふ: 'fu',
  へ: 'he',
  ほ: 'ho',
  ば: 'ba',
  び: 'bi',
  ぶ: 'bu',
  べ: 'be',
  ぼ: 'bo',
  ぱ: 'pa',
  ぴ: 'pi',
  ぷ: 'pu',
  ぺ: 'pe',
  ぽ: 'po',
  ま: 'ma',
  み: 'mi',
  む: 'mu',
  め: 'me',
  も: 'mo',
  や: 'ya',
  ゆ: 'yu',
  よ: 'yo',
  ら: 'ra',
  り: 'ri',
  る: 'ru',
  れ: 're',
  ろ: 'ro',
  わ: 'wa',
  ゐ: 'wi',
  ゑ: 'we',
  を: 'o',
  ん: 'n',
  ゔ: 'vu',
  ぁ: 'a',
  ぃ: 'i',
  ぅ: 'u',
  ぇ: 'e',
  ぉ: 'o',
  ゎ: 'wa',
  ゕ: 'ka',
  ゖ: 'ke',
};

function toHiragana(value: string) {
  return value.replace(/[\u30a1-\u30f6]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0x60),
  );
}

function isSmallKana(character: string) {
  return ['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゎ'].includes(character);
}

function getSokuonConsonant(nextRomaji: string) {
  if (!nextRomaji) {
    return '';
  }

  if (nextRomaji.startsWith('ch')) {
    return 't';
  }

  if (nextRomaji.startsWith('sh')) {
    return 's';
  }

  if (nextRomaji.startsWith('ts')) {
    return 't';
  }

  const match = nextRomaji.match(/^[bcdfghjklmnpqrstvwxyz]/);
  return match?.[0] ?? '';
}

export function kanaToRomaji(value: string) {
  const source = toHiragana(value.normalize('NFKC'));
  let result = '';

  for (let index = 0; index < source.length; index += 1) {
    const current = source[index];
    const next = source[index + 1] ?? '';
    const pair = `${current}${next}`;

    if (current === 'っ') {
      const nextPair = `${next}${source[index + 2] ?? ''}`;
      const nextRomaji = DIGRAPH_MAP[nextPair] ?? MONOGRAPH_MAP[next] ?? '';
      result += getSokuonConsonant(nextRomaji);
      continue;
    }

    if (current === 'ー') {
      const lastVowelMatch = result.match(/[aeiou](?!.*[aeiou])/);
      result += lastVowelMatch?.[0] ?? '';
      continue;
    }

    if (DIGRAPH_MAP[pair]) {
      result += DIGRAPH_MAP[pair];
      index += 1;
      continue;
    }

    if (isSmallKana(current)) {
      result += MONOGRAPH_MAP[current] ?? '';
      continue;
    }

    result += MONOGRAPH_MAP[current] ?? current;
  }

  return result;
}

export function normalizeLatinSearch(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
