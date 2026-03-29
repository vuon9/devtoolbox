import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wails from '@wailsio/runtime/plugins/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), wails('./bindings')],
  server: {
    port: 3000,
    historyApiFallback: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress expected carbon-design-system deprecation warnings
        // until the library updates its internal Sass usage
        silenceDeprecations: ['import', 'global-builtin', 'legacy-js-api'],
        quietDeps: true,
      },
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        spotlight: path.resolve(__dirname, 'spotlight.html'),
      },
    },
  },
});
