// app/my-booking/page.tsx
'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Header from "@/app/components/Header";
import { usePayment } from "../hooks/usePayment";
import BookingCard from "@/app/components/BookingCard";
import { Toaster, toast } from "sonner";

interface Booking {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
  statusBooking: string;
  jumlahPeserta: number;
  estimasiHarga: string | number;
  paket?: { namaPaket: string; lokasi: string };
  paketLuarKota?: { namaPaket: string; tujuanUtama: string };
  fasilitas?: {
    namaFasilitas: string;
    jenisFasilitas: string;
    dropoff?: { namaTujuan: string; alamatTujuan: string };
    customRute?: { tujuanList: string[]; catatanKhusus?: string };
    paketLuarKota?: { namaPaket: string; tujuanUtama: string };
  };
  supir?: { nama: string; nomorHp: string };
  armada?: { jenisMobil: string; platNomor: string };
  pembayaran?: {
    pembayaranId: number;
    jumlahPembayaran: string;
    statusPembayaran: string;
    tanggalPembayaran: string;
  };
  // bidang refund dari backend
  refundStatus?: string | null;
  statusRefund?: string | null;
  refundFinalAmount?: number | string | null;
  refund?: {
    refundId: number;
    statusRefund: string;
    jumlahRefundFinal: number | string | null;
  } | null;
}

type FilterType = "all" | "paket_wisata" | "paket_luar_kota" | "fasilitas";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  const router = useRouter();
  const { createPayment, processPayment, loading: paymentLoading, error: paymentError, clearError } =
    usePayment();

  const getMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/my-bookings`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || res.statusText);
      setBookings(json.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const filteredBookings = useMemo(() => {
    if (selectedFilter === "all") return bookings;
    return bookings.filter((b) =>
      (selectedFilter === "paket_wisata" && b.paket) ||
      (selectedFilter === "paket_luar_kota" && b.paketLuarKota) ||
      (selectedFilter === "fasilitas" && b.fasilitas)
    );
  }, [bookings, selectedFilter]);

  const handlePayment = async (bookingId: number) => {
    setProcessingPayment(bookingId);
    clearError();
    try {
      const paymentData = await createPayment(bookingId);
      if (!paymentData) throw new Error("Gagal membuat transaksi pembayaran");
      processPayment(
        paymentData.snapToken,
        () => getMyBookings(),
        () => {}
      );
    } catch (err: any) {
      setError(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRefund = async (booking: Booking) => {
    try {
      if (!booking.pembayaran?.pembayaranId) return;
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/refunds/check-booking/${booking.bookingId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      const checkResult = await res.json();
      if (!res.ok) return;
      const params = new URLSearchParams({
        bookingId: String(booking.bookingId),
        pembayaranId: String(booking.pembayaran.pembayaranId),
      });
      router.push(`/refund/request?${params.toString()}`);
    } catch {}
  };

  const handleReschedule = (booking: Booking) => {
    router.push(`/reschedule/request?bookingId=${booking.bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <Button onClick={getMyBookings} className="mt-2" variant="ocean">
            Coba Lagi
          </Button>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap gap-4">
            <Button
              onClick={() => setSelectedFilter("all")}
              variant={selectedFilter === "all" ? "ocean" : "outline"}
              className="text-sm"
            >
              Semua
            </Button>
            <Button
              onClick={() => setSelectedFilter("paket_wisata")}
              variant={selectedFilter === "paket_wisata" ? "ocean" : "outline"}
              className="text-sm"
            >
              Paket Wisata
            </Button>
            <Button
              onClick={() => setSelectedFilter("paket_luar_kota")}
              variant={selectedFilter === "paket_luar_kota" ? "ocean" : "outline"}
              className="text-sm"
            >
              Paket Luar Kota
            </Button>
            <Button
              onClick={() => setSelectedFilter("fasilitas")}
              variant={selectedFilter === "fasilitas" ? "ocean" : "outline"}
              className="text-sm"
            >
              Fasilitas
            </Button>
          </div>

          {filteredBookings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Button onClick={() => router.push("/paket-wisata")} variant="ocean" size="lg">
                  Lihat Paket Wisata
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.bookingId}
                  booking={booking}
                  onPayment={handlePayment}
                  onRefund={handleRefund}
                  onReschedule={handleReschedule}
                  processingPaymentId={processingPayment}
                  paymentLoading={paymentLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
