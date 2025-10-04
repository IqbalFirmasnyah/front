// src/components/NotificationProvider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/app/hooks/useSocket';
import { usePushSubscription } from '@/app/hooks/usePushSubscription';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // Ambil token JWT setelah komponen mount di client
  useEffect(() => {
    const storedToken =
      localStorage.getItem('access_token') ?? localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  // 1) Inisialisasi WebSocket (kalau hook kamu memang butuh token)
  const { notifications } = useSocket(token ?? undefined);

  // 2) Ambil fungsi dari hook push (TANPA argumen di sini)
  const { askAndSubscribe } = usePushSubscription();

  // 3) Trigger subscribe push setelah token tersedia
  useEffect(() => {
    if (token) {
      // Hook-nya sendiri tidak menerima argumen; dia baca token dari localStorage.
      // Kalau kamu ingin kirim token, modifikasi hook-nya (lihat catatan di bawah).
      askAndSubscribe();
    }
  }, [token, askAndSubscribe]);

  // 4) Tampilkan notifikasi realtime (contoh simple)
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      console.log('TOAST NOTIFICATION:', latest.message);
      // di sini kamu bisa panggil toast() / UI lain
    }
  }, [notifications]);

  return <>{children}</>;
}
