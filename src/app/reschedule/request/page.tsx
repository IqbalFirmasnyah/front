"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { convertTravelImageUrl } from "@/lib/helper/image_url";

const API_BASE_URL = "http://localhost:3001";

// gambar
// const convertTravelImageUrl = (image: string): string =>
//   `http://localhost:3001/public/travel-images/${image}`;

interface BookingDetail {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata?: string;
  tanggalSelesaiWisata?: string;
  statusBooking: string;
  jumlahPeserta: number;
  paket?: { namaPaket?: string; lokasi?: string; fotoPaket?: string; images?: string[] };
  paketLuarKota?: { namaPaket?: string; tujuanUtama?: string };
  fasilitas?: { namaFasilitas?: string; jenisFasilitas?: string; dropoff?: { namaTujuan?: string } };
}

interface CreateRescheduleDto {
  bookingId: number;
  tanggalBaru: string; // ISO yyyy-MM-dd
  alasan: string;
}

async function validateRescheduleApi(bookingId: number, tanggalBaru: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/reschedule/validate/${bookingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tanggalBaru }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((result as any).message || "Validasi reschedule gagal.");
  return result;
}

/** ------ Page wrapper: wajib Suspense ------ */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RescheduleRequestPageClient />
    </Suspense>
  );
}

/** ------ Client component yang memakai useSearchParams ------ */
function RescheduleRequestPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // form
  const [tanggalBaru, setTanggalBaru] = useState("");
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!bookingIdParam) {
          setError("ID booking tidak ditemukan.");
          toast.error("ID booking tidak ditemukan.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          toast.info("Silakan login terlebih dahulu.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/booking/${bookingIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as any).message || "Gagal mengambil data booking.");

        const data: any = (json as any).data || json;
        if (!data || !data.bookingId) throw new Error("Struktur data booking tidak valid.");

        setDetail({
          bookingId: data.bookingId,
          kodeBooking: data.kodeBooking,
          tanggalMulaiWisata: data.tanggalMulaiWisata,
          tanggalSelesaiWisata: data.tanggalSelesaiWisata,
          statusBooking: data.statusBooking,
          jumlahPeserta: data.jumlahPeserta,
          paket: data.paket,
          paketLuarKota: data.paketLuarKota,
          fasilitas: data.fasilitas,
        });

        toast.success("Detail booking berhasil dimuat.");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat memuat data booking.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingIdParam, router]);

  const tripName =
    detail?.paket?.namaPaket ||
    detail?.paketLuarKota?.namaPaket ||
    detail?.fasilitas?.namaFasilitas ||
    "Detail Perjalanan";

  const locationDetails =
    detail?.paket?.lokasi ||
    detail?.paketLuarKota?.tujuanUtama ||
    detail?.fasilitas?.dropoff?.namaTujuan ||
    undefined;

  const coverImage = useMemo(() => {
    if (detail?.paket?.fotoPaket) return convertTravelImageUrl(detail.paket.fotoPaket);
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=600&fit=crop";
  }, [detail]);

  const tanggalRange =
    detail?.tanggalMulaiWisata && detail?.tanggalSelesaiWisata
      ? `${format(new Date(detail.tanggalMulaiWisata), "dd MMM yyyy")} - ${format(
          new Date(detail.tanggalSelesaiWisata),
          "dd MMM yyyy"
        )}`
      : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Silakan login terlebih dahulu.");
      router.push("/login");
      setSubmitting(false);
      return;
    }
    if (!detail) {
      const msg = "Data booking belum siap. Muat ulang halaman dan coba lagi.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    if (!tanggalBaru || !alasan.trim()) {
      const msg = "Tanggal baru dan alasan harus diisi.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tanggalBaruDate = new Date(tanggalBaru);
    if (tanggalBaruDate < today) {
      const msg = "Tanggal baru tidak boleh di masa lalu.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    try {
      await toast.promise(
        (async () => {
          await validateRescheduleApi(detail.bookingId, tanggalBaru, token);

          const payload: CreateRescheduleDto = {
            bookingId: detail.bookingId,
            tanggalBaru,
            alasan: alasan.trim(),
          };

          const res = await fetch(`${API_BASE_URL}/reschedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error((data as any).message || "Gagal mengajukan reschedule.");
          return data;
        })(),
        {
          loading: "Mengajukan reschedule...",
          success: "Reschedule berhasil diajukan.",
          error: (err) => (err as Error).message || "Gagal mengajukan reschedule.",
        }
      );

      // pindahkan navigasi ke jalur sukses saja
      router.push("/my-booking");
    } catch {
      // toast sudah menampilkan error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-6">
              <div className="w-full h-64 bg-gray-200 rounded-2xl" />
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-40 bg-gray-200 rounded-lg" />
                  <div className="h-56 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-80 bg-gray-200 rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="ocean" className="text-black">
              Kembali
            </Button>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          {/* Hero */}
          <div className="mb-8">
            <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-2xl shadow-card">
              <img
                src={coverImage}
                alt={tripName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop";
                }}
              />
            </div>
          </div>

          {/* Header Title & Badges */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold">Ajukan Reschedule</h1>
              <Badge variant="secondary" className="capitalize">
                {detail?.statusBooking?.replace(/_/g, " ") || "status"}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {tripName && (
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  {tripName}
                </div>
              )}
              {locationDetails && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {locationDetails}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {tanggalRange}
              </div>
              {typeof detail?.jumlahPeserta === "number" && (
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {detail?.jumlahPeserta} orang
                </div>
              )}
            </div>
          </div>

          {/* GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Jadwal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex justify-between text-sm">
                      <span>Jadwal Awal</span>
                      <span className="font-medium">
                        {detail?.tanggalMulaiWisata
                          ? format(new Date(detail.tanggalMulaiWisata), "dd MMM yyyy")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tanggal Selesai</span>
                      <span className="font-medium">
                        {detail?.tanggalSelesaiWisata
                          ? format(new Date(detail.tanggalSelesaiWisata), "dd MMM yyyy")
                          : "-"}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Tanggal Baru (preview)</span>
                      <span className="font-bold">
                        {tanggalBaru ? format(new Date(tanggalBaru), "dd MMM yyyy") : "-"}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground flex">
                      <Info className="h-4 w-4 mr-2 mt-0.5" />
                      Pengajuan reschedule tunduk pada ketentuan H-3 (paling lambat 3 hari sebelum
                      berangkat) dan H+1 (tanggal baru ≥ 1 hari setelah tanggal pengajuan). Sistem
                      akan memvalidasi saat Anda mengirim.
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Kode Booking</div>
                      <div className="font-semibold">{detail?.kodeBooking}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Layanan</div>
                      <div className="font-semibold">{tripName}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kebijakan Reschedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    1) <b>H-3</b>: Pengajuan dilakukan paling lambat 3 hari sebelum tanggal
                    keberangkatan.
                  </p>
                  <p>
                    2) <b>H+1</b>: Tanggal perjalanan baru minimal 1 hari setelah tanggal pengajuan.
                  </p>
                  <p>
                    3) Tergantung ketersediaan armada & supir pada tanggal baru.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right (form) */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Form Pengajuan Reschedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="flex items-center bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        {error}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="tanggalBaru" className="mb-1 block">
                        Tanggal Baru
                      </Label>
                      <Input
                        id="tanggalBaru"
                        type="date"
                        value={tanggalBaru}
                        onChange={(e) => setTanggalBaru(e.target.value)}
                        className="w-full"
                        required
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="alasan" className="mb-1 block">
                        Alasan Pengajuan
                      </Label>
                      <Textarea
                        id="alasan"
                        value={alasan}
                        onChange={(e) => setAlasan(e.target.value)}
                        rows={4}
                        placeholder="Jelaskan alasan Anda mengajukan reschedule..."
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full text-black" variant="ocean" disabled={submitting}>
                      {submitting ? "Mengajukan..." : "Ajukan Reschedule"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jelajah Tour & Travel. All rights reserved.
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}
