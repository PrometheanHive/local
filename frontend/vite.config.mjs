import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // Ensures correct environment
  },
  server: {
    allowedHosts: ['demo.experiencebylocals.com', 'localhost'],  // 🔹 Allow ALB + local
    host: '0.0.0.0',
    port: 80, // Ensure this matches frontend container port
    strictPort: true,  // Prevents fallback to random ports

    // Fix HMR (Hot Module Replacement) for ALB & local dev
    hmr:
      process.env.NODE_ENV === 'production'
        ? {
            protocol: 'wss',
            host: 'demo.experiencebylocals.com',
            port: 443, // Use secure WebSockets via ALB
            clientPort: 443,
          }
        : {
            protocol: 'ws',
            host: 'localhost',
            port: 3000, // Ensure local dev uses WebSockets correctly
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
