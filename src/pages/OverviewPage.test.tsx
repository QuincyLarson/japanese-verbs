import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { getOverviewFocusState } from '../lib/routes';
import { createDefaultSettingsStore } from '../lib/storage';
import type { VerbEntry } from '../types/verb';
import { OverviewPage } from './OverviewPage';

const mockUseAppState = vi.fn();

vi.mock('../app/AppState', () => ({
  useAppState: () => mockUseAppState(),
}));

function buildVerb(index: number): VerbEntry {
  const number = String(index + 1).padStart(3, '0');

  return {
    id: `verb-${number}`,
    orthography: `動詞${number}`,
    reading: `どうし${number}`,
    masteryKey: `動詞${number}`,
    bccwjRank: index + 1,
    bccwjOrigin: 'bccwj',
    edictCommon: true,
    inKyoikuBasicVocab: true,
    inRokusyuTaisyo: true,
    rawPos: 'v1',
    verbClass: 'ichidan',
    endingGroup: 'ru',
    teFormPattern: 'ichidan-て',
    transitivity: 'transitive',
    englishPrimary: `verb ${number}`,
    englishGlosses: [`verb ${number}`],
    alternateSpellings: [],
    sameSpellingOtherReadings: [],
    allowedInflections: ['dictionary'],
    inflectionNotes: [],
    forms: {
      dictionary: {
        jp: `動詞${number}`,
        reading: `どうし${number}`,
      },
    },
  };
}

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

describe('OverviewPage', () => {
  beforeEach(() => {
    mockUseAppState.mockReturnValue({
      verbs: Array.from({ length: 12 }, (_, index) => buildVerb(index)),
      catalogStatus: 'ready',
      settingsStore: createDefaultSettingsStore(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens the current section when enter is pressed on the curriculum view', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /curriculum overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /lesson 1/i })).toBeInTheDocument();
    expect(screen.getByText(/you are here/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start lesson \[enter\]/i })).toHaveAttribute('href', '/study/section/1');

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('location')).toHaveTextContent('/study/section/1');
  });

  it('moves the current lesson marker and start button to the next lesson after a completion', async () => {
    const settingsStore = createDefaultSettingsStore();

    settingsStore.curriculum.completedSectionIndexes = [0];

    mockUseAppState.mockReturnValue({
      verbs: Array.from({ length: 12 }, (_, index) => buildVerb(index)),
      catalogStatus: 'ready',
      settingsStore,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /curriculum overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start lesson \[enter\]/i })).toHaveAttribute('href', '/study/section/2');
    expect(screen.getByRole('link', { name: /lesson 2/i })).toBeInTheDocument();
    expect(screen.getByText(/you are here/i)).toBeInTheDocument();
  });

  it('centers the current lesson when focus state is passed from a lesson route', async () => {
    const scrollTo = vi.fn();

    vi.stubGlobal('scrollTo', scrollTo);
    window.scrollTo = scrollTo;
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2200,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 0,
      height: 100,
      top: 900,
      right: 0,
      bottom: 1000,
      left: 0,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    });

    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: getOverviewFocusState(2) }]}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /curriculum overview/i })).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({
      top: 550,
      left: 0,
      behavior: 'auto',
    });
  });
});
