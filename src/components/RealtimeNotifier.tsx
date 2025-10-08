"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

type StatusChanged = { bookingId: number; newStatus: string; updatedAt: string };
type Rescheduled = { bookingId: number; newDate: string; updatedAt: string };
type Refunded = { bookingId: number; refundId: number; status: string; updatedAt: string; amount?: number };

export default function RealtimeNotifier() {
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Buat elemen audio
    audioRef.current = new Audio("/sounds/notif.mp3");
    audioRef.current.volume = 0.7; // bisa disesuaikan

    const playSound = () => {
      if (audioRef.current) {
        // Safari & Chrome butuh user interaction sebelumnya agar bisa play
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          console.warn("🔇 Tidak bisa memutar suara (mungkin butuh interaksi user dulu)");
        });
      }
    };

    const s = getSocket();
    socketRef.current = s;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    s.on("connect", () => {
      console.log("[WS] connected");
      if (token) {
        s.emit("register", { token });
      }
    });

    // Event: Booking status
    s.on("booking.status.changed", (p: StatusChanged) => {
      toast.info(`Status Booking #${p.bookingId}`, {
        description: `Telah berubah menjadi: ${p.newStatus.toUpperCase()}`
      });
      playSound();
    });

    // Event: Reschedule
    s.on("booking.rescheduled", (p: Rescheduled) => {
      toast(`Booking #${p.bookingId} dijadwal ulang`, {
        description: `Tanggal baru: ${new Date(p.newDate).toLocaleString("id-ID")}`,
      });
      playSound();
    });

    // Event: Refund
    s.on("booking.refunded", (p: Refunded) => {
      const amount = p.amount ? `Jumlah: Rp${p.amount.toLocaleString("id-ID")}` : "";
      toast.success(`Refund #${p.refundId} (${p.status.toUpperCase()})`, {
        description: `Untuk Booking #${p.bookingId}. ${amount}`,
      });
      playSound();
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return null;
}
