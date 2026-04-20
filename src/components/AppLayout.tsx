import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { getOverviewFocusState, getSectionNumberFromStudyPath } from '../lib/routes';
import { HeaderSwitch } from './HeaderSwitch';

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/study', label: 'Next verb' },
  { to: '/index', label: 'Index' },
  { to: '/stats', label: 'Stats' },
];

type ThemeMode = 'light' | 'dark';

function scrollToTopImmediately() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });
  } catch {
    // jsdom does not implement window.scrollTo, so fall through to direct scrollTop writes.
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppLayout() {
  const { settingsStore, setThemePreference } = useAppState();
  const location = useLocation();
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getSystemTheme);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resolvedTheme =
    settingsStore.themePreference === 'system' ? systemTheme : settingsStore.themePreference;
  const currentSectionNumber = getSectionNumberFromStudyPath(location.pathname);
  const curriculumLinkState = currentSectionNumber !== null ? getOverviewFocusState(currentSectionNumber) : undefined;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => {
      setSystemTheme(media.matches ? 'dark' : 'light');
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
      return undefined;
    }

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    scrollToTopImmediately();
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.hash, location.pathname, location.search]);

  return (
    <div className="app-shell">
      <header className="top-bar" aria-label="Primary">
        <Link className="brand" state={curriculumLinkState} to="/">
          JapaneseVerbs.com
        </Link>

        <nav
          className={isMenuOpen ? 'nav-actions is-open' : 'nav-actions'}
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to={item.to}
              end={item.end}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="top-bar__controls">
          <div className="top-bar__switches" role="group" aria-label="Display settings">
            <HeaderSwitch
              ariaLabel="Toggle day night mode"
              offLabel="Day"
              onLabel="Night"
              checked={resolvedTheme === 'dark'}
              onToggle={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
            />
          </div>

          <button
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={isMenuOpen ? 'menu-toggle is-open' : 'menu-toggle'}
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? (
              <svg aria-hidden="true" className="menu-toggle__icon" viewBox="0 0 24 24">
                <path
                  d="M6 6 18 18M18 6 6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg aria-hidden="true" className="menu-toggle__icon" viewBox="0 0 24 24">
                <path
                  d="M4 7.5h16M4 12h16M4 16.5h16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
