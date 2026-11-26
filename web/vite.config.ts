import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use '/' on Vercel/web deployments and './' for Electron local file:// loading
  base: process.env.VERCEL ? '/' : './',
  server: {
    port: 3000,
    host: true
  }
});
