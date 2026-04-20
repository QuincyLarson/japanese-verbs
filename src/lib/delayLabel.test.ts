import { describe, expect, it } from 'vitest';
import { formatDelayLabel } from './delayLabel';

describe('formatDelayLabel', () => {
  const now = new Date('2026-04-19T00:00:00.000Z');

  it('rounds day delays to whole days', () => {
    expect(formatDelayLabel('2026-04-21T12:00:00.000Z', now)).toBe('3 days');
  });

  it('switches to weeks after seven days', () => {
    expect(formatDelayLabel('2026-04-28T00:00:00.000Z', now)).toBe('1 week');
    expect(formatDelayLabel('2026-05-10T00:00:00.000Z', now)).toBe('3 weeks');
  });

  it('switches to months for longer delays', () => {
    expect(formatDelayLabel('2026-05-19T00:00:00.000Z', now)).toBe('1 month');
    expect(formatDelayLabel('2026-06-18T00:00:00.000Z', now)).toBe('2 months');
  });
});
