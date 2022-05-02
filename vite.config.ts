import path from 'path';
import glsl from 'vite-plugin-glsl';
import { version } from './package.json';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { UserConfigExport, defineConfig } from 'vite';

export default ({ mode }: { mode: string }): UserConfigExport => defineConfig({
  plugins: [svelte(), mode !== 'production' && glsl()],
  assetsInclude: ['fbx', 'glb', 'gltf', 'wat'],
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
