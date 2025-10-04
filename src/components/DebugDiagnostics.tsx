// src/components/DebugDiagnostics.tsx
"use client";

import { useEffect } from "react";

export default function DebugDiagnostics() {
  useEffect(() => {
    // 1) Cek WebSocket URL (ingat: ini di-inline saat build)
    // pastikan env kamu DIDEFINISIKAN dengan prefix NEXT_PUBLIC_
    // mis. NEXT_PUBLIC_SOCKET_URL
    // eslint-disable-next-line no-console
    console.log("SOCKET_URL:", process.env.NEXT_PUBLIC_SOCKET_URL);

    // 2) Cek Service Worker + Push
    (async () => {
        console.log('Permission:', Notification.permission);
        const reg = await navigator.serviceWorker.getRegistration();
        console.log('SW:', !!reg, reg?.scope);       // ⬅️ harus true dan scope-nya / 
        const sub = await reg?.pushManager.getSubscription();
        console.log('Sub:', !!sub, sub?.endpoint);   // ⬅️ harus true setelah subscribe
      })();
      
  }, []);

  return null; // non-visual
}
