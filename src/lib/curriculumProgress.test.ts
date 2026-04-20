import {
  createEmptyCurriculumState,
  ensureSectionSession,
  getSectionProgress,
  recordSectionAttempt,
} from './curriculumProgress';

describe('curriculumProgress', () => {
  it('moves wrong answers to the back of the active section queue', () => {
    const masteryKeys = ['見る', '言う', '行く'];
    const base = ensureSectionSession(createEmptyCurriculumState(), 1, masteryKeys, '2026-04-19T00:00:00.000Z');
    const result = recordSectionAttempt(base, 1, masteryKeys, '見る', false, '2026-04-19T00:01:00.000Z');

    expect(result.completed).toBe(false);
    expect(result.session?.remainingMasteryKeys).toEqual(['言う', '行く', '見る']);
    expect(result.session?.completedMasteryKeys).toEqual([]);
  });

  it('marks a section complete only after every card has been answered correctly', () => {
    const masteryKeys = ['見る', '言う'];
    const started = ensureSectionSession(createEmptyCurriculumState(), 2, masteryKeys, '2026-04-19T00:00:00.000Z');
    const first = recordSectionAttempt(started, 2, masteryKeys, '見る', true, '2026-04-19T00:01:00.000Z');

    expect(first.completed).toBe(false);
    expect(getSectionProgress(first.curriculumState, 2, masteryKeys)).toMatchObject({
      completed: false,
      completedCount: 1,
      remainingCount: 1,
    });

    const second = recordSectionAttempt(first.curriculumState, 2, masteryKeys, '言う', true, '2026-04-19T00:02:00.000Z');

    expect(second.completed).toBe(true);
    expect(getSectionProgress(second.curriculumState, 2, masteryKeys)).toMatchObject({
      completed: true,
      completedCount: 2,
      remainingCount: 0,
    });
  });
});
