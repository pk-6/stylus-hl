import { defineConfig } from 'vite'

export default defineConfig({
  base: './',  // Important for GitHub Pages
  server: {
    port: 5173,
    open: true
  },
  css: {
    preprocessorOptions: {
      stylus: {
        imports: []
      }
    }
  },
  build: {
    outDir: 'docs',  // Build to docs folder for GitHub Pages
    assetsDir: 'assets',
    sourcemap: false
  }
})