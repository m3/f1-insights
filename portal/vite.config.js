import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3010,
    host: true,
    strictPort: true,
    open: false,
    allowedHosts: true
  },
  preview: {
    port: 3010,
    host: true,
    strictPort: true,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'lucide-react']
        }
      }
    }
  }
});
