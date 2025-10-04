'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { showToast } from '@/lib/toast'; 

type BookingStatusChangedPayload = {
  bookingId: number;
  newStatus: string;
  updatedAt: string;
};

type BookingRescheduledPayload = {
  bookingId: number;
  newDate?: string;
  status?: string;
  updatedAt: string;
};

type BookingRefundedPayload = {
  bookingId: number;
  refundId: number;
  status: string;
  updatedAt: string;
  amount?: number;
};

type SwPushMessage = {
  type?: string;
  payload?: { title: string; body?: string; url?: string; [k: string]: any };
};

export function useRealtimeNotifications(jwt?: string | null) {
  // 1) Pesan dari Service Worker (push → toast saat tab aktif)
  useEffect(() => {
    const onSwMessage = (event: MessageEvent<SwPushMessage>) => {
      const { type, payload } = event.data || {};
      if (type === 'PUSH_EVENT' && payload) {
        console.log('[SW->Page] PUSH_EVENT:', payload);
        showToast({ title: payload.title, body: payload.body, url: payload.url });
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      console.log('[SW LISTENER] attach');
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    } else {
      console.warn('[SW LISTENER] serviceWorker not supported/available');
    }

    return () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        console.log('[SW LISTENER] detach');
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, []);

  // 2) WebSocket (Gateway) saat tab aktif
  useEffect(() => {
    if (!jwt) {
      console.warn('[WS] no jwt; skip socket');
      return undefined;
    }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001'; // ⬅️ SESUAIKAN dgn backend kamu (logmu pakai 3001)
    console.log('[WS] connecting to:', WS_URL);

    const socket: Socket = io(WS_URL, {
      withCredentials: true,
      transports: ['websocket','polling'],
      // path: '/socket.io', // pakai default; uncomment jika server custom path
    });

    // ---- DEBUG EVENTS ----
    socket.on('connect', () => {
      console.log('[WS] connected, id=', socket.id);
      socket.emit('register', { token: `Bearer ${jwt}` });
    });

    socket.on('connect_error', (err) => {
      console.error('[WS] connect_error:', err?.message, err);
    });

    socket.on('error', (err) => {
      console.error('[WS] error:', err);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[WS] disconnect:', reason);
    });

    socket.on('register.error', (msg) => {
      console.error('[WS] register.error:', msg);
    });

    socket.on('registered', (msg) => {
      console.log('[WS] registered:', msg);
    });

    // ---- APP EVENTS ----
    socket.on('booking.status.changed', (p: BookingStatusChangedPayload) => {
      console.log('[WS EVENT] booking.status.changed', p);
      const title = `Booking #${p.bookingId} · ${p.newStatus?.toUpperCase?.()}`;
      const body = new Date(p.updatedAt).toLocaleString('id-ID');
      showToast({ title, body });
    });

    socket.on('booking.rescheduled', (p: BookingRescheduledPayload) => {
      console.log('[WS EVENT] booking.rescheduled', p);
      const status = p.status ? ` · ${p.status.toUpperCase()}` : '';
      const title = `Reschedule Booking #${p.bookingId}${status}`;
      const body = p.newDate
        ? `Jadwal baru: ${new Date(p.newDate).toLocaleString('id-ID')}`
        : new Date(p.updatedAt).toLocaleString('id-ID');
      showToast({ title, body });
    });

    socket.on('booking.refunded', (p: BookingRefundedPayload) => {
      console.log('[WS EVENT] booking.refunded', p);
      const amount = p.amount ? ` · Rp${p.amount.toLocaleString('id-ID')}` : '';
      const title = `Refund Booking #${p.bookingId} · ${p.status.toUpperCase()}`;
      const body = new Date(p.updatedAt).toLocaleString('id-ID') + amount;
      showToast({ title, body });
    });

    // cleanup
    return () => {
      console.log('[WS] cleanup: closing socket');
      socket.removeAllListeners();
      socket.close();
    };
  }, [jwt]);
}
