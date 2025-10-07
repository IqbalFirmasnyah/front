'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Header from "@/app/components/Header";
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, Clock, CreditCard, MapPin, Plane, Image as ImageIcon } from 'lucide-react';
import { convertPackageImageUrl } from "@/lib/helper/image_url"; // Import helper dari file Anda


// Define types that match your data structure from the API
type DetailRute = {
  namaDestinasi: string;
  alamatDestinasi: string;
  jarakDariSebelumnyaKm: number;
  estimasiWaktuTempuh: number; // in minutes
  waktuKunjunganMenit: number;
  deskripsiSingkat: string;
};

type PaketLuarKota = {
  paketLuarKotaId: number;
  namaPaket: string;
  tujuanUtama: string;
  totalJarakKm: number;
  estimasiDurasi: number; // in days
  hargaEstimasi: number;
  detailRute: DetailRute[];
  fotoPaketLuar: string[];
  datePick: string; // The original date from the package definition
};

// Placeholder URL jika tidak ada gambar
const DEFAULT_PLACEHOLDER_URL = 'https://placehold.co/1200x600/E5E7EB/A0AEC0?text=No+Image';

export default function DetailPaketPage() {
  const { id } = useParams();
  const router = useRouter();
  const [paket, setPaket] = useState<PaketLuarKota | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(new Date());
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>('');
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null); // State untuk nama file gambar utama yang dipilih

  useEffect(() => {
    const fetchFasilitas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata-luar-kota/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Paket tidak ditemukan.");
          }
          throw new Error("Gagal mengambil data paket wisata luar kota.");
        }

        const responseData = await res.json();
        const fetchedPaket: PaketLuarKota = responseData.data;

        setPaket(fetchedPaket);

        // Set gambar pertama sebagai gambar yang dipilih saat data dimuat
        if (fetchedPaket.fotoPaketLuar && fetchedPaket.fotoPaketLuar.length > 0) {
            setSelectedImageName(fetchedPaket.fotoPaketLuar[0]);
        }

      } catch (err: any) {
        console.error("Error fetching package details:", err);
        setPaket(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFasilitas();
    }
  }, [id, router]);

  useEffect(() => {
    if (selectedStartDate && paket?.estimasiDurasi) {
      const endDateObj = new Date(selectedStartDate);
      // Kurangi 1 hari karena durasi sudah termasuk hari pertama
      endDateObj.setDate(selectedStartDate.getDate() + paket.estimasiDurasi - 1); 
      setCalculatedEndDate(format(endDateObj, 'yyyy-MM-dd'));
    } else {
      setCalculatedEndDate('');
    }
  }, [selectedStartDate, paket?.estimasiDurasi]);

  const handleBooking = () => {
    if (!selectedStartDate || !calculatedEndDate) {
      alert("Silakan pilih tanggal keberangkatan terlebih dahulu.");
      return;
    }
    router.push(
      `/booking?paketLuarKotaId=${paket?.paketLuarKotaId}&tanggalMulaiWisata=${format(selectedStartDate, 'yyyy-MM-dd')}&tanggalSelesaiWisata=${calculatedEndDate}`
    );
  };
  
  const formatRupiah = (value: number | null | undefined) =>
    value != null ? `Rp ${value.toLocaleString("id-ID")}` : "Harga tidak tersedia";

  if (loading) {
    // ... (Loading state JSX)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="w-full h-96 bg-gray-200 rounded-2xl"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!paket) {
    // ... (Not found state JSX)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2">Paket Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">Paket wisata yang Anda cari tidak tersedia.</p>
            <Button onClick={() => router.push('/paket-wisata-luar')} variant="ocean">
              Kembali ke Daftar Paket
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  // Tentukan URL gambar utama yang akan ditampilkan
  const primaryImageUrl = selectedImageName 
    ? convertPackageImageUrl(selectedImageName) 
    : DEFAULT_PLACEHOLDER_URL;
    

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mb-6 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke daftar paket
          </Button>

          {/* Package Header & Gallery */}
          <div className="mb-8">
            {/* Display Gambar Utama */}
            <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-card mb-4">
                {primaryImageUrl !== DEFAULT_PLACEHOLDER_URL ? (
                    <img
                        src={primaryImageUrl} 
                        alt={paket.namaPaket}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-300 flex flex-col items-center justify-center text-muted-foreground">
                        <Plane className="h-24 w-24 text-gray-500" />
                        <p className='mt-2'>Gambar Tidak Tersedia</p>
                    </div>
                )}
            </div>

            {/* Thumbnail Gallery */}
            {paket.fotoPaketLuar.length > 0 && (
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                    {paket.fotoPaketLuar.map((imageName, index) => {
                        const url = convertPackageImageUrl(imageName);
                        return (
                            <img
                                key={index}
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                className={cn(
                                    "w-20 h-20 object-cover rounded-lg cursor-pointer transition-all",
                                    imageName === selectedImageName
                                        ? "border-4 border-primary shadow-lg" 
                                        : "opacity-70 hover:opacity-100 hover:border-2 hover:border-primary/50"
                                )}
                                onClick={() => setSelectedImageName(imageName)}
                            />
                        );
                    })}
                </div>
            )}
            
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold">{paket.namaPaket}</h1>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {paket.estimasiDurasi} Hari
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatRupiah(paket.hargaEstimasi)}
                    <span className="text-sm text-muted-foreground font-normal">/paket</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Package Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Deskripsi Paket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Tujuan Utama: {paket.tujuanUtama}
                    <br />
                    Total Jarak: {paket.totalJarakKm} km
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detail Rute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paket.detailRute.length > 0 ? (
                      paket.detailRute.map((rute, idx) => (
                        <div key={idx} className="border-l-2 border-primary/30 pl-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {idx + 1}. {rute.namaDestinasi}
                          </h3>
                          <p className="text-sm text-muted-foreground">{rute.deskripsiSingkat}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>Jarak: {rute.jarakDariSebelumnyaKm} km</span> |
                            <span> Waktu Tempuh: {rute.estimasiWaktuTempuh} menit</span> |
                            <span> Kunjungan: {rute.waktuKunjunganMenit} menit</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Tidak ada detail rute yang tersedia untuk paket ini.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Pilih Tanggal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="tanggalKeberangkatan">Tanggal Keberangkatan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="tanggalKeberangkatan"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedStartDate ? format(selectedStartDate, "dd/MM/yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedStartDate}
                          onSelect={setSelectedStartDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {selectedStartDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Perkiraan tanggal selesai: <strong>{calculatedEndDate}</strong>
                      </p>
                    )}
                  </div>

                  <Button 
                    className="w-full text-black" 
                    variant="ocean"
                    size="lg"
                    onClick={handleBooking}
                    disabled={!selectedStartDate}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pesan Sekarang
                  </Button>
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
    </div>
  );
}