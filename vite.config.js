import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: resolve(__dirname, 'src'),

  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      swSrc: 'sw.js', // Path relative to Vite's root ('src'), so it points to 'src/public/sw.js'
      swDest: resolve(__dirname, 'dist/sw.js'), // Output file Service Worker
      registerType: 'autoUpdate', // Memastikan Service Worker diperbarui otomatis
      injectRegister: 'auto', // Mendaftarkan Service Worker secara otomatis
      devOptions: {
        type: 'module',
        enabled: true,
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // File statis yang ingin dicache
      },

      manifest: {
        name: 'InstaLite',
        short_name: 'App',
        description: 'A Progressive Web App with offline support and push notifications',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // Membuat aplikasi terlihat seperti aplikasi asli
        start_url: '/', // Halaman awal aplikasi
        icons: [
          {
            src: 'images.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'images.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
