import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    decorator: {
      legacy: true,
      emitDecoratorMetadata: true,
    },
  },
  test: {
    root: './',
    include: ['tests/**/*.spec.ts'],
    globals: true,
    sequence: {
      concurrent: false,
    },
  },
});
