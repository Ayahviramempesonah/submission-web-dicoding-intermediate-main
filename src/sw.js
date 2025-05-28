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
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new StaleWhileRevalidate({ cacheName: 'api-cache' }),
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
  console.log('[Service worker] pushing...');

  async function showNotification() {
    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(showNotification());
});
