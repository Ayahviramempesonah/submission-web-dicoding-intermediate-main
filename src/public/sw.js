// sw.js - Service Worker dasar

// Event ketika service worker diinstal
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installed');
    self.skipWaiting(); // langsung aktifkan tanpa tunggu tab lama ditutup
  });
  
  // Event ketika service worker diaktifkan
  self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activated');
    // bisa tambahkan logic pembersihan cache lama jika ada
  });
  
  // Event untuk menangani push notification (jika nanti digunakan)
  self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    const data = event.data?.json() || { title: 'Notifikasi', body: 'Push message!' };
    
    const options = {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png',
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  