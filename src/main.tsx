import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider } from './app/AppState';
import { App } from './app/App';
import { getPathFromLegacyHash } from './lib/routes';
import './styles.css';

function rewriteLegacyHashUrl() {
  if (typeof window === 'undefined') {
    return;
  }

  const nextPath = getPathFromLegacyHash(window.location.hash);

  if (!nextPath) {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (nextPath !== currentPath) {
    window.history.replaceState(window.history.state, '', nextPath);
  }
}

rewriteLegacyHashUrl();

const routerBase = import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStateProvider>
      <BrowserRouter
        basename={routerBase}
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <App />
      </BrowserRouter>
    </AppStateProvider>
  </React.StrictMode>,
);
