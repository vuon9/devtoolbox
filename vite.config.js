import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Suppress expected carbon-design-system deprecation warnings
        // until the library updates its internal Sass usage
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'if-function', 'mixed-decls', 'color-functions']
      }
    }
  }
})
