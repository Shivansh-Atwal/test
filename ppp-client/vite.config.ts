import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
