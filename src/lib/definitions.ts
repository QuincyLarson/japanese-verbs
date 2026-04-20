import type { VerbEntry } from '../types/verb';

const OPPOSITE_TRANSITIVITY: Partial<Record<VerbEntry['transitivity'], VerbEntry['transitivity']>> = {
  transitive: 'intransitive',
  intransitive: 'transitive',
};

function getFirstKanji(value: string) {
  return value.match(/[一-龯々]/)?.[0] ?? null;
}

function getSharedReadingPrefixLength(left: string, right: string) {
  let index = 0;

  while (index < left.length && index < right.length && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function getEnglishPrimaryTokens(value: string) {
  return Array.from(new Set((value.toLowerCase().match(/[a-z]+/g) ?? []).filter((token) => token.length >= 4)));
}

function isPairLikeJapaneseFamily(left: VerbEntry, right: VerbEntry) {
  const leftFirstKanji = getFirstKanji(left.orthography);
  const rightFirstKanji = getFirstKanji(right.orthography);

  if (leftFirstKanji && rightFirstKanji) {
    return leftFirstKanji === rightFirstKanji;
  }

  if (leftFirstKanji || rightFirstKanji) {
    return false;
  }

  return getSharedReadingPrefixLength(left.reading, right.reading) >= 3;
}

function hasRelatedEnglishPrimary(left: VerbEntry, right: VerbEntry) {
  if (left.englishPrimary === right.englishPrimary) {
    return true;
  }

  const leftTokens = getEnglishPrimaryTokens(left.englishPrimary);
  const rightTokens = getEnglishPrimaryTokens(right.englishPrimary);
  const orthographyLengthDifference = Math.abs(Array.from(left.orthography).length - Array.from(right.orthography).length);

  if (orthographyLengthDifference > 1) {
    return false;
  }

  return leftTokens.some((leftToken) =>
    rightTokens.some(
      (rightToken) =>
        leftToken === rightToken ||
        leftToken.includes(rightToken) ||
        rightToken.includes(leftToken),
    ),
  );
}

export function shouldShowTransitivityDefinitionHint(entry: VerbEntry, verbs: readonly VerbEntry[]) {
  const oppositeTransitivity = OPPOSITE_TRANSITIVITY[entry.transitivity];

  if (!oppositeTransitivity || !entry.edictCommon) {
    return false;
  }

  return verbs.some(
    (candidate) =>
      candidate.id !== entry.id &&
      candidate.edictCommon &&
      candidate.transitivity === oppositeTransitivity &&
      isPairLikeJapaneseFamily(entry, candidate) &&
      hasRelatedEnglishPrimary(entry, candidate),
  );
}

export function formatEnglishDefinition(entry: VerbEntry, verbs: readonly VerbEntry[]) {
  if (!shouldShowTransitivityDefinitionHint(entry, verbs)) {
    return entry.englishPrimary;
  }

  return `${entry.englishPrimary} [${entry.transitivity}]`;
}
