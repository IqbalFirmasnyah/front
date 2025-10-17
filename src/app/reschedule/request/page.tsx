"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Calendar as CalendarCmp } from "@/app/components/ui/calendar";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  Info,
  MapPin,
  Users,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { format, startOfDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { convertTravelImageUrl } from "@/lib/helper/image_url";

/* ===================== Types ===================== */
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

/* ===================== UTC Helpers ===================== */
function toUTCDateOnly(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function diffDaysUTC(later: Date, earlier: Date) {
  const msInDay = 1000 * 60 * 60 * 24;
  const a = toUTCDateOnly(later).getTime();
  const b = toUTCDateOnly(earlier).getTime();
  return Math.floor((a - b) / msInDay);
}

/* ===================== API ===================== */
async function validateRescheduleApi(bookingId: number, tanggalBaru: string, token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reschedule/validate/${bookingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tanggalBaru }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((result as any).message || "Validasi reschedule gagal.");
  return result;
}

/* ===================== Page wrapper ===================== */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RescheduleRequestPageClient />
    </Suspense>
  );
}

/* ===================== Client Component ===================== */
function RescheduleRequestPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // form
  const [tanggalBaru, setTanggalBaru] = useState<Date | undefined>();
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ======== Fetch Booking Detail ========
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

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/${bookingIdParam}`, {
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

  // ======== Derived UI data ========
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

  // ======== Policy Windows (UTC, samakan backend) ========
  const todayUTC = toUTCDateOnly(new Date());

  // minimal tanggal baru = H+2
  const minNewDateUTC = useMemo(() => {
    const d = new Date(todayUTC);
    d.setUTCDate(d.getUTCDate() + 2);
    return d;
  }, [todayUTC]);

  const eligibleByHMinus4 = useMemo(() => {
    if (!detail?.tanggalMulaiWisata) return false;
    const tMulai = new Date(detail.tanggalMulaiWisata);
    const days = diffDaysUTC(tMulai, new Date());
    return days >= 4;
  }, [detail?.tanggalMulaiWisata]);

  // ======== Submit ========
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

    // Guard H-4
    if (!eligibleByHMinus4) {
      const msg = "Pengajuan reschedule harus dilakukan minimal H-4 sebelum tanggal wisata lama.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    // Guard H+1 & H+2
    const tBaruUTC = toUTCDateOnly(tanggalBaru);
    const hPlusOne = new Date(todayUTC);
    hPlusOne.setUTCDate(hPlusOne.getUTCDate() + 1);
    const hPlusTwo = new Date(todayUTC);
    hPlusTwo.setUTCDate(hPlusTwo.getUTCDate() + 2);

    if (tBaruUTC.getTime() === toUTCDateOnly(hPlusOne).getTime()) {
      const msg = "Tanggal baru tidak boleh H+1 dari hari ini. Pilih minimal H+2.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }
    if (tBaruUTC.getTime() < toUTCDateOnly(hPlusTwo).getTime()) {
      const msg = "Tanggal baru minimal H+2 dari hari ini.";
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
      return;
    }

    try {
      await toast.promise(
        (async () => {
          await validateRescheduleApi(
            detail.bookingId,
            format(tanggalBaru, "yyyy-MM-dd"),
            token
          );

          const payload: CreateRescheduleDto = {
            bookingId: detail.bookingId,
            tanggalBaru: format(tanggalBaru, "yyyy-MM-dd"),
            alasan: alasan.trim(),
          };
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reschedule`, {
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

      router.push("/my-booking");
    } catch {
      // already toasted
    } finally {
      setSubmitting(false);
    }
  };

  // ======== Render ========
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

  const minNewDateISO = format(minNewDateUTC, "yyyy-MM-dd");
  const chosenDateText = tanggalBaru ? format(tanggalBaru, "dd MMM yyyy") : "-";

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
                      <span className="font-bold">{chosenDateText}</span>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground flex">
                      <Info className="h-4 w-4 mr-2 mt-0.5" />
                      Kebijakan: <b>H-4</b> (ajukan ≤ H-4) & <b>H+2</b> (tanggal baru ≥ H+2, H+1 tidak boleh).
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
                  <p>1) H-4: Ajukan paling lambat 4 hari sebelum tanggal lama.</p>
                  <p>2) H+2: Tanggal baru minimal 2 hari setelah pengajuan (H+1 tidak diperbolehkan).</p>
                  <p>3) Tergantung ketersediaan armada & supir pada tanggal baru.</p>
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
                      <div className="flex items-start bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                        {error}
                      </div>
                    )}

                    {!eligibleByHMinus4 && (
                      <div className="flex items-start bg-amber-50 border border-amber-200 rounded p-3 text-amber-700 text-sm">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                        Pengajuan sudah melewati H-4 dari tanggal keberangkatan lama.
                      </div>
                    )}

                    {/* Date Picker (shadcn) */}
                    <div>
                      <Label className="mb-1 block">Tanggal Baru</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !tanggalBaru && "text-muted-foreground"
                            )}
                            disabled={!eligibleByHMinus4}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tanggalBaru ? format(tanggalBaru, "dd MMM yyyy") : "Pilih tanggal"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarCmp
                            mode="single"
                            selected={tanggalBaru}
                            onSelect={(d) => {
                              setError(null);
                              if (!d) return setTanggalBaru(undefined);
                              // block H+1, min H+2
                              const today = startOfDay(new Date());
                              const hPlusOne = new Date(today);
                              hPlusOne.setDate(hPlusOne.getDate() + 1);
                              const hPlusTwo = new Date(today);
                              hPlusTwo.setDate(hPlusTwo.getDate() + 2);

                              const chosenStart = startOfDay(d);
                              if (chosenStart.getTime() === startOfDay(hPlusOne).getTime()) {
                                toast.error("Tanggal baru tidak boleh H+1. Pilih minimal H+2.");
                                return;
                              }
                              if (isBefore(chosenStart, hPlusTwo)) {
                                toast.error("Tanggal baru minimal H+2 dari hari ini.");
                                return;
                              }
                              setTanggalBaru(d);
                            }}
                            disabled={(date) => {
                              // disable < today OR < H+2
                              const today = startOfDay(new Date());
                              const hPlusTwo = new Date(today);
                              hPlusTwo.setDate(hPlusTwo.getDate() + 2);
                              return isBefore(date, hPlusTwo);
                            }}
                            initialFocus
                            className="p-3 rounded-md border bg-background"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Minimal tanggal baru: <b>{format(minNewDateUTC, "dd MMM yyyy")}</b> (H+2).
                      </p>
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
                        disabled={!eligibleByHMinus4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-black"
                      variant="ocean"
                      disabled={!eligibleByHMinus4 || submitting || !tanggalBaru}
                    >
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
