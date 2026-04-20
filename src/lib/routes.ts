export interface OverviewNavigationState {
  completedSectionIndex?: number | null;
}

const LEGACY_HASH_PREFIX = '#/';

export function parsePositiveRouteNumber(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function getSectionStudyPath(sectionNumber: number) {
  return `/study/section/${sectionNumber}`;
}

export function getCompletedSectionIndexFromNavigationState(state: unknown) {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const completedSectionIndex = (state as OverviewNavigationState).completedSectionIndex;

  return typeof completedSectionIndex === 'number' && Number.isInteger(completedSectionIndex) && completedSectionIndex >= 0
    ? completedSectionIndex
    : null;
}

export function getPathFromLegacyHash(hash: string) {
  if (!hash.startsWith(LEGACY_HASH_PREFIX)) {
    return null;
  }

  const legacyUrl = new URL(hash.slice(1), 'https://japaneseverbs.local');
  const sectionNumber = parsePositiveRouteNumber(legacyUrl.searchParams.get('section'));

  if (legacyUrl.pathname === '/study' && sectionNumber !== null) {
    return getSectionStudyPath(sectionNumber);
  }

  if (legacyUrl.pathname === '/' || legacyUrl.pathname === '/study' || legacyUrl.pathname === '/index' || legacyUrl.pathname === '/browse' || legacyUrl.pathname === '/stats' || legacyUrl.pathname === '/annex') {
    return legacyUrl.pathname;
  }

  return legacyUrl.pathname || '/';
}
