import { defineConfig } from 'vite'

// Set BASE_PATH=/repo-name/ when deploying to GitHub Pages project sites.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
  },
})
