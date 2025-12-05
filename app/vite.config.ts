import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production debugging (optional, set to false if not needed)
    sourcemap: false,

    // Minification with esbuild (faster) or terser (smaller)
    minify: 'esbuild',

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Manual chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion'],
          'icons': ['lucide-react'],
          'http': ['axios', 'laravel-echo', 'pusher-js'],
        },
      },
    },
  },

  // Remove console logs and debuggers in production via esbuild
  esbuild: {
    drop: ['console', 'debugger'],
  },

  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
