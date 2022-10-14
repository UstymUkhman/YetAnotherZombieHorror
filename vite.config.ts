/// <reference types="vitest" />

import { resolve } from 'path';
import glsl from 'vite-plugin-glsl';
import { version } from './package.json';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { type UserConfigExport, defineConfig } from 'vite';

export default ({ mode }: { mode: string }): UserConfigExport => defineConfig({
  plugins: [svelte(), glsl()],
  base: './',

  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@': resolve(__dirname, 'src')
    }
  },

  define: {
    DEBUG: mode !== 'production' && false,
    TEST: mode !== 'production' && true,
    PRODUCTION: mode === 'production',
    BUILD: JSON.stringify(version),
    STAGING: !!process.env.prod
  },

  test: {
    setupFiles: ['vitest-canvas.ts'],
    environment: 'jsdom',
    isolate: false
  },

  assetsInclude: [
    'wat', 'fbx', 'glb', 'gltf'
    // 'vert', 'frag', 'glsl'
  ],

  /* build: {
    assetsInlineLimit: 0,
    target: 'esnext'
  }, */

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});
