import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  server: {
    port: 5173,
    host: true // allow access from phone/tablet on same network
  },
  build: {
    target: 'es2020',
    minify: 'esbuild'
  },
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@gameplay': fileURLToPath(new URL('./src/gameplay', import.meta.url)),
      '@universe': fileURLToPath(new URL('./src/universe', import.meta.url))
    }
  }
});
