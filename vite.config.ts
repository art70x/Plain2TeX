import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // https://github.com/unplugin/unplugin-auto-import
    AutoImport({
      include: [/\.[tj]sx?$/],
      imports: ['react', 'react-router-dom'],
      dirs: ['src/hooks', 'src/lib', 'src/contexts'],
      dirsScanOptions: {
        filePatterns: ['*.ts'],
        types: true,
      },
      dts: 'src/auto-imports.d.ts',
    }),

    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: 'autoUpdate',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'Plain2TeX',
        short_name: 'EQ2TeX',
        description:
          'Convert plain-text math expressions to professionally typeset LaTeX instantly. Export as PNG or SVG with one click.',

        start_url: '/',
        scope: '/',
        id: '/',

        display: 'standalone',
        orientation: 'portrait',

        theme_color: '#0e69ff',
        background_color: '#09090b',

        lang: 'en-US',
        dir: 'ltr',

        categories: ['education', 'productivity', 'utilities'],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),

    tailwindcss(),
    react(),
  ],

  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
      components: fileURLToPath(new URL('src/components', import.meta.url)),
    },
  },
})
