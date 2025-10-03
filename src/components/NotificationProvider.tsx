// src/components/NotificationProvider.tsx

'use client'; 

import { useEffect, useState } from 'react';
import { useSocket } from '@/app/hooks/useSocket';
import { usePushSubscription } from '@/app/hooks/usePushSubscription';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Dalam aplikasi nyata, token dan userId harus didapatkan dari state/context autentikasi
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Ambil token JWT setelah komponen dimuat di client
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // 1. Inisialisasi WebSocket (hanya jika ada token)
  const { notifications } = useSocket(token);

  // 2. Inisialisasi Web Push Subscription (hanya jika ada token)
  useEffect(() => {
    if (token) {
      // Panggil fungsi untuk mendaftar service worker dan push subscription
      usePushSubscription(token);
    }
  }, [token]);

  // Logic untuk menampilkan notifikasi real-time (misalnya toast)
  // Anda bisa menggunakan library seperti react-hot-toast di sini.
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotif = notifications[notifications.length - 1];
      console.log('TOAST NOTIFICATION:', latestNotif.message);
      // Tampilkan toast dengan latestNotif
    }
  }, [notifications]);

  return (
    <>
      {children}
      {/* Opsi: Tampilkan UI notifikasi global di sini */}
    </>
  );
}