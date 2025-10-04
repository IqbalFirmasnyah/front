"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";


type StatusChanged = { bookingId: number; newStatus: string; updatedAt: string };
type Rescheduled = { bookingId: number; newDate: string; updatedAt: string };
type Refunded   = { bookingId: number; refundId: number; status: string; updatedAt: string; amount?: number };

export default function RealtimeNotifier() {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    s.on('connect', () => {
      console.log('[WS] connected');
      if (token) {
        s.emit('register', { token }); // kirim token raw TANPA "Bearer "
      } else {
        console.warn('[WS] no token in LS; will register after login');
      }
    });

    s.on('registered', (d) => console.log('[WS] registered:', d));
    s.on('register.error', (e) => console.warn('REGISTER ERROR:', e));

    s.on('booking.status.changed', (p: StatusChanged) => {
      alert(`Status Booking #${p.bookingId}: ${p.newStatus.toUpperCase()}`);
    });
    s.on('booking.rescheduled', (p: Rescheduled) => {
      alert(`Booking #${p.bookingId} dijadwal ulang ke ${new Date(p.newDate).toLocaleString('id-ID')}`);
    });
    s.on('booking.refunded', (p: Refunded) => {
      alert(`Refund #${p.refundId} (${p.status.toUpperCase()}) untuk Booking #${p.bookingId}`);
    });

    s.on('disconnect', (r) => console.warn('[WS] disconnected:', r));
    s.on('connect_error', (e) => console.error('[WS] connect_error:', e?.message || e));

    // re-register setelah login
    const onTokenUpdate = () => {
      const t = localStorage.getItem('token');
      if (t && s.connected) s.emit('register', { token: t });
    };
    window.addEventListener('token-updated', onTokenUpdate);

    return () => {
      window.removeEventListener('token-updated', onTokenUpdate);
      s.off('registered');
      s.off('register.error');
      s.off('connect');
      s.off('disconnect');
      s.off('connect_error');
      s.off('booking.status.changed');
      s.off('booking.rescheduled');
      s.off('booking.refunded');
    };
  }, []);

  return null;
}
