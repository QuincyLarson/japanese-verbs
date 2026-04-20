import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const appBase = process.env.VITE_APP_BASE_PATH || '/';

export default defineConfig({
  base: appBase,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
