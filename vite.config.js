import { defineConfig } from 'vite';
import seoPlugin from './seo-plugin.js';

export default defineConfig({
  root: './',
  base: './',
  plugins: [seoPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  }
});
