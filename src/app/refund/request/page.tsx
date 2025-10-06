"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";
import { AlertCircle, ArrowLeft, CreditCard, Info, MapPin, Calendar, Users, Wallet } from "lucide-react";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { convertTravelImageUrl } from "@/lib/helper/image_url";

// helper gambar
// const convertTravelImageUrl = (image: string): string =>
//   `http://localhost:3001/public/travel-images/${image}`;

type Pembayaran = {
  pembayaranId: number;
  jumlahBayar?: string | number;
  jumlahPembayaran?: string | number;
  statusPembayaran?: string;
};

type BookingDetail = {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata?: string;
  tanggalSelesaiWisata?: string;
  statusBooking: string;
  jumlahPeserta: number;
  estimasiHarga: string | number;
  paket?: { namaPaket?: string; lokasi?: string; fotoPaket?: string; images?: string[] };
  paketLuarKota?: { namaPaket?: string; tujuanUtama?: string };
  fasilitas?: {
    namaFasilitas?: string;
    jenisFasilitas?: string;
    dropoff?: { namaTujuan?: string; alamatTujuan?: string };
  };
  pembayaran?: Pembayaran | null;
};

function parseNumber(val: unknown): number {
  if (val == null) return 0;
  const s = String(val);
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
}
function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(
    Math.max(0, Math.round(n))
  );
}

/** ------ Page wrapper: Suspense wajib ------ */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RefundRequestPageClient />
    </Suspense>
  );
}

/** ------ Client component ------ */
function RefundRequestPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId");
  const pembayaranId = searchParams.get("pembayaranId");

  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [alasanRefund, setAlasanRefund] = useState("");
  const [metodeRefund, setMetodeRefund] = useState<"transfer_bank" | "e-wallet" | "cash">("transfer_bank");
  const [rekeningTujuan, setRekeningTujuan] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.info("Silakan login terlebih dahulu.");
          router.push("/login");
          return;
        }
        if (!bookingId) {
          const msg = "BookingId tidak ditemukan.";
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3001/booking/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((json as any).message || "Gagal memuat detail booking.");

        const data: any = (json as any).data || json;

        const pembayaranNorm: Pembayaran | null = data.pembayaran
          ? {
              ...data.pembayaran,
              jumlahBayar: data.pembayaran.jumlahBayar ?? data.pembayaran.jumlahPembayaran,
            }
          : null;

        setDetail({
          bookingId: data.bookingId,
          kodeBooking: data.kodeBooking,
          tanggalMulaiWisata: data.tanggalMulaiWisata,
          tanggalSelesaiWisata: data.tanggalSelesaiWisata,
          statusBooking: data.statusBooking,
          jumlahPeserta: data.jumlahPeserta,
          estimasiHarga: data.estimasiHarga,
          paket: data.paket,
          paketLuarKota: data.paketLuarKota,
          fasilitas: data.fasilitas,
          pembayaran: pembayaranNorm,
        });

        toast.success("Detail booking berhasil dimuat.");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat memuat data.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, router]);

  const { baseTotal, adminCut, finalRefund } = useMemo(() => {
    const base = parseNumber(detail?.pembayaran?.jumlahBayar) || parseNumber(detail?.estimasiHarga);
    const cut = base * 0.1;
    const final = Math.max(0, base - cut);
    return { baseTotal: base, adminCut: cut, finalRefund: final };
  }, [detail]);

  useEffect(() => {
    if (detail && baseTotal <= 0) {
      toast.warning("Nominal dasar tidak terdeteksi. Menggunakan estimasi jika tersedia.");
    }
  }, [detail, baseTotal]);

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

  const coverImage =
    detail?.paket?.fotoPaket
      ? convertTravelImageUrl(detail.paket.fotoPaket)
      : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop";

  const tanggalRange =
    detail?.tanggalMulaiWisata && detail?.tanggalSelesaiWisata
      ? `${format(new Date(detail.tanggalMulaiWisata), "dd MMM yyyy")} - ${format(
          new Date(detail.tanggalSelesaiWisata),
          "dd MMM yyyy"
        )}`
      : "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    if (!bookingId) {
      const msg = "BookingId tidak ditemukan.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!alasanRefund.trim()) {
      const msg = "Alasan refund wajib diisi.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (metodeRefund !== "cash" && !rekeningTujuan.trim()) {
      const msg = "Rekening/E-Wallet tujuan wajib diisi.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);

    try {
      await toast.promise(
        (async () => {
          const res = await fetch(`http://localhost:3001/refunds/booking/${bookingId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              pembayaranId: pembayaranId ? parseInt(pembayaranId) : undefined,
              alasanRefund: alasanRefund.trim(),
              jumlahRefund: finalRefund,
              metodeRefund,
              rekeningTujuan: metodeRefund === "cash" ? undefined : rekeningTujuan.trim(),
            }),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error((data as any).message || "Gagal mengajukan refund.");
          return data;
        })(),
        {
          loading: "Mengajukan refund...",
          success: `Pengajuan refund berhasil. Jumlah: ${formatIDR(finalRefund)}.`,
          error: (err) => (err as Error).message || "Gagal mengajukan refund.",
        }
      );

      router.push("/my-booking");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengajukan refund.";
      setError(msg);
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
            <Button onClick={() => window.location.reload()} variant="ocean" className="text-black">
              Muat Ulang
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
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=600&fit=crop";
                }}
              />
            </div>
          </div>

          {/* Header Title & Badges */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold">{tripName}</h1>
              <Badge variant="secondary" className="capitalize">
                {detail?.statusBooking?.replace(/_/g, " ") || "status"}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
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
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {detail?.jumlahPeserta} orang
              </div>
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Total Dasar: {formatIDR(baseTotal)}
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Refund</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4 bg-gray-50">
                    <div className="flex justify-between text-sm">
                      <span>Total Dasar</span>
                      <span className="font-medium">{formatIDR(baseTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Potongan Admin (10%)</span>
                      <span className="font-medium">- {formatIDR(adminCut)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Jumlah Refund</span>
                      <span className="font-bold text-primary">{formatIDR(finalRefund)}</span>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground flex">
                      <Info className="h-4 w-4 mr-2 mt-0.5" />
                      Nilai refund sudah dikurangi biaya administrasi 10% dari total pembayaran/estimasi.
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Kode Booking</div>
                      <div className="font-semibold">{detail?.kodeBooking}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">Nominal Dasar</div>
                      <div className="font-semibold">
                        {detail?.pembayaran?.jumlahBayar ? "Pembayaran" : "Estimasi Harga"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kebijakan Refund</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Pengajuan refund diproses sesuai ketentuan. Jumlah yang diterima adalah <b>90%</b> (setelah
                    potongan admin <b>10%</b>).
                  </p>
                  <p>
                    Pantau status refund di halaman <b>Riwayat Booking</b>. Pastikan data rekening benar untuk
                    metode non-tunai.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right (Form) */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Form Pengajuan Refund</CardTitle>
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
                      <Label className="mb-1 block">Alasan Refund</Label>
                      <textarea
                        value={alasanRefund}
                        onChange={(e) => setAlasanRefund(e.target.value)}
                        className="w-full border rounded p-2 min-h-[90px]"
                        placeholder="Tulis alasan pengajuan refund"
                        required
                      />
                    </div>

                    <div>
                      <Label className="mb-1 block">Metode Refund</Label>
                      <select
                        value={metodeRefund}
                        onChange={(e) =>
                          setMetodeRefund(e.target.value as "transfer_bank" | "e-wallet" | "cash")
                        }
                        className="w-full border rounded p-2"
                      >
                        <option value="transfer_bank">Transfer Bank</option>
                        <option value="e-wallet">E-Wallet</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>

                    {metodeRefund !== "cash" && (
                      <div>
                        <Label className="mb-1 block">Rekening / E-Wallet Tujuan</Label>
                        <input
                          type="text"
                          value={rekeningTujuan}
                          onChange={(e) => setRekeningTujuan(e.target.value)}
                          className="w-full border rounded p-2"
                          placeholder="Nama Bank / E-Wallet + No. Rekening"
                          required
                        />
                      </div>
                    )}

                    <div className="rounded-md border p-3 bg-gray-50">
                      <div className="text-xs text-muted-foreground mb-1">Jumlah Refund (otomatis)</div>
                      <div className="text-xl font-bold text-primary">{formatIDR(finalRefund)}</div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Sudah termasuk potongan admin 10% dari total.
                      </div>
                    </div>

                    <Button type="submit" className="w-full text-black" variant="ocean" disabled={submitting}>
                      {submitting ? (
                        "Mengajukan..."
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Ajukan Refund
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
