import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('location')).toHaveTextContent('/study/section/1');
  });
});
