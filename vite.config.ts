import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        challengeAuth: resolve(projectRoot, 'src/challenge-auth.ts'),
      },
      output: {
        // The standalone challenge document lives under /public. Give its
        // separately bundled auth entry a stable URL that the static page can load.
        entryFileNames: (chunk) => chunk.name === 'challengeAuth'
          ? 'challenge-auth.js'
          : 'assets/[name]-[hash].js',
      },
    },
  },
});
