import path from 'path';
import { version } from './package.json';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { UserConfigExport, defineConfig } from 'vite';

export default ({ mode }: { mode: string }): UserConfigExport => defineConfig({
  assetsInclude: ['fbx', 'glb', 'gltf', 'wat'],
  plugins: [svelte()],
  base: './',

  define: {
    BUILD: JSON.stringify(version),
    PRODUCTION: mode === 'production',
    'process.env.NODE_ENV': JSON.stringify(mode)
  },

  resolve: { alias: {
    '@components': path.resolve(__dirname, 'src/components'),
    '@': path.resolve(__dirname, 'src')
  }},

  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
});
