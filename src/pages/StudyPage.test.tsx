import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createEmptyProgressStore } from '../lib/progress';
import { getSectionStudyPath } from '../lib/routes';
import { createDefaultSettingsStore } from '../lib/storage';
import type { VerbEntry } from '../types/verb';
import { StudyPage } from './StudyPage';

const speakJapanese = vi.fn();

const mockVerb: VerbEntry = {
  id: 'verb-yomu',
  orthography: '読む',
  reading: 'よむ',
  masteryKey: '読む',
  bccwjRank: 24,
  bccwjOrigin: 'bccwj',
  edictCommon: true,
  inKyoikuBasicVocab: true,
  inRokusyuTaisyo: true,
  rawPos: 'v5m',
  verbClass: 'godan',
  endingGroup: 'mu',
  teFormPattern: 'godan-んで',
  transitivity: 'transitive',
  englishPrimary: 'read',
  englishGlosses: ['read'],
  alternateSpellings: [],
  sameSpellingOtherReadings: [],
  allowedInflections: ['dictionary', 'te'],
  inflectionNotes: [],
  forms: {
    dictionary: {
      jp: '読む',
      reading: 'よむ',
    },
    te: {
      jp: '読んで',
      reading: 'よんで',
    },
  },
};

const mockUseAppState = vi.fn();

vi.mock('../app/AppState', () => ({
  useAppState: () => mockUseAppState(),
}));

vi.mock('../lib/speech', () => ({
  canSpeakJapanese: vi.fn(() => true),
  primeJapaneseVoices: vi.fn(() => true),
  speakJapanese: (...args: unknown[]) => speakJapanese(...args),
}));

describe('StudyPage', () => {
  beforeEach(() => {
    speakJapanese.mockReset();
    mockUseAppState.mockReturnValue({
      verbs: [mockVerb],
      catalogStatus: 'ready',
      progressStore: createEmptyProgressStore(),
      settingsStore: createDefaultSettingsStore(),
      applyStudyPreset: vi.fn(),
      ensureCurriculumSectionSession: vi.fn(),
      recordCurriculumSectionAttempt: vi.fn(() => ({ completed: false })),
      recordReview: vi.fn(),
    });
  });

  function renderStudyPage(initialEntry = '/study') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/section/:sectionNumber" element={<StudyPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('replays the current verb with the spacebar after reveal', async () => {
    renderStudyPage();

    fireEvent.change(screen.getByRole('textbox', { name: /type pronunciation here/i }), {
      target: { value: 'yomu' },
    });
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(speakJapanese).toHaveBeenCalledTimes(1);
    expect(speakJapanese).toHaveBeenLastCalledWith('よむ');
    expect(
      await screen.findByText(/correct! you'll see this again in 2 days\./i),
    ).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /hear again \[space\]/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ', code: 'Space' });

    expect(speakJapanese).toHaveBeenCalledTimes(2);
    expect(speakJapanese).toHaveBeenLastCalledWith('よむ');
  });

  it('shows the guessed text in red-state copy when the answer is wrong', async () => {
    renderStudyPage();

    fireEvent.change(screen.getByRole('textbox', { name: /type pronunciation here/i }), {
      target: { value: 'miru' },
    });
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(
      await screen.findByText((_, element) => element?.textContent === 'Incorrect. You guessed miru.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/correct reading:/i)).toBeInTheDocument();
  });

  it('uses the section route parameter to show the matching section label', async () => {
    renderStudyPage(getSectionStudyPath(1));

    expect(await screen.findByText(/loading section stack/i)).toBeInTheDocument();
    expect(screen.getAllByText('Section 001')).toHaveLength(2);
  });
});
