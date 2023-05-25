import { resolve } from 'path';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { version } from './package.json';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default ({ mode }: { mode: string }) => defineConfig({
  assetsInclude: ['**/*.bin', '**/*.fbx', '**/*.glb', '**/*.gltf'],

  resolve: {
    conditions: ['development', 'browser'],
    alias: { '@': resolve('src') }
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

  build: { target: 'esnext' },

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  },

  base: './'
});
