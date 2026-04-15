import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppState } from '../app/AppState';
import { HeaderSwitch } from './HeaderSwitch';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/study', label: 'Study' },
  { to: '/browse', label: 'Browse' },
  { to: '/stats', label: 'Stats' },
  { to: '/settings', label: 'Settings' },
];

type ThemeMode = 'light' | 'dark';

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppLayout() {
  const { settingsStore, setThemePreference } = useAppState();
  const [systemTheme, setSystemTheme] = useState<ThemeMode>(getSystemTheme);
  const resolvedTheme =
    settingsStore.themePreference === 'system' ? systemTheme : settingsStore.themePreference;

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

  return (
    <div className="app-shell">
      <header className="top-bar" aria-label="Primary">
        <NavLink className="brand" end to="/">
          Japanese Verbs
        </NavLink>
        <div className="top-bar__controls">
          <nav className="nav-actions">
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

          <div className="top-bar__switches" role="group" aria-label="Display settings">
            <HeaderSwitch
              ariaLabel="Toggle day night mode"
              offLabel="Day"
              onLabel="Night"
              checked={resolvedTheme === 'dark'}
              onToggle={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
