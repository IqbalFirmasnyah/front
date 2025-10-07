"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import ArmadaSelector, { Armada } from "@/app/components/ArmadaSelector";
import SupirSelectorCard, { Supir } from "@/app/components/SupirSelectorCard";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";

/** ================= Utilities ================= */
const formatDateForInput = (dateString: string | Date | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const parsePriceToNumber = (price: number | string): number => {
  if (typeof price === "number") return isNaN(price) ? 0 : price;
  const digits = price.replace(/[^\d]/g, "");
  const n = Number(digits);
  return isNaN(n) ? 0 : n;
};

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === "string" ? parsePriceToNumber(price) : price;
  if (isNaN(numPrice) || numPrice < 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numPrice);
};

/** ================= Types & helpers ================= */
enum PriceMode {
  PER_PESERTA = "PER_PESERTA",
  FLAT = "FLAT",
}

type ArmadaOption = { id_armada?: number; [k: string]: unknown };
type SupirOption = { id_supir?: number; [k: string]: unknown };

type ItemDetail = {
  namaPaket?: string;
  namaFasilitas?: string;
  namaTujuan?: string;
  fasilitas?: { namaFasilitas?: string; jenisFasilitas?: string };
  jenisFasilitas?: string;
  hargaEstimasi?: number | string;
  harga?: number | string;
  tanggalMulaiWisata?: string;
  tanggalSelesaiWisata?: string;
  startDate?: string;
  endDate?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  [k: string]: unknown;
};

const getPriceMode = (
  params: {
    dropoffId: string | null;
    customRuteId: string | null;
    paketId: string | null;
    paketLuarKotaId: string | null;
    fasilitasId: string | null;
  },
  itemDetail: ItemDetail | null
): PriceMode => {
  if (params.dropoffId) return PriceMode.PER_PESERTA;            // dropoff = flat
  if (params.customRuteId) return PriceMode.PER_PESERTA;  // custom = per peserta
  if (params.paketId) return PriceMode.PER_PESERTA;
  if (params.paketLuarKotaId) return PriceMode.PER_PESERTA;
  return PriceMode.PER_PESERTA;
};

/** ================= Page wrapper: Suspense boundary ================= */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookingPageClient />
    </Suspense>
  );
}

/** ================= Client content (menggunakan useSearchParams) ================= */
function BookingPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Query params
  const dropoffId = searchParams.get("dropoffId");
  const customRuteId = searchParams.get("customRuteId");
  const paketId = searchParams.get("paketId");
  const fasilitasId = searchParams.get("fasilitasId");
  const paketLuarKotaId = searchParams.get("paketLuarKotaId");

  const tanggalMulaiParam =
    searchParams.get("tanggalMulaiWisata") ||
    searchParams.get("tanggalMulai") ||
    searchParams.get("startDate") ||
    "";
  const tanggalSelesaiParam =
    searchParams.get("tanggalSelesaiWisata") ||
    searchParams.get("tanggalSelesai") ||
    searchParams.get("endDate") ||
    "";

  // State
  const [itemDetail, setItemDetail] = useState<ItemDetail | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState(formatDateForInput(tanggalMulaiParam));
  const [tanggalSelesai, setTanggalSelesai] = useState(formatDateForInput(tanggalSelesaiParam));
  const [jumlahPeserta, setJumlahPeserta] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableArmada, setAvailableArmada] = useState<Armada[]>([]);
  const [availableSupir, setAvailableSupir] = useState<Supir[]>([]);
  const [fetchingAvailable, setFetchingAvailable] = useState(false);

  const [selectedArmadaId, setSelectedArmadaId] = useState<number | null>(null);
  const [selectedSupirId, setSelectedSupirId] = useState<number | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);

  // Endpoint
  const endpoint = useMemo(() => {
    const baseUrl = "${process.env.NEXT_PUBLIC_API_URL}";
    if (customRuteId) return `${baseUrl}/booking/custom-rute-options?customRuteId=${customRuteId}`;
    if (dropoffId)
      return `${baseUrl}/booking/options?dropoffId=${dropoffId}${
        fasilitasId ? `&fasilitasId=${fasilitasId}` : ""
      }`;
    if (paketId) return `${baseUrl}/paket-wisata/${paketId}`;
    if (fasilitasId) return `${baseUrl}/fasilitas/${fasilitasId}`;
    if (paketLuarKotaId) return `${baseUrl}/paket-wisata-luar-kota/${paketLuarKotaId}`;
    return null;
  }, [customRuteId, dropoffId, paketId, fasilitasId, paketLuarKotaId]);

  // Fetch detail item (+ availability bila dropoff/custom)
  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      setError("Parameter booking tidak lengkap.");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.info("Silakan login terlebih dahulu.");
          router.push("/login");
          return;
        }

        const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error((errorData as { message?: string })?.message || `Gagal mengambil detail item (${res.status}).`);
        }
        const data = await res.json();

        let detail: ItemDetail;
        let tglMulai: string | Date | undefined;
        let tglSelesai: string | Date | undefined;

        const isCombinedFetch = !!dropoffId || !!customRuteId;

        if (isCombinedFetch) {
          // response gabungan (options)
          const d = (data as any).data ?? {};
          detail = d.dropoffDetail || d.customRuteDetail || {};
          setAvailableArmada(Array.isArray(d.armadas) ? d.armadas : []);
          setAvailableSupir(Array.isArray(d.supirs) ? d.supirs : []);
          tglMulai = (detail as any).tanggalMulai;
          tglSelesai = (detail as any).tanggalSelesai;
        } else {
          // response langsung entity
          const d = (data as any).data ?? data;
          detail = d;
          tglMulai = tanggalMulaiParam || detail.tanggalMulaiWisata || detail.startDate;
          tglSelesai = tanggalSelesaiParam || detail.tanggalSelesaiWisata || detail.endDate;
        }

        setItemDetail(detail);
        if (tglMulai) setTanggalMulai(formatDateForInput(tglMulai));
        if (tglSelesai) setTanggalSelesai(formatDateForInput(tglSelesai));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Gagal memuat detail.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, dropoffId, customRuteId, tanggalMulaiParam, tanggalSelesaiParam, router]);

  // Fetch ketersediaan (paket/fasilitas biasa)
  useEffect(() => {
    const isCombinedFetch = !!dropoffId || !!customRuteId;
    if (isCombinedFetch || !tanggalMulai || !tanggalSelesai) return;

    const fetchAvailable = async () => {
      try {
        setFetchingAvailable(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.info("Silakan login terlebih dahulu.");
          router.push("/login");
          return;
        }

        const startDate = new Date(tanggalMulai);
        const endDate = new Date(tanggalSelesai);
        const adjustedEnd =
          startDate.getTime() >= endDate.getTime()
            ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
            : endDate;

        const startISO = startDate.toISOString();
        const endISO = adjustedEnd.toISOString();

        const [armadaRes, supirRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/armada/available-armada?start=${encodeURIComponent(
              startISO
            )}&end=${encodeURIComponent(endISO)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/supir/available-supir?start=${encodeURIComponent(
              startISO
            )}&end=${encodeURIComponent(endISO)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const armadaData = armadaRes.ok ? await armadaRes.json().catch(() => ({ data: [] })) : { data: [] };
        const supirData = supirRes.ok ? await supirRes.json().catch(() => ({ data: [] })) : { data: [] };

        setAvailableArmada(Array.isArray((armadaData as any).data) ? (armadaData as any).data : []);
        setAvailableSupir(Array.isArray((supirData as any).data) ? (supirData as any).data : []);
      } catch (_err: unknown) {
        setAvailableArmada([]);
        setAvailableSupir([]);
        toast.error("Gagal memuat ketersediaan armada/supir.");
      } finally {
        setFetchingAvailable(false);
      }
    };

    fetchAvailable();
  }, [tanggalMulai, tanggalSelesai, dropoffId, customRuteId, router]);

  // Harga & total
  const priceMode = useMemo(
    () =>
      getPriceMode(
        { dropoffId, customRuteId, paketId, paketLuarKotaId, fasilitasId },
        itemDetail
      ),
    [dropoffId, customRuteId, paketId, paketLuarKotaId, fasilitasId, itemDetail]
  );

  const itemTitle =
    itemDetail?.namaPaket ||
    itemDetail?.namaFasilitas ||
    itemDetail?.namaTujuan ||
    itemDetail?.fasilitas?.namaFasilitas ||
    "Detail Item";

  const itemPrice = (itemDetail?.hargaEstimasi ?? itemDetail?.harga ?? 0) as number | string;
  const basePrice = useMemo(() => parsePriceToNumber(itemPrice), [itemPrice]);

  const totalPrice = useMemo(() => {
    const qty = Number(jumlahPeserta) || 0;
    return priceMode === PriceMode.PER_PESERTA ? basePrice * qty : basePrice;
  }, [basePrice, jumlahPeserta, priceMode]);

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }
    if (!selectedArmadaId || selectedSupirId === undefined) {
      toast.warning("Pilih kendaraan dan supir terlebih dahulu.");
      return;
    }
    if (!tanggalMulai || !tanggalSelesai) {
      toast.warning("Tanggal layanan belum terisi.");
      return;
    }

    setSubmitting(true);

    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    const body = {
      customRuteId: customRuteId ? Number(customRuteId) : undefined,
      dropoffId: dropoffId ? Number(dropoffId) : undefined,
      paketId: paketId ? Number(paketId) : undefined,
      fasilitasId: fasilitasId ? Number(fasilitasId) : undefined,
      paketLuarKotaId: paketLuarKotaId ? Number(paketLuarKotaId) : undefined,

      tanggalMulaiWisata: startDate.toISOString(),
      tanggalSelesaiWisata: endDate.toISOString(),

      jumlahPeserta,
      catatanKhusus: catatan || undefined,
      armadaId: selectedArmadaId,
      supirId: selectedSupirId,
    };

    try {
      await toast.promise(
        (async () => {
          const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/booking", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error((error as { message?: string })?.message || "Gagal membuat booking.");
          }
          return res.json();
        })(),
        {
          loading: "Memproses booking...",
          success: "Booking berhasil dibuat!",
          error: (err) => (err as Error).message || "Gagal membuat booking.",
        }
      );

      router.push("/my-booking");
    } catch {
      // pesan error sudah ditampilkan oleh toast.promise
    } finally {
      setSubmitting(false);
    }
  };

  // Render states
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Memuat Detail Booking...</div>
        <Toaster richColors position="top-right" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen text-center p-20">
        <h2 className="text-2xl text-red-600 font-bold">Terjadi Kesalahan!</h2>
        <p>{error}</p>
        <Toaster richColors position="top-right" />
      </div>
    );

  if (!itemDetail)
    return (
      <div className="min-h-screen text-center p-20">
        <h2 className="text-2xl font-bold">Detail Item Tidak Ditemukan</h2>
        <Toaster richColors position="top-right" />
      </div>
    );

  // UI
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>

          <h1 className="text-3xl font-bold mb-6">{itemTitle}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pilih Kendaraan & Supir</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ArmadaSelector
                    selectedArmadaId={selectedArmadaId}
                    onSelect={setSelectedArmadaId}
                    armadaOptions={availableArmada}
                    loading={!!(dropoffId || customRuteId) ? loading : fetchingAvailable}
                  />
                  <SupirSelectorCard
                    selectedSupirId={selectedSupirId}
                    onSelect={setSelectedSupirId}
                    supirOptions={availableSupir}
                    loading={!!(dropoffId || customRuteId) ? loading : fetchingAvailable}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Rincian Booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Tanggal Mulai Layanan</Label>
                    <Input type="date" value={tanggalMulai} readOnly />
                  </div>
                  <div>
                    <Label>Tanggal Selesai Layanan</Label>
                    <Input type="date" value={tanggalSelesai} readOnly />
                  </div>

                  <div className="pt-2 border-t border-dashed space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Harga dasar</span>
                      <span className="font-medium">{formatPrice(basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Jumlah peserta</span>
                      <span className="font-medium">{jumlahPeserta} org</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2 border-t">
                      <span className="font-semibold">
                        Total {priceMode === PriceMode.FLAT ? "Estimasi (Flat)" : "Estimasi (Per Peserta)"}
                      </span>
                      <span className="font-extrabold text-primary">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Jumlah Peserta</Label>
                    <Input
                      type="number"
                      value={jumlahPeserta}
                      min={1}
                      onChange={(e) => setJumlahPeserta(Math.max(1, Number(e.target.value)))}
                      readOnly={priceMode === PriceMode.FLAT}
                    />
                  </div>

                  <div>
                    <Label>Catatan Khusus</Label>
                    <Textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Opsional"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedArmadaId || selectedSupirId === undefined}
                  >
                    {submitting ? "Memproses..." : "Booking Sekarang"}
                  </Button>
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
