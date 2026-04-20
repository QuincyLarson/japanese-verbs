import { buildExportPayload, parseImportPayload } from './storage';
import { createEmptyCurriculumState } from './curriculumProgress';
import { createEmptyProgressStore } from './progress';
import { DEFAULT_STUDY_SETTINGS } from './filters';

describe('storage import/export', () => {
  it('round-trips a valid export payload', () => {
    const payload = buildExportPayload(createEmptyProgressStore(), {
      version: 1,
      themePreference: 'dark',
      study: DEFAULT_STUDY_SETTINGS,
      curriculum: createEmptyCurriculumState(),
    });
    const parsed = parseImportPayload(JSON.stringify(payload));

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.settings.themePreference).toBe('dark');
    }
  });

  it('rejects invalid payload content', () => {
    const parsed = parseImportPayload('{"bad":true}');

    expect(parsed.ok).toBe(false);
  });
});
