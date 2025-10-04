'use client';
import { useEffect, useState } from 'react';
import { subscribePush } from '@/lib/push';

export default function EnablePushButton({ jwt }: { jwt: string }) {
  const [status, setStatus] = useState<'idle'|'enabling'|'enabled'|'error'>('idle');
  const [error, setError] = useState<string>('');

  const enable = async () => {
    setStatus('enabling'); setError('');
    try {
      await subscribePush(jwt);
      setStatus('enabled');
    } catch (e:any) {
      setError(e?.message ?? 'Gagal mengaktifkan push');
      setStatus('error');
    }
  };

  return (
    <button onClick={enable} disabled={status==='enabling' || status==='enabled'}>
      {status==='enabled' ? 'Push aktif ✅' : status==='enabling' ? 'Mengaktifkan…' : 'Aktifkan Notifikasi'}
    </button>
  );
}
