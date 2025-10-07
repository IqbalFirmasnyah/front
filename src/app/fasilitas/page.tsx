"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Car, ArrowRightCircle, PlusCircle, Clock, Globe2, Home, Mail, Phone, Plane } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

// ==================== TYPES ====================
type DetailRutePaketLuarKota = {
  ruteId: number;
  paketLuarKotaId: number;
  urutanKe: number;
  namaDestinasi: string;
  alamatDestinasi: string;
  jarakDariSebelumnyaKm: number;
  estimasiWaktuTempuh: number;
  waktuKunjunganMenit: number;
  deskripsiSingkat: string | null;
};

type PaketLuarKota = {
  paketLuarKotaId: number;
  namaPaket: string;
  tujuanUtama: string;
  totalJarakKm: number;
  estimasiDurasi: number;
  hargaEstimasi: number;
  statusPaket: string;
  datePick: string;
  gambar?: string | null; // ✅ gambar ditambahkan
  detailRute: DetailRutePaketLuarKota[];
};

type CustomRuteFasilitas = {
  customRuteId: number;
  fasilitasId: number;
  tujuanList: string;
  totalJarakKm: number;
  estimasiDurasi: number;
  pilihDate: string;
  hargaEstimasi: number;
  catatanKhusus: string | null;
  gambar?: string | null; // ✅ gambar ditambahkan
};

type Dropoff = {
  dropoffId: number;
  fasilitasId: number;
  namaTujuan: string;
  alamatTujuan: string;
  jarakKm: number;
  estimasiDurasi: number;
  tanggalLayanan: string;
  hargaEstimasi: number;
  gambar?: string | null; // ✅ gambar ditambahkan
};

type Fasilitas = {
  fasilitasId: number;
  namaFasilitas: string;
  deskripsi?: string;
  jenisFasilitas: string;
  paketLuarKotaId?: number | null;
  paketLuarKota?: PaketLuarKota;
  customRute?: CustomRuteFasilitas;
  dropoff?: Dropoff;
  gambar?: string | null; // ✅ gambar di root fasilitas
};

// ==================== COMPONENT ====================
export default function FasilitasPage() {
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [filteredList, setFilteredList] = useState<Fasilitas[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formatRupiah = (value: number | undefined) =>
    value != null ? `Rp ${value.toLocaleString("id-ID")}` : "Harga tidak tersedia";

  useEffect(() => {
    const fetchFasilitas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan. Harap login ulang.");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal mengambil data fasilitas.");
        }

        const responseData = await res.json();
        setFasilitasList(responseData.data || []);
        setFilteredList(responseData.data || []);
      } catch (err: any) {
        console.error("Error fetching fasilitas list:", err);
        setError(err.message || "Terjadi kesalahan saat memuat fasilitas.");
      } finally {
        setLoading(false);
      }
    };

    fetchFasilitas();
  }, []);

  // ==================== FILTER & SEARCH ====================
  useEffect(() => {
    let result = fasilitasList;

    if (filter !== "all") {
      result = result.filter((f) => f.jenisFasilitas === filter);
    }

    if (search.trim()) {
      result = result.filter((f) =>
        f.namaFasilitas.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredList(result);
  }, [search, filter, fasilitasList]);

  const handleCreateDropoff = () => router.push("/dropoff");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pt-24 flex-grow">
        {/* Hero Banner */}
        <section  className="relative bg-cover bg-center py-32 text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
          }}>
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Fasilitas Perjalanan</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Pilih paket, buat rute kustom, atau dropoff sesuai kebutuhan Anda
            </p>
          </div>
        </section>

        {/* Filter & Search */}
        <section className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setFilter("all")}
                variant={filter === "all" ? "ocean" : "outline"}
              >
                Semua
              </Button>
              <Button
                onClick={() => setFilter("paket_luar_kota")}
                variant={filter === "paket_luar_kota" ? "ocean" : "outline"}
              >
                Paket Luar Kota
              </Button>
              <Button
                onClick={() => setFilter("custom")}
                variant={filter === "custom" ? "ocean" : "outline"}
              >
                Custom Rute
              </Button>
            </div>
            <Input
              type="text"
              placeholder="Cari fasilitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
          </div>

          {/* Loading / Error / Data */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border animate-pulse"
                >
                  <div className="h-40 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="ocean">
                Muat Ulang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {/* Static Dropoff */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Buat Dropoff</h3>
                    <Badge className="capitalize bg-green-100 text-green-800">
                      Dropoff
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pesan layanan antar langsung ke titik tujuan sesuai kebutuhan Anda.
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Destinasi Unik</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-primary" />
                      <span>Harga Dihitung per Jarak</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateDropoff}
                    className="w-full mt-4 text-black"
                    variant="ghost"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Buat Dropoff Baru
                  </Button>
                </div>
              </motion.div>

              {/* Dynamic fasilitas dari API */}
              {filteredList.length > 0 ? (
                filteredList.map((fasilitas) => {
                  let buttonText = "Lihat Detail";
                  let buttonVariant: any = "ocean";
                  let detailUrl = "";
                  const icon = <ArrowRightCircle className="h-4 w-4" />;
                  let displayPrice: number | undefined;
                  let gambar = fasilitas.gambar;

                  switch (fasilitas.jenisFasilitas) {
                    case "paket_luar_kota":
                      buttonText = "Lihat Paket";
                      detailUrl = `/paket-wisata-luar/${fasilitas.paketLuarKota?.paketLuarKotaId}`;
                      displayPrice = fasilitas.paketLuarKota?.hargaEstimasi;
                      gambar =
                        fasilitas.paketLuarKota?.gambar || "/images/paket-default.jpg";
                      break;
                    case "custom":
                      buttonText = "Lihat Rute Kustom";
                      buttonVariant = "tropical";
                      detailUrl = `/custom-rute?fasilitasId=${fasilitas.fasilitasId}`;
                      displayPrice = fasilitas.customRute?.hargaEstimasi;
                      gambar =
                        fasilitas.customRute?.gambar || "/images/custom-default.jpg";
                      break;
                    default:
                      return null;
                  }

                  return (
                    <motion.div
                      key={fasilitas.fasilitasId}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg"
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold text-gray-900">
                            {fasilitas.namaFasilitas}
                          </h3>
                          <Badge
                            className={`capitalize ${
                              fasilitas.jenisFasilitas === "paket_luar_kota"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {fasilitas.jenisFasilitas.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {fasilitas.deskripsi}
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          {fasilitas.jenisFasilitas === "paket_luar_kota" &&
                            fasilitas.paketLuarKota && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Tujuan: {fasilitas.paketLuarKota.tujuanUtama}</span>
                              </div>
                            )}
                          {fasilitas.jenisFasilitas === "custom" &&
                            fasilitas.customRute && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Jarak: {fasilitas.customRute.totalJarakKm} km</span>
                              </div>
                            )}
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            <span>Harga Estimasi: {formatRupiah(displayPrice)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push(detailUrl)}
                          className="w-full mt-4 text-black"
                          variant={buttonVariant}
                        >
                          {icon} {buttonText}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 col-span-full">
                  <p className="text-gray-600 mb-6">
                    Belum ada paket atau rute kustom yang tersedia.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ✅ Footer ala paket wisata */}
      <footer className="bg-primary text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plane size={20} /> TravelKu
                </CardTitle>
              </CardHeader>
              <CardContent className="text-primary-foreground/80">
                Mewujudkan perjalanan impian Anda dengan layanan terpercaya
                dan pengalaman tak terlupakan.
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Layanan</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Popular Destinations */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Destinasi Populer</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Kontak</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Copyright */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; {new Date().getFullYear()} TravelKu. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
