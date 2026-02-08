import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wails from "@wailsio/runtime/plugins/vite";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wails("./bindings")],
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress expected carbon-design-system deprecation warnings
        // until the library updates its internal Sass usage
        silenceDeprecations: ['modern', 'import', 'global-builtin', 'if-function', 'mixed-decls', 'color-functions'],
        // Handle ~@ibm/plex/... imports from Carbon
        importer: [
          (url) => {
            if (url.startsWith('~')) {
              return { file: url.substring(1) };
            }
            return null;
          }
        ]
      }
    }
  },
  resolve: {
    alias: {
      // Ensure @ibm/plex can be resolved
      '@ibm/plex': path.resolve(__dirname, 'node_modules/@ibm/plex')
    }
  }
})