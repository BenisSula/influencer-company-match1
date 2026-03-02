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
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  base: '/',
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    cssMinify: 'esbuild',
    // Simplified chunking to avoid React loading issues
    // All vendor code will be in one chunk
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    logOverride: { 'css-syntax-error': 'silent' },
  },
});
