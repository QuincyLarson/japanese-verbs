import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { App } from './App';

describe('App bootstrap', () => {
  it('renders the curriculum overview placeholder', () => {
    render(
      <HashRouter>
        <App />
      </HashRouter>,
    );

    expect(
      screen.getByRole('heading', {
        name: /build recognition speed across the core written verb deck/i,
      }),
    ).toBeInTheDocument();
  });
});
