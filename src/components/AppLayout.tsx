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
      <header className="top-bar" aria-label="Primary">
        <NavLink className="brand" end to="/">
          Japanese Verbs
        </NavLink>
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
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
