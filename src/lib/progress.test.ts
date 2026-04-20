import { createEmptyProgressStore, isTroubleItem, previewGradeResult, recordGrade } from './progress';

describe('recordGrade', () => {
  it('records a correct review and updates interval state', () => {
    const now = new Date('2026-04-15T12:00:00.000Z');
    const store = createEmptyProgressStore();
    const next = recordGrade(store, '食べる', 'te', 'good', now);
    const progress = next.items['食べる'];

    expect(progress.totalSeen).toBe(1);
    expect(progress.totalCorrect).toBe(1);
    expect(progress.streak).toBe(1);
    expect(progress.lastSeenForm).toBe('te');
    expect(progress.perFormFamily.te?.correct).toBe(1);
    expect(Date.parse(progress.dueAt)).toBeGreaterThan(now.getTime());
    expect(next.meta.totalReviews).toBe(1);
    expect(next.meta.currentStreak).toBe(1);
  });

  it('records a miss and schedules the card back soon', () => {
    const first = recordGrade(
      createEmptyProgressStore(),
      '食べる',
      'dictionary',
      'good',
      new Date('2026-04-15T12:00:00.000Z'),
    );
    const missAt = new Date('2026-04-15T12:05:00.000Z');
    const next = recordGrade(first, '食べる', 'dictionary', 'again', missAt);
    const progress = next.items['食べる'];

    expect(progress.lapses).toBe(1);
    expect(progress.streak).toBe(0);
    expect(progress.perFormFamily.dictionary?.wrong).toBe(1);
    expect(Date.parse(progress.dueAt)).toBeLessThanOrEqual(missAt.getTime() + 11 * 60 * 1000);
    expect(next.meta.currentStreak).toBe(0);
  });

  it('previews the next review timing for a known card', () => {
    const now = new Date('2026-04-15T12:00:00.000Z');
    const store = recordGrade(createEmptyProgressStore(), '食べる', 'dictionary', 'good', now);
    const preview = previewGradeResult(store.items['食べる'], 'good', new Date('2026-04-17T12:00:00.000Z'));

    expect(preview.intervalDays).toBeGreaterThanOrEqual(4);
    expect(Date.parse(preview.dueAt)).toBeGreaterThan(Date.parse(store.items['食べる'].dueAt));
  });

  it('flags persistent low-accuracy verbs as trouble items', () => {
    let store = createEmptyProgressStore();

    for (let index = 0; index < 3; index += 1) {
      store = recordGrade(store, '食べる', 'dictionary', 'again', new Date(`2026-04-15T12:0${index}:00.000Z`));
      store = recordGrade(store, '食べる', 'dictionary', 'good', new Date(`2026-04-15T12:1${index}:00.000Z`));
    }

    expect(isTroubleItem(store.items['食べる'])).toBe(true);
  });
});
