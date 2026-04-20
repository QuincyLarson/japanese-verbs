const CURATED_LESSON_TITLES = [
  'Essential everyday verbs',
  'Possession, movement, and communication',
  'Common verbs with rarely written kanji',
  'Placement, transfer, and receiving',
  'Change, perception, and teaching',
  'Travel, completion, and support',
  'Daily actions and responsibility',
  'Openings, endings, and movement',
  'Speech, effort, and decision-making',
  'Turns, routines, and arrival',
] as const;

export function getLessonLabel(lessonNumber: number) {
  return `Lesson ${lessonNumber}`;
}

export function getLessonTitle(lessonNumber: number) {
  return CURATED_LESSON_TITLES[lessonNumber - 1] ?? null;
}
