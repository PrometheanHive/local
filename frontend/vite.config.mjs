import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // Ensures correct environment
  },

  server: {
    host: '0.0.0.0',  // Allow containerized access
    port: 80,  // Matches frontend container port
    strictPort: true,  // Prevents fallback to random ports
    cors: {
      origin: '*',  // Allow CORS for API calls
      credentials: true,
    },

    // 🔹 Proxy API Calls for Local Dev (Ensure backend API requests work)
    proxy: {
      '/api': {
        target: 'http://backend:5000',  // Correctly route API requests in Docker
        changeOrigin: true,
        secure: false,  // ALB terminates HTTPS
      },
    },

    // 🔥 Fix HMR for AWS ALB & Local Dev
    hmr:
      process.env.NODE_ENV === 'production'
        ? {
            protocol: 'wss', // AWS ALB terminates HTTPS, use secure WebSockets
            host: 'demo.experiencebylocals.com',
            port: 443,
            clientPort: 443, // Ensure frontend connects properly
          }
        : {
            protocol: 'ws',
            host: 'localhost',
            port: 3000, // Ensure WebSockets work in local dev
          },

    watch: {
      usePolling: true, // Ensures file changes are detected inside Docker
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
});
