export interface OverviewNavigationState {
  completedSectionIndex?: number | null;
  focusSectionIndex?: number | null;
}

const LEGACY_HASH_PREFIX = '#/';
const STUDY_SECTION_PATH_PATTERN = /^\/study\/section\/(\d+)$/;

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

export function getSectionNumberFromStudyPath(pathname: string) {
  const match = pathname.match(STUDY_SECTION_PATH_PATTERN);

  return parsePositiveRouteNumber(match?.[1] ?? null);
}

export function getOverviewFocusState(sectionNumber: number) {
  return {
    focusSectionIndex: sectionNumber - 1,
  } satisfies OverviewNavigationState;
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

export function getFocusSectionIndexFromNavigationState(state: unknown) {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const focusSectionIndex = (state as OverviewNavigationState).focusSectionIndex;

  return typeof focusSectionIndex === 'number' && Number.isInteger(focusSectionIndex) && focusSectionIndex >= 0
    ? focusSectionIndex
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
