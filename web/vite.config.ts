import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5050',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: /^react-native-reanimated$/,
        replacement: path.resolve(__dirname, 'src/mocks/react-native-reanimated.web.ts'),
      },
      {
        find: /^react-native-image-picker$/,
        replacement: path.resolve(__dirname, 'src/mocks/react-native-image-picker.web.ts'),
      },
      {
        find: /^react-native$/,
        replacement: 'react-native-web',
      },
    ],
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.jsx'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      resolveExtensions: ['.web.js', '.web.ts', '.web.tsx', '.js', '.ts', '.tsx'],
    },
  },
});
