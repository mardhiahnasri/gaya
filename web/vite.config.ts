import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://backend:5050',
        changeOrigin: true,
        // AI calls on a local model can take minutes
        timeout: 300000,
        proxyTimeout: 300000,
      },
    },
  },
});
