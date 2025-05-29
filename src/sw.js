// /src/sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// src/sw.js

// Ini adalah placeholder yang WAJIB ada untuk injectManifest
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

//untuk mode pengembangan fetch
const devMode = false;

// Tambahkan strategi caching dinamis untuk API/story jika perlu
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev ',
  new StaleWhileRevalidate({ cacheName: 'api-cachem' })
);

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  //   const url = new URL(event.request.url);
  // if(devMode){
  //   console.log('Service Worker: Fetching', url);
  // }
  // console.log('Service Worker: Fetching', event.request.url);
});

// self.addEventListener('push', (event) => {
//   console.log('Service worker pushing...');

//   async function chainPromise() {
//     await self.registration.showNotification('Ada laporan baru untuk Anda!', {
//       body: 'lapar abangkuh',
//     });
//   }

//   event.waitUntil(chainPromise());
// });
// baru
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  // const chainPromise = async () => {
  //   try {
  //     // Tidak perlu navigator.serviceWorker.ready di sini
  //     // Karena kita sudah dalam konteks Service Worker
      
  //     // Pastikan event.data ada
  //     if (!event.data) {
  //       console.error('[SW] No data in push event');
  //       return;
  //     }

  //     // Parse data notifikasi
  //     const payload = event.data.json();
  //     console.log('[SW] Push data:', payload);

  //     // Tampilkan notifikasi
  //     await self.registration.showNotification(
  //       payload.title || 'Default Title', 
  //       {
  //         body: payload.body || 'Default message',
  //         icon: '/images/icon.png', // Pastikan path icon benar
  //         badge: '/images/badge.png'
  //       }
  //     );
  //   } catch (error) {
  //     console.error('[SW] Error in push handler:', error);
  //   }
  // };

    async function showNotification() {
    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(showNotification());

  // event.waitUntil(chainPromise());
});