'use client';

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import Header from "@/app/components/Header";
import { usePayment } from "../hooks/usePayment";
import BookingCard from "@/app/components/BookingCard";

interface Booking {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
  statusBooking: string;
  jumlahPeserta: number;
  estimasiHarga: string | number; // total dari backend
  inputCustomTujuan?: string;
  catatanKhusus?: string;
  paket?: { namaPaket: string; lokasi: string; fotoPaket: string };
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
        throw new Error("Token tidak ditemukan. Harap login ulang.");
      }

      const res = await fetch(`http://localhost:3001/booking/my-bookings`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          throw new Error("Sesi berakhir, silakan login kembali.");
        }
        const errorData = await res.json();
        throw new Error(`HTTP error ${res.status}: ${errorData.message || res.statusText}`);
      }

      const json = await res.json();
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
    return bookings.filter((booking) => {
      if (selectedFilter === "paket_wisata" && booking.paket) return true;
      if (selectedFilter === "paket_luar_kota" && booking.paketLuarKota) return true;
      if (selectedFilter === "fasilitas" && booking.fasilitas) return true;
      return false;
    });
  }, [bookings, selectedFilter]);

  const handlePayment = async (bookingId: number) => {
    setProcessingPayment(bookingId);
    clearError();

    try {
      const paymentData = await createPayment(bookingId);
      if (!paymentData) throw new Error("Gagal membuat transaksi pembayaran");

      processPayment(
        paymentData.snapToken,
        () => {
          getMyBookings();
        },
        (error) => {
          console.error("Payment error:", error);
        }
      );
    } catch (err: any) {
      console.error("Payment process error:", err);
      setError(`Gagal memproses pembayaran: ${err.message}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleRefund = async (booking: Booking) => {
    try {
      if (!booking.pembayaran?.pembayaranId) {
        alert("Data pembayaran tidak ditemukan untuk booking ini.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Anda belum login. Silakan login terlebih dahulu.");
        return;
      }

      const res = await fetch(
        `http://localhost:3001/refunds/check-booking/${booking.bookingId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );

      const checkResult = await res.json();
      if (!res.ok) {
        alert(`Pengajuan Ditolak: ${checkResult.message || "Tidak eligible refund."}`);
        return;
      }

      const params = new URLSearchParams({
        bookingId: booking.bookingId.toString(),
        pembayaranId: booking.pembayaran.pembayaranId.toString(),
      });

      router.push(`/refund/request?${params.toString()}`);
    } catch (error: any) {
      console.error("Error in handleRefund:", error);
      alert(error?.message || "Terjadi kesalahan.");
    }
  };

  const handleReschedule = (booking: Booking) => {
    router.push(`/reschedule/request?bookingId=${booking.bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Memuat data booking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={getMyBookings} className="mt-4" variant="ocean">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Riwayat Booking Saya</h1>
            <p className="text-xl text-muted-foreground">Kelola semua booking perjalanan Anda</p>
          </div>

          {paymentError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{paymentError}</p>
                <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-4">
            <Button
              onClick={() => setSelectedFilter("all")}
              variant={selectedFilter === "all" ? "ocean" : "outline"}
              className="text-sm font-medium"
            >
              Semua Booking
            </Button>
            <Button
              onClick={() => setSelectedFilter("paket_wisata")}
              variant={selectedFilter === "paket_wisata" ? "ocean" : "outline"}
              className="text-sm font-medium"
            >
              Paket Wisata
            </Button>
            <Button
              onClick={() => setSelectedFilter("paket_luar_kota")}
              variant={selectedFilter === "paket_luar_kota" ? "ocean" : "outline"}
              className="text-sm font-medium"
            >
              Paket Luar Kota
            </Button>
            <Button
              onClick={() => setSelectedFilter("fasilitas")}
              variant={selectedFilter === "fasilitas" ? "ocean" : "outline"}
              className="text-sm font-medium"
            >
              Fasilitas
            </Button>
          </div>

          {filteredBookings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold mb-2">Belum Ada Booking</h3>
                <p className="text-muted-foreground mb-6">
                  Anda belum memiliki booking apapun. Mari mulai petualangan Anda!
                </p>
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

      <footer className="bg-gray-100 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jelajah Tour & Travel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
