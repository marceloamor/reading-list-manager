/**
 * Vite Configuration for Reading List Manager Frontend
 *
 * This file configures Vite for development and build processes.
 * It includes Svelte support, development server settings, and build optimisations.
 *
 * Learning Notes:
 * - Vite is a fast build tool and development server
 * - It provides hot module replacement (HMR) for fast development
 * - The proxy setting allows the frontend to communicate with the backend
 */

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],

  // Development server configuration
  server: {
    port: 5173, // Default Vite port
    open: true, // Automatically open browser
    cors: true, // Enable CORS for development

    // Proxy API requests to backend server
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Changed from port 3000 to 3001
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Generate source maps for debugging

    // Rollup options for build optimisation
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ['svelte']
        }
      }
    },

    // Target modern browsers
    target: 'es2020'
  },

  // Preview server configuration (for built app)
  preview: {
    port: 4173,
    open: true
  },

  // Define global constants
  define: {
    // Make environment variables available in the app
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '/api')
  },

  // CSS configuration
  css: {
    devSourcemap: true, // Enable CSS source maps in development
  },

  // Optimisation dependencies (pre-bundle in development)
  optimizeDeps: {
    include: ['svelte']
  }
})
