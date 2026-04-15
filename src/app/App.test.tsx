import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from './AppState';
import { App } from './App';

describe('App bootstrap', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the curriculum overview placeholder', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(
      <AppStateProvider>
        <MemoryRouter
          initialEntries={['/']}
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <App />
        </MemoryRouter>
      </AppStateProvider>,
    );

    expect(
      await screen.findByRole('heading', {
        name: /curriculum overview/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('switch', {
        name: /toggle day night mode/i,
      }),
    ).toBeInTheDocument();
  });
});
