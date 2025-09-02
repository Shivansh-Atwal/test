import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/aptitude': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/question': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/screenshot': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
