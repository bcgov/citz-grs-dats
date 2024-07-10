import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
console.log('VITE_API_URL:', process.env.VITE_API_URL);
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
