'use client';

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
// Asumsikan komponen-komponen ini ada di jalur proyek Anda
import ArmadaSelector from "@/app/components/ArmadaSelector";
import SupirSelectorCard from "@/app/components/SupirSelectorCard"; 
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// --- UTILITY FUNCTIONS ---

/** Mengonversi string tanggal ISO atau Date object ke format YYYY-MM-DD untuk input HTML. */
const formatDateForInput = (dateString: string | Date | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; 
  return date.toISOString().split("T")[0];
};

/** Memformat harga ke format Rupiah. */
const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice < 0) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numPrice);
};


export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- 1. AMBIL QUERY PARAMETERS ---
  const dropoffId = searchParams.get("dropoffId"); 
  const customRuteId = searchParams.get("customRuteId"); // 🆕
  const paketId = searchParams.get("paketId");
  const fasilitasId = searchParams.get("fasilitasId");
  const paketLuarKotaId = searchParams.get("paketLuarKotaId");

  // Tanggal dari URL (hanya terisi untuk paket wisata reguler)
  const tanggalMulaiParam = searchParams.get("tanggalMulaiWisata") || searchParams.get("tanggalMulai") || searchParams.get("startDate") || "";
  const tanggalSelesaiParam = searchParams.get("tanggalSelesaiWisata") || searchParams.get("tanggalSelesai") || searchParams.get("endDate") || "";

  // --- 2. STATES ---
  const [itemDetail, setItemDetail] = useState<any>(null);
  const [tanggalMulai, setTanggalMulai] = useState(formatDateForInput(tanggalMulaiParam));
  const [tanggalSelesai, setTanggalSelesai] = useState(formatDateForInput(tanggalSelesaiParam));
  const [jumlahPeserta, setJumlahPeserta] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableArmada, setAvailableArmada] = useState<any[]>([]);
  const [availableSupir, setAvailableSupir] = useState<any[]>([]);
  const [fetchingAvailable, setFetchingAvailable] = useState(false); // Untuk kasus non-dropoff/custom

  const [selectedArmadaId, setSelectedArmadaId] = useState<number | null>(null);
  const [selectedSupirId, setSelectedSupirId] = useState<number | undefined>(undefined);

  // --- 3. TENTUKAN ENDPOINT ---
  const endpoint = useMemo(() => {
    const baseUrl = 'http://localhost:3001';
    
    // KASUS RUTE KUSTOM
    if (customRuteId) {
        return `${baseUrl}/booking/custom-rute-options?customRuteId=${customRuteId}`;
    }
    // KASUS DROPOFF
    if (dropoffId) {
        return `${baseUrl}/booking/options?dropoffId=${dropoffId}${fasilitasId ? `&fasilitasId=${fasilitasId}` : ''}`;
    }
    // KASUS PAKET WISATA/FASILITAS LAIN
    if (paketId) {
        return `${baseUrl}/paket-wisata/${paketId}`;
    }
    if (fasilitasId) {
        return `${baseUrl}/fasilitas/${fasilitasId}`;
    }
    if (paketLuarKotaId) {
        return `${baseUrl}/paket-wisata-luar-kota/${paketLuarKotaId}`;
    }
    return null;
  }, [customRuteId, dropoffId, paketId, fasilitasId, paketLuarKotaId]);

  // --- 4. useEffect: FETCH DETAIL ITEM (Dan Ketersediaan jika Dropoff/Custom) ---
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
        if (!token) throw new Error("Silakan login.");

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Gagal mengambil detail item (${res.status}).`);
        }

        const data = await res.json();
        
        let detail: any;
        let tglMulai: string | Date | undefined;
        let tglSelesai: string | Date | undefined;
        
        const isCombinedFetch = !!dropoffId || !!customRuteId;

        if (isCombinedFetch) {
            // KASUS DROPOFF/CUSTOM RUTE: Data datang dari endpoint /booking/options atau /custom-rute-options
            detail = data.data.dropoffDetail || data.data.customRuteDetail; 
            
            // Langsung set ketersediaan
            setAvailableArmada(data.data.armadas || []);
            setAvailableSupir(data.data.supirs || []);

            // Tanggal diambil dari detail item
            tglMulai = detail.tanggalMulai;
            tglSelesai = detail.tanggalSelesai;
            
        } else {
            // KASUS PAKET WISATA/FASILITAS LAIN
            detail = data.data || data;
            
            // Tanggal diambil dari URL atau detail API
            tglMulai = tanggalMulaiParam || detail.tanggalMulaiWisata || detail.startDate;
            tglSelesai = tanggalSelesaiParam || detail.tanggalSelesaiWisata || detail.endDate;
        }
        
        setItemDetail(detail);

        // Set tanggal state
        if (tglMulai) setTanggalMulai(formatDateForInput(tglMulai));
        if (tglSelesai) setTanggalSelesai(formatDateForInput(tglSelesai));

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, dropoffId, customRuteId, tanggalMulaiParam, tanggalSelesaiParam]);


  // --- 5. useEffect: FETCH KETERSEDIAAN (Hanya jika BUKAN Dropoff/Custom) ---
  // Logic ini akan mengambil data armada/supir secara terpisah untuk Paket Wisata
  useEffect(() => {
    const isCombinedFetch = !!dropoffId || !!customRuteId;
    // Hanya berjalan jika BUKAN Dropoff/Custom Rute DAN tanggal sudah terisi
    if (isCombinedFetch || !tanggalMulai || !tanggalSelesai) return; 

    const fetchAvailable = async () => {
      try {
        setFetchingAvailable(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const startDate = new Date(tanggalMulai);
        const endDate = new Date(tanggalSelesai);

        // Penyesuaian tanggal akhir, jika diperlukan oleh logic backend Anda
        const adjustedEnd = startDate.getTime() >= endDate.getTime()
          ? new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
          : endDate;

        const startISO = startDate.toISOString();
        const endISO = adjustedEnd.toISOString();

        const [armadaRes, supirRes] = await Promise.all([
          fetch(
            `http://localhost:3001/armada/available-armada?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `http://localhost:3001/supir/available-supir?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        const armadaData = armadaRes.ok ? await armadaRes.json() : { data: [] };
        const supirData = supirRes.ok ? await supirRes.json() : { data: [] };

        setAvailableArmada(Array.isArray(armadaData.data) ? armadaData.data : []);
        setAvailableSupir(Array.isArray(supirData.data) ? supirData.data : []);
      } catch (err: any) {
        console.error("Error fetch armada/supir:", err);
        setAvailableArmada([]);
        setAvailableSupir([]);
      } finally {
        setFetchingAvailable(false);
      }
    };

    fetchAvailable();
  }, [tanggalMulai, tanggalSelesai, dropoffId, customRuteId]);


  // --- 6. HANDLE SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login.");
      router.push("/login");
      return;
    }
    if (!selectedArmadaId || selectedSupirId === undefined) {
      alert("Pilih kendaraan dan supir.");
      return;
    }
    if (!tanggalMulai || !tanggalSelesai) {
      alert("Tanggal layanan belum terisi.");
      return;
    }

    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);

    // Kumpulkan semua ID yang mungkin ada
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
      const res = await fetch("http://localhost:3001/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Gagal booking");
      }

      alert("Booking berhasil!");
      router.push("/my-booking");
    } catch (err: any) {
      alert(err.message);
    }
  };


  // --- 7. RENDER STATES ---
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Memuat Detail Booking...</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen text-center p-20">
        <h2 className="text-2xl text-red-600 font-bold">Terjadi Kesalahan!</h2>
        <p>{error}</p>
    </div>
  );
  if (!itemDetail) return (
    <div className="min-h-screen text-center p-20">
        <h2 className="text-2xl font-bold">Detail Item Tidak Ditemukan</h2>
    </div>
  );

  // --- 8. PREPARE RENDER DATA ---
  const isDropoffOrCustom = !!dropoffId || !!customRuteId;
  const itemTitle = itemDetail?.namaPaket || itemDetail?.namaFasilitas || itemDetail?.namaTujuan || itemDetail?.fasilitas?.namaFasilitas || "Detail Item";
  const itemPrice = itemDetail?.hargaEstimasi || itemDetail?.harga || 0;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-muted"
          >
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
                  {/* ARMADA SELECTOR */}
                  <ArmadaSelector
                    selectedArmadaId={selectedArmadaId}
                    onSelect={setSelectedArmadaId}
                    armadaOptions={availableArmada}
                    loading={isDropoffOrCustom ? loading : fetchingAvailable} 
                  />
                  {/* SUPIR SELECTOR */}
                  <SupirSelectorCard
                    selectedSupirId={selectedSupirId}
                    onSelect={setSelectedSupirId}
                    supirOptions={availableSupir}
                    loading={isDropoffOrCustom ? loading : fetchingAvailable}
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
                  {/* TANGGAL LAYANAN */}
                  <div>
                    <Label>Tanggal Mulai Layanan</Label>
                    <Input type="date" value={tanggalMulai} readOnly />
                  </div>
                  <div>
                    <Label>Tanggal Selesai Layanan</Label>
                    <Input type="date" value={tanggalSelesai} readOnly />
                  </div>
                  
                  {/* HARGA ESTIMASI */}
                  <div className="pt-2 border-t border-dashed">
                      <p className="font-semibold">Harga {isDropoffOrCustom ? 'Estimasi' : 'Paket'}:</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(itemPrice)}</p>
                  </div>

                  {/* JUMLAH PESERTA */}
                  <div>
                    <Label>Jumlah Peserta</Label>
                    <Input
                      type="number"
                      value={jumlahPeserta}
                      min={1}
                      onChange={(e) => setJumlahPeserta(Number(e.target.value))}
                      readOnly={isDropoffOrCustom} 
                    />
                  </div>
                  {/* CATATAN */}
                  <div>
                    <Label>Catatan Khusus</Label>
                    <Textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Opsional"
                    />
                  </div>
                  {/* TOMBOL SUBMIT */}
                  <Button 
                    className="w-full" 
                    onClick={handleSubmit}
                    disabled={!selectedArmadaId || selectedSupirId === undefined}
                  >
                    Booking Sekarang
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}