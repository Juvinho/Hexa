import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    include: ['tests/**/*.ts'],
    exclude: ['**/*.d.ts', 'node_modules', 'dist'],
  },
});
