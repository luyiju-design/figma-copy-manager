import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['iife'],
      name: 'PluginMain',
      fileName: () => 'main.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
  },
});
