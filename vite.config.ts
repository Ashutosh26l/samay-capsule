import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ✅ Required for Vercel if using dist
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
