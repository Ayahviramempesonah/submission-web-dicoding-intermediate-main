import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

console.log('swSrc path:', 'sw.js');

export default defineConfig({
  root: resolve(__dirname, 'src'),

  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },

      // Perbaikan path untuk swSrc
      srcDir: '', // Karena root sudah di-set ke 'src'
      swSrc: 'sw.js', // File berada di src/sw.js
      swDest: 'sw.js', // Output akan ke dist/sw.js

      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

      manifest: {
        name: 'Storylite App',
        short_name: 'Storylite App',
        description:
          'A Progressive Web App for sharing stories with offline support and push notifications.',
        theme_color: '#3498db',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'Storylite.png', sizes: '192x192', type: 'image/png' },
          { src: 'Storylite.png', sizes: '512x512', type: 'image/png' },
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
