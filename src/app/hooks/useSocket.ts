// src/hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from '@socket.io/component-emitter';


const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_URL}`; 
type ClientSocket = Socket<DefaultEventsMap, DefaultEventsMap> | null; 

interface NotificationData {
    message: string;
    timestamp: number; // Atau string, tergantung format yang dikirim NestJS
    // Tambahkan properti lain yang ada di objek notifikasi
  }
export const useSocket = (token: string | null | undefined) => { // Menerima JWT sebagai parameter
    const [socket, setSocket] = useState<ClientSocket>(null);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Jalankan hanya jika ada token dan di sisi client
    if (typeof window !== 'undefined' && token) { 
      const newSocket = io(SOCKET_URL, {
        transportOptions: {
            polling: {
                extraHeaders: {
                    // Mengirim JWT via header saat koneksi
                    Authorization: `Bearer ${token}`, 
                },
            },
        },
      });

      setSocket(newSocket as ClientSocket);

      // Listen untuk event notifikasi
      newSocket.on('notification_new', (data) => {
        console.log('Notifikasi baru diterima:', data);
        setNotifications((prev) => [...prev, data]);
      });
      
      newSocket.on('connect', () => {
          console.log('Connected to NestJS WebSocket');

      });

      newSocket.on('error', (message) => {
          console.error('WebSocket Error from Server:', message);
          // Handle error autentikasi, misalnya logout pengguna
      });

      // Cleanup
      return () => {
        newSocket.disconnect(); 
      };
    }
  }, [token]); // Reconnect jika token berubah (misalnya, setelah login/logout)

  return { socket, notifications };
};