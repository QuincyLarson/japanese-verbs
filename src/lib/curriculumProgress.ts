import type { CurriculumState, SectionSession } from '../types/study';

function getSectionKey(sectionIndex: number) {
  return String(sectionIndex);
}

function uniqueNumericIndexes(indexes: readonly number[]) {
  return Array.from(new Set(indexes.filter((index) => Number.isInteger(index) && index >= 0))).sort(
    (left, right) => left - right,
  );
}

function normalizeMasteryKeys(masteryKeys: readonly string[]) {
  return Array.from(new Set(masteryKeys.filter(Boolean)));
}

function normalizeSectionSession(
  session: SectionSession,
  masteryKeys: readonly string[],
): SectionSession | null {
  const normalizedMasteryKeys = normalizeMasteryKeys(masteryKeys);

  if (normalizedMasteryKeys.length === 0) {
    return null;
  }

  const completedMasteryKeys = normalizeMasteryKeys(session.completedMasteryKeys).filter((masteryKey) =>
    normalizedMasteryKeys.includes(masteryKey),
  );
  const queuedMasteryKeys = normalizeMasteryKeys(session.remainingMasteryKeys).filter(
    (masteryKey) =>
      normalizedMasteryKeys.includes(masteryKey) && !completedMasteryKeys.includes(masteryKey),
  );
  const missingMasteryKeys = normalizedMasteryKeys.filter(
    (masteryKey) =>
      !completedMasteryKeys.includes(masteryKey) && !queuedMasteryKeys.includes(masteryKey),
  );
  const remainingMasteryKeys = [...queuedMasteryKeys, ...missingMasteryKeys];

  if (remainingMasteryKeys.length === 0) {
    return null;
  }

  return {
    sectionIndex: session.sectionIndex,
    remainingMasteryKeys,
    completedMasteryKeys,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
  };
}

export function createEmptyCurriculumState(): CurriculumState {
  return {
    completedSectionIndexes: [],
    sectionSessions: {},
  };
}

export function createSectionSession(
  sectionIndex: number,
  masteryKeys: readonly string[],
  nowIso = new Date().toISOString(),
): SectionSession {
  return {
    sectionIndex,
    remainingMasteryKeys: normalizeMasteryKeys(masteryKeys),
    completedMasteryKeys: [],
    startedAt: nowIso,
    updatedAt: nowIso,
  };
}

export function getSectionSession(
  curriculumState: CurriculumState,
  sectionIndex: number,
  masteryKeys: readonly string[],
) {
  const session = curriculumState.sectionSessions[getSectionKey(sectionIndex)];

  if (!session) {
    return null;
  }

  return normalizeSectionSession(session, masteryKeys);
}

export function ensureSectionSession(
  curriculumState: CurriculumState,
  sectionIndex: number,
  masteryKeys: readonly string[],
  nowIso = new Date().toISOString(),
): CurriculumState {
  const normalizedMasteryKeys = normalizeMasteryKeys(masteryKeys);

  if (normalizedMasteryKeys.length === 0) {
    return curriculumState;
  }

  const sectionKey = getSectionKey(sectionIndex);
  const existing = getSectionSession(curriculumState, sectionIndex, normalizedMasteryKeys);

  if (existing) {
    if (
      existing === curriculumState.sectionSessions[sectionKey] ||
      (existing.remainingMasteryKeys.join('|') ===
        curriculumState.sectionSessions[sectionKey]?.remainingMasteryKeys.join('|') &&
        existing.completedMasteryKeys.join('|') ===
          curriculumState.sectionSessions[sectionKey]?.completedMasteryKeys.join('|'))
    ) {
      return curriculumState;
    }

    return {
      ...curriculumState,
      sectionSessions: {
        ...curriculumState.sectionSessions,
        [sectionKey]: existing,
      },
    };
  }

  return {
    ...curriculumState,
    sectionSessions: {
      ...curriculumState.sectionSessions,
      [sectionKey]: createSectionSession(sectionIndex, normalizedMasteryKeys, nowIso),
    },
  };
}

export function getSectionProgress(
  curriculumState: CurriculumState,
  sectionIndex: number,
  masteryKeys: readonly string[],
) {
  const total = normalizeMasteryKeys(masteryKeys).length;
  const completed = curriculumState.completedSectionIndexes.includes(sectionIndex);
  const session = getSectionSession(curriculumState, sectionIndex, masteryKeys);

  if (completed) {
    return {
      completed: true,
      completedCount: total,
      remainingCount: 0,
      activeSession: Boolean(session),
      currentMasteryKey: session?.remainingMasteryKeys[0],
    };
  }

  return {
    completed: false,
    completedCount: session?.completedMasteryKeys.length ?? 0,
    remainingCount: session?.remainingMasteryKeys.length ?? total,
    activeSession: Boolean(session),
    currentMasteryKey: session?.remainingMasteryKeys[0],
  };
}

export function recordSectionAttempt(
  curriculumState: CurriculumState,
  sectionIndex: number,
  masteryKeys: readonly string[],
  masteryKey: string,
  isCorrect: boolean,
  nowIso = new Date().toISOString(),
) {
  const normalizedState = ensureSectionSession(curriculumState, sectionIndex, masteryKeys, nowIso);
  const sectionKey = getSectionKey(sectionIndex);
  const session = getSectionSession(normalizedState, sectionIndex, masteryKeys);

  if (!session) {
    return {
      curriculumState: normalizedState,
      completed: false,
      session: null,
    };
  }

  const remainingMasteryKeys = session.remainingMasteryKeys.filter(
    (queuedKey, index) => queuedKey !== masteryKey || index !== 0,
  );
  const fallbackRemainingMasteryKeys =
    remainingMasteryKeys.length === session.remainingMasteryKeys.length
      ? session.remainingMasteryKeys.filter((queuedKey) => queuedKey !== masteryKey)
      : remainingMasteryKeys;

  const nextRemainingMasteryKeys = isCorrect
    ? fallbackRemainingMasteryKeys
    : [...fallbackRemainingMasteryKeys, masteryKey];
  const completedMasteryKeys = isCorrect
    ? normalizeMasteryKeys([...session.completedMasteryKeys, masteryKey])
    : session.completedMasteryKeys;

  if (nextRemainingMasteryKeys.length === 0) {
    return {
      curriculumState: {
        ...normalizedState,
        completedSectionIndexes: uniqueNumericIndexes([
          ...normalizedState.completedSectionIndexes,
          sectionIndex,
        ]),
        sectionSessions: Object.fromEntries(
          Object.entries(normalizedState.sectionSessions).filter(([key]) => key !== sectionKey),
        ),
      },
      completed: true,
      session: null,
    };
  }

  const nextSession: SectionSession = {
    ...session,
    remainingMasteryKeys: nextRemainingMasteryKeys,
    completedMasteryKeys,
    updatedAt: nowIso,
  };

  return {
    curriculumState: {
      ...normalizedState,
      sectionSessions: {
        ...normalizedState.sectionSessions,
        [sectionKey]: nextSession,
      },
    },
    completed: false,
    session: nextSession,
  };
}
