// public/service-worker.js (Sudah OK)

self.addEventListener('push', (event) => {
    // Menerima payload terenkripsi dari server
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.png', 
      data: data.data || {}, // Data tambahan seperti URL
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    // Logic: Buka tab ke URL booking saat notifikasi di-klik
    const urlToOpen = event.notification.data.url || '/'; // Default ke root
    event.waitUntil(
      clients.openWindow(urlToOpen) 
    );
  });