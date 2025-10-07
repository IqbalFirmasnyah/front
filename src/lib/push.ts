
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+').replace(/_/g, '/');
  const rawData = (typeof window !== 'undefined')
    ? window.atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export async function ensurePermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) throw new Error('Notification API not supported');
  const current = Notification.permission;
  if (current === 'granted' || current === 'denied') return current;
  return await Notification.requestPermission();
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('Service Worker not supported');
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;
  return reg;
}

export async function subscribePush(jwtToken: string) {
  const permission = await ensurePermission();
  if (permission !== 'granted') throw new Error('Notification permission not granted');

  const reg = await registerServiceWorker();

  // Ambil VAPID public key dari Nest
  const keyResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/vapid-public-key`);
  const { publicKey } = await keyResp.json();
  if (!publicKey) throw new Error('Missing VAPID public key');

  // Subscribe via Push API
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  // Kirim subscription ke server untuk disimpan (auth Bearer)
  const body = {
    endpoint: subscription.endpoint,
    keys: (subscription.toJSON() as any).keys,
    userAgent: navigator.userAgent,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Subscribe failed: ${res.status}`);
  return subscription;
}

export async function unsubscribePush(jwtToken: string) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unsubscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwtToken}` },
      credentials: 'include',
    });
  } finally {
    await sub.unsubscribe();
  }
}
