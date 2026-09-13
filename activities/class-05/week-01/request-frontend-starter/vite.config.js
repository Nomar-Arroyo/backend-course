// Single-page setup from the starter: /app (deliverable 05A).
// The 05B (/learn) deliverable lives as an independent project in
// activities/class-05/week-02.
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        app: fileURLToPath(new URL('app/index.html', import.meta.url))
      }
    }
  }
});
