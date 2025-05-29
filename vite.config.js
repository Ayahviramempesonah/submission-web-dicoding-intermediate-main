// import { defineConfig } from 'vite';
// import { resolve } from 'path';
// import { VitePWA } from 'vite-plugin-pwa';

// console.log('swSrc path:', 'sw.js');

// export default defineConfig({
//   root: resolve(__dirname, 'src'),

//   plugins: [
//     VitePWA({
//       strategies: 'injectManifest',
//       registerType: 'autoUpdate',
//       injectRegister: false,
//       devOptions: {
//         enabled: true,
//         type: 'module',
//       },

//       // Perbaikan path untuk swSrc
//       srcDir: '', // Karena root sudah di-set ke 'src'
//       swSrc: 'sw.js', // File berada di src/sw.js
//       swDest: 'sw.js', // Output akan ke dist/sw.js

//       globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

//       manifest: {
//         name: 'Storylite Story App',
//         short_name: 'Storylite',
//         description:
//           'A Progressive Web App for sharing stories with offline support and push notifications.',
//         theme_color: '#3498db',
//         background_color: '#ffffff',
//         display: 'standalone',
//         start_url: '/',
//         icons: [
//           { src: 'Storylite.png', sizes: '192x192', type: 'image/png' },
//           { src: 'Storylite.png', sizes: '512x512', type: 'image/png' },
//         ],
//       },
//     }),
//   ],

//   publicDir: resolve(__dirname, 'public'),
//   build: {
//     outDir: resolve(__dirname, 'dist'),
//     emptyOutDir: true,
//   },
// });
// baru
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: resolve(__dirname, 'src'),

  plugins: [
    VitePWA({
      // ===== Core PWA Configuration =====
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      injectRegister: false, // Manual registration for more control
      devOptions: {
        enabled: true,
        type: 'module',
      },

      // ===== Service Worker =====
      srcDir: '',
      swSrc: 'sw.js', // Your custom service worker
      swDest: 'sw.js', // Output to dist/sw.js
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],

      // ===== Installability Boost =====
      manifest: {
        name: 'Storylite Story App',
        short_name: 'Storylite',
        description:
          'A Progressive Web App for sharing stories with offline support and push notifications.',
        theme_color: '#3498db',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        id: '/',
        categories: ['social', 'entertainment'],

        // Icons (MUST include 192x192 and 512x512)
        icons: [
          {
            src: '/android-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: ' maskable',
          },
          {
            src: '/android-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: ' maskable',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // For Android splash screens
          },
          {
            src: '/android-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/android-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any', // For Android splash screens
          },
        ],

        // Screenshots (Required for app store submission)
        screenshots: [
          {
            src: '/ss-desktop-01.png',
            sizes: '1366x768',
            type: 'image/png',
            label: 'Desktop View',
            form_factor: 'wide',
          },
          {
            src: '/ss-android-01.png',
            sizes: '720x1440',
            type: 'image/png',
            label: 'Mobile View',
            form_factor: 'narrow',
          },
        ],

        // App Shortcuts
        shortcuts: [
          {
            name: 'New Story',
            short_name: 'New',
            url: '/stories',
            icons: [{ src: '/android-icons.png', sizes: '96x96' }],
          },
          {
            name: 'My Stories',
            short_name: 'Stories',
            url: '/',
            icons: [{ src: '/android-icons.png', sizes: '96x96' }],
          },
        ],
      },

      // ===== Extra PWA Features =====
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],

  // ===== Build Settings =====
  publicDir: resolve(__dirname, 'public'),

  build: {
    assetsDir: '.',
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
