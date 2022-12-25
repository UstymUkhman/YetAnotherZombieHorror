import { mergeConfig } from 'vite';
import viteConfig from './vite.config';
import { defineConfig } from 'vitest/config';

export default mergeConfig(
  viteConfig({ mode: 'test' }),
  defineConfig({
    test: {
      setupFiles: ['tests/canvas.mock.ts'],
      environment: 'jsdom',
      isolate: false
    }
  })
);
