"use client";

import { useCallback, useEffect, useState } from "react";

/** Utils: konversi VAPID public key (Base64) ke Uint8Array */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "${process.env.NEXT_PUBLIC_API_URL}";
const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Cek dukungan push di browser (tanpa bergantung pada state agar tak stale) */
function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function usePushSubscription() {
  const [isSupported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const supported = isPushSupported();
    setSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.pushManager.getSubscription().then((s) => setSubscribed(!!s));
      });
    }
  }, []);

  const askAndSubscribe = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    try {
      if (!isPushSupported()) return { ok: false, reason: "Browser tidak mendukung" };
      if (!VAPID) return { ok: false, reason: "NEXT_PUBLIC_VAPID_PUBLIC_KEY belum di-set" };

      // Minta izin (harus dipicu user-gesture dari tombol)
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== "granted") return { ok: false, reason: "Izin notifikasi ditolak" };
      }

      // Pastikan service worker ada di /public/sw.js
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

      // Dapatkan subscription saat ini / buat baru
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID),
        });
      }

      setSubscribed(true);

      // Kirim ke backend untuk disimpan
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") ?? localStorage.getItem("token")
          : null;

      const res = await fetch(`${API}/notification/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        body: JSON.stringify({
          subscription: sub.toJSON(), // gunakan bentuk JSON yang kompatibel
          device: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        try {
          await sub.unsubscribe();
        } catch {}
        setSubscribed(false);
        return { ok: false, reason: `Gagal simpan subscription (${res.status})` };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("[usePushSubscription] subscribe error:", err);
      return { ok: false, reason: err?.message ?? "Gagal enable push" };
    }
  }, []); // aman: kita tidak mengandalkan state di sini (cek dukungan dilakukan runtime)

  const unsubscribe = useCallback(async (): Promise<{ ok: boolean; reason?: string }> => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();

      if (!sub) {
        setSubscribed(false);
        return { ok: true };
      }

      const endpoint = sub.endpoint;
      await sub.unsubscribe();
      setSubscribed(false);

      // Beritahu backend untuk menghapus subscription
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") ?? localStorage.getItem("token")
          : null;

      const res = await fetch(`${API}/notification/subscriptions/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        body: JSON.stringify({ endpoint }),
      });

      if (!res.ok) {
        return { ok: false, reason: `Backend unsubscribe gagal (${res.status})` };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("[usePushSubscription] unsubscribe error:", err);
      return { ok: false, reason: err?.message ?? "Gagal unsubscribe" };
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    askAndSubscribe,
    unsubscribe,
  };
}
