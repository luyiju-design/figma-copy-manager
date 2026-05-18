import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: 'src/ui',
  base: './',
  envDir: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
