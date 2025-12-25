import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths()
  ],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      utils: path.resolve(__dirname, './src/utils'),
      hooks: path.resolve(__dirname, './src/hooks'),
      services: path.resolve(__dirname, './src/services'),
      assets: path.resolve(__dirname, './src/assets'),
      store: path.resolve(__dirname, './src/store'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core vendor chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries chunk
          'ui-vendor': [
            'lucide-react',
            'framer-motion',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],

          // Supabase isolated (fixes dynamic import warning)
          'supabase': ['@supabase/supabase-js'],

          // Core services
          'services': [
            './src/services/authService.js',
            './src/services/schoolService.js',
            './src/services/edutrackService.js',
            './src/services/databaseService.js'
          ],

          // Heavy libraries (PDF, Charts) - will be lazy loaded
          'pdf-vendor': ['jspdf'],
          'html2canvas-vendor': ['html2canvas'],
          'charts-vendor': ['recharts', 'd3'],

          // Form libraries
          'form-vendor': ['react-hook-form'],

          // Date utilities
          'date-vendor': ['date-fns'],

          // Context providers
          'contexts': [
            './src/contexts/AuthContext.jsx'
          ]
        }
      }
    },
    // Disable compressed size reporting to speed up build
    reportCompressedSize: false,
  },
  server: {
    port: 3000,
    open: true
  }
});
