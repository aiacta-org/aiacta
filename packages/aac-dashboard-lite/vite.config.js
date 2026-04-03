import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Disable publicDir: the root index.html is the Vite entry point.
  // public/index.html existed before this fix but was in the wrong location —
  // Vite's entry must be at the project root, not in public/.
  // Setting publicDir: false prevents public/index.html from being copied
  // to dist/ and overwriting the correctly built index.html.
  publicDir: false,

  server: {
    port: 5173,
    proxy: {
      '/v1': { target: 'http://localhost:3100', changeOrigin: true },
    },
  },

  build: { outDir: 'dist' },
});
