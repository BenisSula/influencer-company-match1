import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
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
});
