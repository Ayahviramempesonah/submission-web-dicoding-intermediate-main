// // public/sw.js
// import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-precaching.prod.mjs';
// import { registerRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-routing.prod.mjs';
// import { NetworkFirst } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-strategies.prod.mjs';
// import { openDB } from 'idb'; // Gunakan library idb untuk IndexedDB

// // Precaching
// const manifest = self.__WB_MANIFEST;
// precacheAndRoute(manifest || []);

// // Inisialisasi IndexedDB
// const dbPromise = openDB('my-story-db', 1, {
//   upgrade(db) {
//     db.createObjectStore('api-cache', { keyPath: 'id' });
//   },
// });

// // Caching untuk API (offline mode)
// registerRoute(
//   ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/'), // Perbaikan pencocokan URL API
//   async ({ request }) => {
//     const cache = await caches.open('api-cache');
//     try {
//       const response = await fetch(request);

//       // Simpan data ke IndexedDB
//       const data = await response.clone().json();
//       const db = await dbPromise;
//       await db.put('api-cache', { id: request.url, data });

//       // Cache respons di browser
//       cache.put(request, response.clone());
//       return response;
//     } catch (error) {
//       // Ambil data dari IndexedDB jika offline
//       const db = await dbPromise;
//       const cachedData = await db.get('api-cache', request.url);
//       if (cachedData) {
//         return new Response(JSON.stringify(cachedData.data), {
//           headers: { 'Content-Type': 'application/json' },
//         });
//       }
//       return new Response('Offline', { status: 503 });
//     }
//   },
// );

// // Push Notification
// self.addEventListener('push', (event) => {
//   console.log('[Service Worker] Push received');
//   const data = event.data.json();
//   console.log('cek data', data);
//   const title = data.title || 'Push Notification';
//   const options = data.options || {};

//   event.waitUntil(self.registration.showNotification(title, options));
// });

// // Handle notifikasi click
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.openWindow(event.notification.data.url || '/#/stories'), // Buka halaman tertentu
//   );
// });

// //

//baru
import { precacheAndRoute } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-precaching.prod.mjs';
import { registerRoute, NavigationRoute, createHandlerBoundToURL } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-routing.prod.mjs';
import { NetworkFirst } from 'https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-strategies.prod.mjs';
import { openDB } from 'idb';
// import { NavigationRoute, createHandlerBoundToURL } from 'workbox-routing';

// Precaching
const manifest = self.__WB_MANIFEST || [];
precacheAndRoute(manifest);

// Allow SPA routes fallback to index.html (Offline support)
let allowlist = undefined;
if (import.meta.env.DEV) {
  allowlist = [/^\/$/];
}

const handler = createHandlerBoundToURL('index.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist,
});

registerRoute(navigationRoute);

// Caching API dengan IndexedDB
registerRoute(
  ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/'),
  async ({ request }) => {
    const cache = await caches.open('api-cache');
    try {
      const response = await fetch(request);

      const data = await response.clone().json();
      const db = await openDB('my-story-db', 1, {
        upgrade(db) {
          db.createObjectStore('api-cache', { keyPath: 'id' });
        },
      });

      await db.put('api-cache', { id: request.url, data });
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const db = await openDB('my-story-db', 1);
      const cachedData = await db.get('api-cache', request.url);
      if (cachedData) {
        return new Response(JSON.stringify(cachedData.data), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response('Offline', { status: 503 });
    }
  },
);

// Push Notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');

  async function showNotificationAsync() {
    if (!event.data) {
      console.error('[Service Worker] Push event but no data');
      // Opsional: tampilkan notifikasi generik jika tidak ada data
      // await self.registration.showNotification('Notifikasi', { body: 'Anda memiliki pesan baru.' });
      return;
    }

    let pushData;
    try {
      pushData = await event.data.json();
      console.log('[Service Worker] Push data (JSON):', pushData);
    } catch (e) {
      console.warn('[Service Worker] Gagal mem-parsing data push sebagai JSON. Mencoba sebagai teks.', e);
      const textData = await event.data.text();
      console.log('[Service Worker] Push data (Text):', textData);
      // Jika Anda mengharapkan pesan teks sederhana, Anda bisa menggunakannya sebagai body
      pushData = {
        title: 'Notifikasi', // Judul default
        options: { body: textData || 'Anda memiliki pesan baru.' },
      };
    }

    const title = pushData.title || 'Push Notification';
    const options = {
      body: pushData.options?.body || 'Anda memiliki pesan baru.',
      icon: pushData.options?.icon || '/images.png', // Icon default dari manifest Anda
      badge: pushData.options?.badge,
      image: pushData.options?.image,
      data: pushData.options?.data || { url: '/#/stories' }, // Pastikan ada data untuk notificationclick
      // ... Opsi Notifikasi lainnya
    };

    await self.registration.showNotification(title, options);
  }

  event.waitUntil(showNotificationAsync());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/#/stories'));
});
