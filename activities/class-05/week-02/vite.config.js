// Single page: /learn (deliverable 05B lives as an independent project
// in activities/class-05/week-02 to keep week-01 and week-02 isolated).
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        learn: fileURLToPath(new URL('learn/index.html', import.meta.url))
      }
    }
  }
});