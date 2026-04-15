import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/study', label: 'Study' },
  { to: '/browse', label: 'Browse' },
  { to: '/stats', label: 'Stats' },
  { to: '/settings', label: 'Settings' },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="hero-block">
        <div className="hero-copy stack-sm">
          <p className="eyebrow">Japanese verb recognition</p>
          <h1 className="hero-title">Master high-frequency written verbs through repeated exposure.</h1>
          <p className="hero-text">
            The app focuses on orthographic verb mastery and rotates through inflected forms without splitting
            them into separate cards.
          </p>
        </div>

        <div className="hero-side panel">
          <p className="label">V1 scope</p>
          <ul className="compact-list">
            <li>1000 seed verbs</li>
            <li>Reveal then self-grade</li>
            <li>Client-side only</li>
          </ul>
        </div>
      </header>

      <nav className="tab-row" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => `tab-link${isActive ? ' is-active' : ''}`}
            to={item.to}
            end={item.end}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}
