import {
  getCompletedSectionIndexFromNavigationState,
  getPathFromLegacyHash,
  getSectionStudyPath,
  parsePositiveRouteNumber,
} from './routes';

describe('routes', () => {
  it('builds and parses positive section route numbers', () => {
    expect(getSectionStudyPath(3)).toBe('/study/section/3');
    expect(parsePositiveRouteNumber('3')).toBe(3);
    expect(parsePositiveRouteNumber('0')).toBeNull();
    expect(parsePositiveRouteNumber('-1')).toBeNull();
    expect(parsePositiveRouteNumber('abc')).toBeNull();
  });

  it('rewrites legacy hash routes to clean browser paths', () => {
    expect(getPathFromLegacyHash('#/study?section=3')).toBe('/study/section/3');
    expect(getPathFromLegacyHash('#/study')).toBe('/study');
    expect(getPathFromLegacyHash('#/stats')).toBe('/stats');
    expect(getPathFromLegacyHash('#/browse')).toBe('/browse');
    expect(getPathFromLegacyHash('')).toBeNull();
  });

  it('reads completion state from router navigation state', () => {
    expect(getCompletedSectionIndexFromNavigationState({ completedSectionIndex: 4 })).toBe(4);
    expect(getCompletedSectionIndexFromNavigationState({ completedSectionIndex: -1 })).toBeNull();
    expect(getCompletedSectionIndexFromNavigationState(null)).toBeNull();
  });
});
