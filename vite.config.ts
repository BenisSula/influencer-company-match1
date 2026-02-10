import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/renderer/components'),
      '@/theme': path.resolve(__dirname, './src/renderer/theme'),
      '@/layouts': path.resolve(__dirname, './src/renderer/layouts'),
      '@/utils': path.resolve(__dirname, './src/renderer/utils'),
      '@/hooks': path.resolve(__dirname, './src/renderer/hooks'),
    },
  },
  base: './',
  build: {
    outDir: 'dist/renderer',
  },
});
