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
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    },
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
    outDir: 'dist/renderer',
    chunkSizeWarningLimit: 2000, // Increased from 1000 to 2000 KB
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - Core libraries (handle node_modules first)
          if (id.includes('node_modules')) {
            // Core React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            
            // Data fetching and state management
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            
            // UI and visualization libraries
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            
            // Icons (large dependency)
            if (id.includes('react-icons')) {
              return 'vendor-icons';
            }
            
            // Other node_modules
            return 'vendor-other';
          }
          
          // Admin dashboard pages - Only loaded when visiting admin routes
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          
          // Landing page components - Separate chunk for landing
          if (id.includes('/pages/Landing/') || id.includes('/components/Landing/')) {
            return 'landing';
          }
          
          // Payment related components
          if (id.includes('/pages/Payment') || id.includes('/components/Payment')) {
            return 'payments';
          }
          
          // Campaigns feature
          if (id.includes('/pages/Campaign') || id.includes('/components/Campaign')) {
            return 'campaigns';
          }
          
          // Matching pages - separate chunk for better caching
          if (id.includes('/pages/Matches') || id.includes('/components/MatchCard')) {
            return 'matching';
          }
          
          // Note: Removed fine-grained chunking for messaging, feed, profiles
          // to avoid circular dependencies. These will be bundled in the main chunk
          // or split automatically by Vite's default chunking strategy.
        },
      },
    },
  },
  esbuild: {
    logOverride: { 'css-syntax-error': 'silent' },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
