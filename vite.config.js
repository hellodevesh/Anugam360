import { defineConfig } from 'vite';
// Static site: no backend, no env vars required. Output goes to dist/.
export default defineConfig({ base: '/', build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 4000 } });
