// src/hooks/usePushSubscription.ts

import { useState, useEffect } from "react";
import axios from 'axios';
// VAPID_PUBLIC_KEY harus didapatkan dari env Next.js
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY; 


export const usePushSubscription = (token : string) => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !token) return;

        const registerAndSubscribe = async () => {
            setIsLoading(true);
            try {
                // 1. Register Service Worker
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker terdaftar.');

                // 2. Dapatkan atau Buat Push Subscription
                let subscription = await registration.pushManager.getSubscription();

                if (subscription) {
                    setIsSubscribed(true);
                    setIsLoading(false);
                    return;
                }

                const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });

                // 3. Kirim Subscription ke Backend
                await axios.post(
                    'http://localhost:3001/subscription', // Ganti dengan URL endpoint Anda
                    subscription,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                
                setIsSubscribed(true);
                console.log('Push Subscription berhasil dikirim ke server.');

            } catch (error) {
                console.error('Gagal mengaktifkan notifikasi push:', error);
                setIsSubscribed(false);
            } finally {
                setIsLoading(false);
            }
        };

        // Meminta izin notifikasi
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                registerAndSubscribe();
            } else {
                console.warn('Izin notifikasi ditolak.');
            }
        });

    }, [token]);

    return { isSubscribed, isLoading };
};

function urlBase64ToUint8Array(_VAPID_PUBLIC_KEY: string | undefined): string | BufferSource | null | undefined {
    throw new Error("Function not implemented.");
}
