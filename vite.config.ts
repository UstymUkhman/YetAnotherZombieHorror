import { resolve } from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { version } from './package.json';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default ({ mode }: { mode: string }) => defineConfig({
  base: './',
  // build: { target: 'esnext' },

  resolve: {
    alias: {
      '@components': resolve('src/components'),
      '@': resolve('src')
    }
  },

  define: {
    DEBUG: mode !== 'production' && false,
    TEST: mode !== 'production' && false,
    PRODUCTION: mode === 'production',
    BUILD: JSON.stringify(version),
    STAGING: !!process.env.prod
  },

  plugins: [
    svelte(),
    mode !== 'production' && glsl({
      root: '/src/shaders/',

      include: [
        '**/*.vert',
        '**/*.frag',
        '**/*.glsl'
      ]
    })
  ],

  assetsInclude: [
    '**/*.fbx',
    '**/*.glb',
    '**/*.gltf'
  ],

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});
