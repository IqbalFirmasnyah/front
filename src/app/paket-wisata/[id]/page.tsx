'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Badge } from '@/app/components/ui/badge';
import { Calendar as CalendarIcon, ArrowLeft, CreditCard, Clock, Star, Image as ImageIcon } from 'lucide-react';
import { format, startOfDay, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Toaster, toast } from "sonner";
import { convertTravelImageUrl } from "@/lib/helper/image_url";

// FUNGSI HELPER BARU: untuk mengonversi nama file gambar menjadi URL yang dapat diakses

interface PaketWisata {
  paketId: number;
  namaPaket: string;
  deskripsi: string;
  itinerary: string;
  harga: number;
  durasiHari: number;
  statusPaket: string;
  kategori: string;
  images: string[];
}

const faqList = [
  { question: 'Apa saja yang termasuk dalam paket?', answer: 'Paket termasuk akomodasi, transportasi, tiket masuk objek wisata, dan tour guide.' },
  { question: 'Bisakah saya membatalkan perjalanan?', answer: 'Pembatalan bisa dilakukan maksimal H-3 dengan potongan 25% dari total biaya.' },
  { question: 'Apakah ada diskon untuk grup?', answer: 'Kami memberikan diskon 10% untuk grup minimal 10 orang.' }
];

const testimonials = [
  { nama: 'Andi Setiawan', kota: 'Surabaya', rating: 5, komentar: 'Perjalanan yang menyenangkan dan pelayanan luar biasa!', foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { nama: 'Sinta Ayu', kota: 'Bandung', rating: 5, komentar: 'Rekomendasi banget! Semua sesuai dengan deskripsi.', foto: 'https://images.unsplash.com/photo-1494790108755-2616b60b8f83?w=100&h=100&fit=crop&crop=face' },
];

export default function PaketWisataDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [paket, setPaket] = useState<PaketWisata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState<Date | undefined>();
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(`http://localhost:3001/paket-wisata/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
            throw new Error("Sesi berakhir, silakan login kembali.");
          }
          throw new Error(`Gagal mengambil data paket (${res.status})`);
        }

        const data = await res.json();
        const fetchedPaket: PaketWisata = data.data;
        setPaket(fetchedPaket);

        if (fetchedPaket.images?.length > 0) {
          setSelectedImage(fetchedPaket.images[0]);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data.");
        toast.error(err.message || "Gagal memuat data paket.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, router]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getTanggalSelesai = () => {
    if (!tanggal || !paket?.durasiHari) return "";
    const endDate = new Date(tanggal);
    endDate.setDate(endDate.getDate() + paket.durasiHari);
    return endDate;
  };

  const handleBooking = () => {
    if (!tanggal) {
      toast.error("Silakan pilih tanggal keberangkatan terlebih dahulu.");
      return;
    }

    const tanggalSelesai = getTanggalSelesai();
    const formattedTanggalSelesai = tanggalSelesai ? format(tanggalSelesai, 'yyyy-MM-dd') : "";

    toast.success("Tanggal dipilih. Membuka halaman detail booking...");
    router.push(
      `/booking?paketId=${paket?.paketId}&tanggalMulaiWisata=${format(tanggal, 'yyyy-MM-dd')}&tanggalSelesaiWisata=${formattedTanggalSelesai}`
    );
  };

  // --- LOADING / ERROR STATES ---
  if (loading) {
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
        {/* Toaster lokal (aman kalau Toaster global belum ada). Jika sudah ada di layout, ini boleh dihapus. */}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="ocean">
              Muat Ulang
            </Button>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  if (!paket) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold mb-2">Paket Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">Paket wisata yang Anda cari tidak tersedia.</p>
            <Button onClick={() => router.push('/paket-wisata')} variant="ocean">
              Kembali ke Daftar Paket
            </Button>
          </div>
        </main>
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  // --- KOMPONEN UTAMA (Setelah Data Dimuat) ---
  const defaultImagePlaceholder =
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop';

  const currentImageUrl =
    paket.images.length > 0 && selectedImage
      ? convertTravelImageUrl(selectedImage)
      : defaultImagePlaceholder;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke daftar paket
          </Button>

          {/* Package Header & Gallery */}
          <div className="mb-8">
            <div className="mb-6">
              <div className="relative w-full h-96 overflow-hidden rounded-2xl shadow-card mb-4">
                {/* Gambar Utama */}
                <img
                  src={currentImageUrl}
                  alt={paket.namaPaket}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImagePlaceholder;
                  }}
                />
                {paket.images.length === 0 && (
                  <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p>Tidak ada gambar tersedia</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {paket.images.length > 0 && (
                <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
                  {paket.images.map((imageName, index) => {
                    const url = convertTravelImageUrl(imageName);
                    const active = imageName === selectedImage;
                    return (
                      <img
                        key={index}
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className={cn(
                          "w-20 h-20 object-cover rounded-lg cursor-pointer transition-all border",
                          active
                            ? "border-4 border-primary shadow-lg"
                            : "border-transparent opacity-75 hover:opacity-100 hover:border-primary/50"
                        )}
                        onClick={() => setSelectedImage(imageName)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/80x80/eeeeee/333333?text=?';
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold">{paket.namaPaket}</h1>
                <Badge className={cn(
                  "capitalize",
                  paket.statusPaket?.toLowerCase() === 'aktif'
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}>
                  {paket.statusPaket}
                </Badge>
                <Badge variant="secondary">{paket.kategori}</Badge>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {paket.durasiHari} Hari
                </div>
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(paket.harga)}
                  <span className="text-sm text-muted-foreground font-normal">/paket</span>
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
                  <p className="text-muted-foreground leading-relaxed">{paket.deskripsi}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(paket.itinerary || "").split('\n').map((line, idx) => (
                      <div key={idx} className="border-l-2 border-primary/30 pl-4">
                        <p className="text-sm">{line}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card>
                <CardHeader>
                  <CardTitle>Testimoni Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {testimonials.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="italic text-muted-foreground mb-4">"{item.komentar}"</p>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.foto}
                            className="w-10 h-10 rounded-full object-cover"
                            alt={item.nama}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/100x100/A0AEC0/FFFFFF?text=P';
                            }}
                          />
                          <div>
                            <p className="font-semibold text-sm">{item.nama}</p>
                            <p className="text-xs text-muted-foreground">{item.kota}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle>Pertanyaan Umum (FAQ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {faqList.map((faq, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <button
                          onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          className="w-full text-left font-semibold hover:text-primary transition-colors"
                        >
                          {faq.question}
                        </button>
                        {faqOpen === idx && (
                          <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                        )}
                      </div>
                    ))}
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
                  {/* Date Picker yang rapi (shadcn) */}
                  <div className="space-y-2">
                    <Label>Tanggal Keberangkatan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !tanggal && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tanggal ? format(tanggal, "dd MMM yyyy") : "Pilih tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tanggal}
                          onSelect={setTanggal}
                          // Disable tanggal sebelum hari ini
                          disabled={(date) => isBefore(date, startOfDay(new Date()))}
                          initialFocus
                          className="p-3 rounded-md border bg-background"
                        />
                      </PopoverContent>
                    </Popover>
                    {tanggal && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Perkiraan tanggal selesai:{" "}
                        <strong>
                          {getTanggalSelesai() ? format(getTanggalSelesai() as Date, "dd MMM yyyy") : ""}
                        </strong>
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full text-black"
                    variant="ocean"
                    size="lg"
                    onClick={handleBooking}
                    disabled={!tanggal}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Detail Booking
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
