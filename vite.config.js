import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false // Désactivé en dev pour éviter confusion
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'EduTrack CM',
        short_name: 'EduTrack',
        description: 'Système de gestion éducative pour le Cameroun',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 heures
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    // Brotli compression (meilleure compression que gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Seulement fichiers >1KB
      deleteOriginFile: false,
    }),
    // Gzip compression (fallback pour anciens navigateurs)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    // Image Optimization - Compress PNG/JPG/WebP
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    })
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
