import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No /api proxy needed: on Vercel the serverless function in /api is served
// from the same origin as the static build. Locally, `vercel dev` does the same.
// Plain `vite` also works — Coral falls back to her offline answer bank.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js is the heaviest dependency — split it so the shell paints
          // before the underwater scene finishes downloading.
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
});
