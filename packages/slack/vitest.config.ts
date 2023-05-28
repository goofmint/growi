import tsconfigPaths from 'vite-tsconfig-paths';
import { defineProject } from 'vitest/config';

export default defineProject({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: 'node',
    clearMocks: true,
    globals: true,
  },
});
