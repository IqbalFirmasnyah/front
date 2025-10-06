"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  FileText,
  Plane,
  Globe2,
  Home,
  Phone,
  Clock,
  Info,
  CheckCircle,
  Calendar as CalendarIcon,
  Route,
  Plus,
  Trash2,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Label } from "../components/ui/label";
import Header from "../components/Header";

/* ---------- Types ---------- */
interface CustomRouteSegment {
  nama: string;
  alamat: string;
}

interface CreateCustomRuteDto {
  fasilitasId: number;
  tujuanList: CustomRouteSegment[];
  tanggalMulai: string;
  tanggalSelesai: string;
  catatanKhusus?: string;
}

/* ---------- Page wrapper: Wajib ada Suspense ---------- */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CreateCustomRutePageClient />
    </Suspense>
  );
}

/* ---------- Client component yang pakai useSearchParams ---------- */
function CreateCustomRutePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fasilitasId = searchParams.get("fasilitasId");

  const [customRouteSegments, setCustomRouteSegments] = useState<CustomRouteSegment[]>([
    { nama: "", alamat: "" },
  ]);
  const [pilihDate, setPilihDate] = useState<Date | undefined>(undefined);
  const [catatanKhusus, setCatatanKhusus] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!fasilitasId) {
      setError("Fasilitas ID tidak ditemukan. Harap kembali ke halaman fasilitas.");
    }
  }, [fasilitasId]);

  const handleAddSegment = () => {
    setCustomRouteSegments((prev) => [...prev, { nama: "", alamat: "" }]);
  };

  const handleRemoveSegment = (index: number) => {
    setCustomRouteSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSegmentChange = (index: number, field: keyof CustomRouteSegment, value: string) => {
    setCustomRouteSegments((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan. Harap login ulang.");
      setLoading(false);
      router.push("/login");
      return;
    }

    if (!fasilitasId) {
      setError("Fasilitas ID tidak valid.");
      setLoading(false);
      return;
    }

    if (!pilihDate) {
      setError("Tanggal layanan harus diisi.");
      setLoading(false);
      return;
    }

    if (customRouteSegments.length === 0) {
      setError("Setidaknya harus ada satu segmen rute kustom.");
      setLoading(false);
      return;
    }
    for (const segment of customRouteSegments) {
      if (!segment.nama || !segment.alamat) {
        setError("Semua detail destinasi (nama dan alamat) harus diisi.");
        setLoading(false);
        return;
      }
    }

    const formattedDate = format(pilihDate, "yyyy-MM-dd");

    const payload: CreateCustomRuteDto = {
      fasilitasId: Number(fasilitasId),
      tujuanList: customRouteSegments,
      tanggalMulai: formattedDate,
      tanggalSelesai: formattedDate,
      catatanKhusus: catatanKhusus || undefined,
    };

    try {
      const res = await fetch("http://localhost:3001/custom-rute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg =
          Array.isArray((errorData as any).message)
            ? (errorData as any).message.join(", ")
            : (errorData as any).message;
        throw new Error(msg || "Gagal membuat Rute Kustom.");
      }

      const result = await res.json();
      setSuccess("Rute Kustom berhasil dibuat!");

      const { customRuteId, fasilitasId: returnedFasilitasId } = result;
      router.push(`/booking?customRuteId=${customRuteId}&fasilitasId=${returnedFasilitasId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat membuat Rute Kustom.";
      setError(message);
      // console.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="fasilitas" />

      <main className="pt-24">
        {/* Hero Banner */}
        <section
          className="relative bg-cover bg-center py-28 text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1502691876148-a84978e59af8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative container mx-auto px-6 text-center">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Buat Rute Kustom Baru 🗺️
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Rencanakan perjalanan impian Anda. Tentukan sendiri destinasi dan
              rute yang Anda inginkan.
            </motion.p>
          </div>
        </section>

        {/* Form + Info Section */}
        <section className="py-16">
          <div className="container mx-auto grid lg:grid-cols-2 gap-10 px-6">
            {/* Left: Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Formulir Rute Kustom
              </h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Calendar Input (Tanggal Layanan) */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-medium text-gray-700">
                    <CalendarIcon size={18} /> Tanggal Layanan
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !pilihDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {pilihDate ? format(pilihDate, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pilihDate}
                        onSelect={setPilihDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Destinasi/Segmen Rute Kustom */}
                <section className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Route size={20} className="text-black" /> Detail Destinasi
                  </h3>
                  {customRouteSegments.map((segment, index) => (
                    <div key={index} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm relative space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-700">Destinasi #{index + 1}</h4>
                        {customRouteSegments.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSegment(index)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-700"
                            title="Hapus Destinasi"
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor={`nama-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Destinasi
                          </label>
                          <input
                            type="text"
                            id={`nama-${index}`}
                            value={segment.nama}
                            onChange={(e) => handleSegmentChange(index, "nama", e.target.value)}
                            className="w-full border rounded-md shadow-sm px-4 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                            placeholder="Contoh: Kawah Putih Bandung"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor={`alamat-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Alamat Destinasi
                          </label>
                          <textarea
                            id={`alamat-${index}`}
                            value={segment.alamat}
                            onChange={(e) => handleSegmentChange(index, "alamat", e.target.value)}
                            rows={2}
                            className="w-full border rounded-md shadow-sm px-4 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                            placeholder="Tulis alamat lengkap destinasi"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddSegment}
                    variant="outline"
                    className="w-full justify-center text-sm font-semibold border-dashed border-gray-300 text-gray-600 hover:bg-gray-100 mt-4"
                  >
                    <Plus size={18} className="mr-2" /> Tambah Destinasi
                  </Button>
                </section>

                {/* Catatan Khusus */}
                <div>
                  <label htmlFor="catatanKhusus" className="flex items-center gap-2 font-medium text-gray-700 mb-1">
                    <FileText size={18} /> Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    id="catatanKhusus"
                    value={catatanKhusus}
                    onChange={(e) => setCatatanKhusus(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md shadow-sm px-4 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                    placeholder="Contoh: Butuh kursi bayi, atau informasi alergi"
                  />
                </div>

                {error && <p className="text-red-600 text-center text-sm">{error}</p>}
                {success && <p className="text-green-600 text-center text-sm">{success}</p>}

                <Button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white mt-2"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Buat Rute Kustom"}
                </Button>
              </form>
            </div>

            {/* Right: Info Cards */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 hover:shadow-xl transition cursor-default">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-primary">
                    <Info className="h-5 w-5 text-black" />
                    Keunggulan Rute Kustom
                  </CardTitle>
                </CardHeader>
                <ul className="space-y-2 mt-3 text-gray-700">
                  {[
                    "Fleksibilitas penuh dalam menentukan destinasi.",
                    "Jadwal perjalanan yang disesuaikan dengan keinginan Anda.",
                    "Pilihan kendaraan sesuai kebutuhan kelompok.",
                    "Bebas memilih lama waktu di setiap lokasi.",
                  ].map((info, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      {info}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="overflow-hidden rounded-xl hover:shadow-xl transition cursor-default">
                <img
                  src="https://images.unsplash.com/photo-1549646401-d7037e9659a8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Custom route service"
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg md:text-xl font-semibold mb-1">
                    Jelajahi Sesuai Aturan Anda
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Dengan layanan rute kustom, Anda adalah perencana perjalanan
                    utama. Kami siap mewujudkan setiap detailnya.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 text-gray-800 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plane size={20} /> Jelajah
                </CardTitle>
              </CardHeader>
              <p className="text-gray-600">
                Mewujudkan perjalanan impian Anda dengan layanan terpercaya.
              </p>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">Layanan</CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {[
                  { text: "Paket Wisata Domestik", icon: <Plane size={16} /> },
                  { text: "Paket Wisata Internasional", icon: <Globe2 size={16} /> },
                  { text: "Hotel & Akomodasi", icon: <Home size={16} /> },
                  { text: "Transportasi", icon: <MapPin size={16} /> },
                ].map((layanan) => (
                  <motion.li
                    key={layanan.text}
                    className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition"
                    whileHover={{ x: 5 }}
                  >
                    {layanan.icon} {layanan.text}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">
                  Destinasi Populer
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {["Bali", "Yogyakarta", "Raja Ampat", "Lombok"].map((dest) => (
                  <motion.li
                    key={dest}
                    className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition"
                    whileHover={{ x: 5 }}
                  >
                    <MapPin size={16} /> {dest}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">Kontak</CardTitle>
              </CardHeader>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Phone size={16} /> +62 21 1234 5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} /> info@jelajah.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} /> Jakarta, Indonesia
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={16} /> 24/7 Support
                </li>
              </ul>
            </Card>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} Jelajah Tour & Travel. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
