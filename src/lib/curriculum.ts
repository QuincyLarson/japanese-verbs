import type { VerbEntry } from '../types/verb';

export const CURRICULUM_SECTION_SIZE = 10;

export const STARTER_PRIORITY = [
  '見る',
  '言う',
  '行く',
  '来る',
  '食べる',
  '読む',
  '書く',
  '聞く',
  '使う',
  '作る',
  '分かる',
  '思う',
  '知る',
  '出る',
  '入る',
  '取る',
  '持つ',
  '会う',
  '話す',
  '買う',
] as const;

function getCurriculumRank(entry: VerbEntry) {
  return entry.bccwjRank + (entry.orthography === '居る' ? 400 : 0);
}

export function orderVerbsForCurriculum(verbs: VerbEntry[]) {
  const byMasteryKey = new Map(verbs.map((entry) => [entry.masteryKey, entry] as const));
  const starter = STARTER_PRIORITY.map((masteryKey) => byMasteryKey.get(masteryKey)).filter(
    (entry): entry is VerbEntry => Boolean(entry),
  );
  const starterKeys = new Set(starter.map((entry) => entry.masteryKey));
  const remaining = verbs
    .filter((entry) => !starterKeys.has(entry.masteryKey))
    .slice()
    .sort((left, right) => getCurriculumRank(left) - getCurriculumRank(right));

  return [...starter, ...remaining];
}

export function getCurriculumSections(verbs: VerbEntry[]) {
  const ordered = orderVerbsForCurriculum(verbs);

  return Array.from({ length: Math.ceil(ordered.length / CURRICULUM_SECTION_SIZE) }, (_, index) =>
    ordered.slice(index * CURRICULUM_SECTION_SIZE, (index + 1) * CURRICULUM_SECTION_SIZE),
  ).filter((chunk) => chunk.length > 0);
}
