import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { getSectionStudyPath } from '../lib/routes';

const setThemePreference = vi.fn();

vi.mock('../app/AppState', () => ({
  useAppState: () => ({
    settingsStore: {
      themePreference: 'light',
    },
    setThemePreference,
  }),
}));

function StudyProbe() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(getSectionStudyPath(2))} type="button">
      Go to section 2
    </button>
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    setThemePreference.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls to the top immediately on initial render and on route changes', () => {
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    window.scrollTo = scrollTo;

    render(
      <MemoryRouter
        initialEntries={[getSectionStudyPath(1)]}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/study/section/:sectionNumber" element={<StudyProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    fireEvent.click(screen.getByRole('button', { name: /go to section 2/i }));

    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  });
});
