import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ensureSectionSession } from '../lib/curriculumProgress';
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

  function LocationProbe() {
    const location = useLocation();

    return <output data-testid="location">{location.pathname}</output>;
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
    expect(screen.queryByRole('textbox', { name: /type pronunciation here/i })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /hear again \[space\]/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: ' ', code: 'Space' });

    expect(speakJapanese).toHaveBeenCalledTimes(2);
    expect(speakJapanese).toHaveBeenLastCalledWith('よむ');
  });

  it('accepts IME-converted japanese form input when it matches the displayed verb', async () => {
    renderStudyPage();

    fireEvent.change(screen.getByRole('textbox', { name: /type pronunciation here/i }), {
      target: { value: '読む' },
    });
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText(/correct! you'll see this again in 2 days\./i)).toBeInTheDocument();
  });

  it('hides the input placeholder after the first three completed reviews', () => {
    const progressStore = createEmptyProgressStore();
    progressStore.items[mockVerb.masteryKey] = {
      dueAt: new Date('2026-04-20T12:00:00.000Z').toISOString(),
      intervalDays: 2,
      ease: 2.3,
      streak: 3,
      lapses: 0,
      totalSeen: 3,
      totalCorrect: 3,
      introducedAt: new Date('2026-04-20T12:00:00.000Z').toISOString(),
      perFormFamily: {},
    };

    mockUseAppState.mockReturnValue({
      verbs: [mockVerb],
      catalogStatus: 'ready',
      progressStore,
      settingsStore: createDefaultSettingsStore(),
      applyStudyPreset: vi.fn(),
      ensureCurriculumSectionSession: vi.fn(),
      recordCurriculumSectionAttempt: vi.fn(() => ({ completed: false })),
      recordReview: vi.fn(),
    });

    renderStudyPage();

    expect(screen.getByRole('textbox', { name: /type pronunciation here/i })).not.toHaveAttribute('placeholder');
  });

  it('requires a corrected pronunciation before allowing the next card', async () => {
    renderStudyPage();

    fireEvent.change(screen.getByRole('textbox', { name: /type pronunciation here/i }), {
      target: { value: 'miru' },
    });
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText(/^Incorrect\.$/i)).toBeInTheDocument();
    expect(screen.queryByText(/correct reading:/i)).not.toBeInTheDocument();
    expect(screen.getByText('もう読む。')).toBeInTheDocument();
    expect(screen.getByText('I read it now.')).toBeInTheDocument();
    expect(screen.queryByText(/you guessed/i)).not.toBeInTheDocument();

    const textbox = screen.getByRole('textbox', { name: /type pronunciation here/i });
    const nextButton = screen.getByRole('button', { name: /next verb \[enter\]/i });

    expect(textbox).toHaveValue('miru');
    expect(nextButton).toBeDisabled();

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/^Incorrect\.$/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /type pronunciation here/i })).toHaveValue('miru');

    fireEvent.change(textbox, {
      target: { value: 'yomu' },
    });

    expect(textbox).toHaveValue('yomu');
    expect(nextButton).toBeEnabled();

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText(/^Incorrect\.$/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /type pronunciation here/i })).toHaveValue('');
    expect(screen.getByRole('button', { name: /submit \[enter\]/i })).toBeInTheDocument();
  });

  it('uses the section route parameter to show the matching section label', async () => {
    renderStudyPage(getSectionStudyPath(1));

    expect(await screen.findByText(/loading lesson stack/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /curriculum/i })).toHaveAttribute('href', '/');
    expect(screen.getByText(/^Lesson 1: Essential everyday verbs$/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /curriculum > lesson 1: essential everyday verbs/i })).toBeInTheDocument();
  });

  it('reveals the final lesson card before returning to the curriculum', async () => {
    const settingsStore = createDefaultSettingsStore();

    settingsStore.curriculum = ensureSectionSession(settingsStore.curriculum, 0, [mockVerb.masteryKey]);

    mockUseAppState.mockReturnValue({
      verbs: [mockVerb],
      catalogStatus: 'ready',
      progressStore: createEmptyProgressStore(),
      settingsStore,
      applyStudyPreset: vi.fn(),
      ensureCurriculumSectionSession: vi.fn(),
      recordCurriculumSectionAttempt: vi.fn(() => ({ completed: true })),
      recordReview: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={[getSectionStudyPath(1)]}>
        <Routes>
          <Route path="/" element={<LocationProbe />} />
          <Route path="/study/section/:sectionNumber" element={<StudyPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.change(await screen.findByRole('textbox', { name: /type pronunciation here/i }), {
      target: { value: 'yomu' },
    });
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText(/correct! you'll see this again in 2 days\./i)).toBeInTheDocument();
    expect(screen.queryByTestId('location')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });
});
