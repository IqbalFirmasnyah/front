"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  FileText,
  Plane,
  Globe2,
  Home,
  Phone,
  Mail,
  Clock,
  Info,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import Header from "../components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Label } from "../components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CreateDropoffDto {
  namaTujuan: string;
  alamatTujuan: string;
  tanggalLayanan: string;
}

export default function CreateDropoffPage() {
  const router = useRouter();

  const [namaTujuan, setNamaTujuan] = useState("");
  const [alamatTujuan, setAlamatTujuan] = useState("");
  const [tanggalLayanan, setTanggalLayanan] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    if (!namaTujuan || !alamatTujuan || !tanggalLayanan) {
      setError("Nama Tujuan, Alamat Tujuan, dan Tanggal Layanan harus diisi.");
      setLoading(false);
      return;
    }

    const payload: CreateDropoffDto = {
      namaTujuan,
      alamatTujuan,
      tanggalLayanan: format(tanggalLayanan, "yyyy-MM-dd"),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dropoff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
        throw new Error(errorMessage || "Gagal membuat Dropoff.");
      }

      const result = await res.json();
      setSuccess("Dropoff berhasil dibuat!");
      console.log("Dropoff created:", result);

      const { dropoffId, fasilitasId } = result;
      router.push(`/booking?dropoffId=${dropoffId}&fasilitasId=${fasilitasId}`);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat membuat Dropoff.");
      console.error("Error creating dropoff:", err);
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
              "url('https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba')",
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
              Buat Dropoff Baru 🚐
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Layanan drop-off untuk memudahkan perjalanan Anda ke tujuan pilihan
              dengan nyaman.
            </motion.p>
          </div>
        </section>

        {/* Form + Info Section */}
        <section className="py-16">
          <div className="container mx-auto grid lg:grid-cols-2 gap-10 px-6">
            {/* Left: Form */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                Formulir Dropoff
              </h2>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="namaTujuan"
                    className="flex items-center gap-2 font-medium text-gray-700 mb-1"
                  >
                    <MapPin size={18} /> Nama Tujuan
                  </label>
                  <input
                    type="text"
                    id="namaTujuan"
                    value={namaTujuan}
                    onChange={(e) => setNamaTujuan(e.target.value)}
                    className="w-full border rounded-md shadow-sm px-4 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                    placeholder="Contoh: Bandara Soekarno-Hatta"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="alamatTujuan"
                    className="flex items-center gap-2 font-medium text-gray-700 mb-1"
                  >
                    <FileText size={18} /> Alamat Tujuan
                  </label>
                  <textarea
                    id="alamatTujuan"
                    value={alamatTujuan}
                    onChange={(e) => setAlamatTujuan(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md shadow-sm px-4 py-2 focus:ring-2 focus:ring-black focus:border-black transition"
                    placeholder="Tulis alamat lengkap tujuan"
                    required
                  />
                </div>

                {/* Calendar */}
                <div className="space-y-2">
                  <Label>Tanggal Layanan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !tanggalLayanan && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tanggalLayanan ? format(tanggalLayanan, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={tanggalLayanan}
                        onSelect={setTanggalLayanan}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {error && (
                  <p className="text-red-600 text-center text-sm">{error}</p>
                )}
                {success && (
                  <p className="text-green-600 text-center text-sm">{success}</p>
                )}

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={loading}
                >
                  {loading ? "Memproses..." : "Buat Dropoff"}
                </Button>
              </form>
            </div>

            {/* Right: Info Cards */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 hover:shadow-xl transition cursor-default">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Info className="h-5 w-5 text-primary" />
                    Informasi Layanan Dropoff
                  </CardTitle>
                </CardHeader>
                <ul className="space-y-2 mt-3 text-gray-700">
                  {[
                    "Supir profesional dan berpengalaman",
                    "Harga transparan tanpa biaya tersembunyi",
                    "Penjemputan tepat waktu sesuai permintaan",
                    "Layanan tersedia 24/7 untuk berbagai tujuan",
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
                  src="https://images.unsplash.com/photo-1502920917128-1aa500764b8a?w=800&h=400&fit=crop"
                  alt="Dropoff service"
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg md:text-xl font-semibold mb-1">
                    Perjalanan Nyaman & Aman
                  </h3>
                  <p className="text-gray-600 text-sm md:text-base">
                    Kami memastikan setiap perjalanan drop-off Anda berjalan
                    lancar dengan armada terbaik dan supir yang siap melayani.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plane size={20} /> TravelKu
                </CardTitle>
              </CardHeader>
              <p className="text-primary-foreground/80">
                Mewujudkan perjalanan impian Anda dengan layanan terpercaya.
              </p>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
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
                    className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                    whileHover={{ x: 5 }}
                  >
                    {layanan.icon} {layanan.text}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">
                  Destinasi Populer
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {["Bali", "Yogyakarta", "Raja Ampat", "Lombok"].map((dest) => (
                  <motion.li
                    key={dest}
                    className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                    whileHover={{ x: 5 }}
                  >
                    <MapPin size={16} /> {dest}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Kontak</CardTitle>
              </CardHeader>
              <ul className="space-y-2 text-primary-foreground/80">
                <li className="flex items-center gap-2">
                  <Phone size={16} /> +62 21 1234 5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} /> info@travelku.com
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

          <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-primary-foreground/80">
            <p>
              &copy; {new Date().getFullYear()} TravelKu. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
