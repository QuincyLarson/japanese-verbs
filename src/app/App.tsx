import { Link, Route, Routes } from 'react-router-dom';

function PlaceholderPage({ title, body }: { title: string; body: string }) {
  return (
    <section className="panel stack">
      <p className="eyebrow">Bootstrap</p>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header panel">
        <div>
          <p className="eyebrow">Japanese verbs</p>
          <strong>Recognition practice</strong>
        </div>
        <nav className="nav-row" aria-label="Primary">
          <Link to="/">Overview</Link>
          <Link to="/study">Study</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/stats">Stats</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-frame">
        <Routes>
          <Route
            path="/"
            element={
              <PlaceholderPage
                title="Curriculum overview"
                body="The working app shell is in place. Next steps add the real overview, persistent study state, and the review workflow."
              />
            }
          />
          <Route
            path="/study"
            element={
              <PlaceholderPage
                title="Study"
                body="The reveal and self-grade loop will land here once local progress and scheduling are implemented."
              />
            }
          />
          <Route
            path="/browse"
            element={
              <PlaceholderPage
                title="Browse verbs"
                body="This route will expose searchable verb details from the provided seed deck."
              />
            }
          />
          <Route
            path="/stats"
            element={
              <PlaceholderPage
                title="Stats"
                body="This route will summarize introduced verbs, burned items, and weak form families."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                body="Import and export of local progress will be added here."
              />
            }
          />
          <Route
            path="/annex"
            element={
              <PlaceholderPage
                title="する verb annex"
                body="The V1 core deck excludes noun-plus-する verbs. This route will stay as a reference placeholder."
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
