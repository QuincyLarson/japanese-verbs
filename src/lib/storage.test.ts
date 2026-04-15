import { buildExportPayload, parseImportPayload } from './storage';
import { createEmptyProgressStore } from './progress';
import { DEFAULT_STUDY_SETTINGS } from './filters';

describe('storage import/export', () => {
  it('round-trips a valid export payload', () => {
    const payload = buildExportPayload(createEmptyProgressStore(), {
      version: 1,
      study: DEFAULT_STUDY_SETTINGS,
    });
    const parsed = parseImportPayload(JSON.stringify(payload));

    expect(parsed.ok).toBe(true);
  });

  it('rejects invalid payload content', () => {
    const parsed = parseImportPayload('{"bad":true}');

    expect(parsed.ok).toBe(false);
  });
});
