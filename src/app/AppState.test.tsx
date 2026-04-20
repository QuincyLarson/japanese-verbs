import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AppStateProvider, useAppState } from './AppState';

const MASTERY_KEYS = ['読む', '見る'];

function PersistenceProbe() {
  const {
    settingsStore,
    ensureCurriculumSectionSession,
    recordCurriculumSectionAttempt,
  } = useAppState();

  return (
    <div>
      <output data-testid="completed-sections">
        {settingsStore.curriculum.completedSectionIndexes.join(',')}
      </output>
      <button
        onClick={() => ensureCurriculumSectionSession(0, MASTERY_KEYS)}
        type="button"
      >
        Start section
      </button>
      <button
        onClick={() => recordCurriculumSectionAttempt(0, MASTERY_KEYS, '読む', true)}
        type="button"
      >
        Complete first card
      </button>
      <button
        onClick={() => recordCurriculumSectionAttempt(0, MASTERY_KEYS, '見る', true)}
        type="button"
      >
        Complete second card
      </button>
    </div>
  );
}

describe('AppState persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('restores completed curriculum sections after remounting from localStorage', async () => {
    const firstRender = render(
      <AppStateProvider>
        <PersistenceProbe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /start section/i }));
    fireEvent.click(screen.getByRole('button', { name: /complete first card/i }));

    await waitFor(() => {
      const rawSettings = window.localStorage.getItem('jp-verbs-v1-settings');
      expect(rawSettings).toBeTruthy();
      const settings = JSON.parse(rawSettings ?? '{}');
      expect(settings.curriculum.sectionSessions['0']).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /complete second card/i }));

    await waitFor(() => {
      expect(screen.getByTestId('completed-sections').textContent).toBe('0');
      const rawSettings = window.localStorage.getItem('jp-verbs-v1-settings');
      expect(rawSettings).toBeTruthy();
      const settings = JSON.parse(rawSettings ?? '{}');
      expect(settings.curriculum.completedSectionIndexes).toEqual([0]);
    });

    firstRender.unmount();

    render(
      <AppStateProvider>
        <PersistenceProbe />
      </AppStateProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('completed-sections').textContent).toBe('0');
    });
  });
});
