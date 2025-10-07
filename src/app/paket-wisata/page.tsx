"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Plane,
  Globe2,
  Home,
  Phone,
  Mail,
  Image, // Import komponen Image dari lucide-react untuk placeholder/indikator
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { convertTravelImageUrl } from "@/lib/helper/image_url";



interface PaketWisata {
  paketId: number;
  namaPaket: string;
  deskripsi: string;
  harga: number;
  durasiHari: string;
  statusPaket: string;
  kategori: string;
  images: string[];
}

export default function PaketWisataPage() {
  const [pakets, setPakets] = useState<PaketWisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterKategori, setFilterKategori] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan, silakan login terlebih dahulu.");
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/login");
            throw new Error("Sesi berakhir, silakan login kembali.");
          }
          throw new Error(`Gagal mengambil data (${res.status})`);
        }

        // Asumsi data yang diterima memiliki array 'images' yang berisi NAMA FILE
        const data = await res.json();
        setPakets(data.data || []);
      } catch (err: any) {
        console.error("Gagal fetch paket wisata:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLihatDetail = (paketWisataId: number) => {
    router.push(`/paket-wisata/${paketWisataId}`);
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  // Filter + sort
  const filteredPackages = pakets.filter((pkg) => {
    const matchesSearch =
      pkg.namaPaket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori =
      filterKategori === "all" || pkg.kategori === filterKategori;
    return matchesSearch && matchesKategori;
  });

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.harga - b.harga;
      case "price-high":
        return b.harga - a.harga;
      case "name":
        return a.namaPaket.localeCompare(b.namaPaket);
      case "popular":
      default:
        return a.paketId - b.paketId;
    }
  });

  const categories = ["all", ...Array.from(new Set(pakets.map((p) => p.kategori)))];

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage="packages" />

      <main className="pt-24">
        {/* Hero Banner */}
        <section
          className="relative bg-cover bg-center py-32 text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-6"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Temukan Perjalanan Impianmu ✈️
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Dari pantai tropis hingga gunung megah, kami punya paket terbaik
              untukmu.
            </motion.p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-muted/30 shadow-sm">
          <div className="container mx-auto px-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari paket wisata..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "Semua Kategori" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Default</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                <SelectItem value="name">Nama A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Keunggulan Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Kenapa Memilih Paket Wisata TravelKu?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-10">
              TravelKu menghadirkan pengalaman wisata yang berbeda, dengan
              layanan terbaik, harga transparan, serta destinasi pilihan yang
              dirancang khusus untuk kebutuhan liburan Anda.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white shadow rounded-xl">
                <h3 className="font-semibold text-lg mb-2">🛡️ Aman & Terpercaya</h3>
                <p className="text-gray-600">
                  Dijamin dengan legalitas resmi, pembayaran aman, dan layanan
                  yang dapat diandalkan.
                </p>
              </div>
              <div className="p-6 bg-white shadow rounded-xl">
                <h3 className="font-semibold text-lg mb-2">💰 Harga Transparan</h3>
                <p className="text-gray-600">
                  Tidak ada biaya tersembunyi. Semua detail harga jelas sejak awal.
                </p>
              </div>
              <div className="p-6 bg-white shadow rounded-xl">
                <h3 className="font-semibold text-lg mb-2">🌍 Destinasi Terbaik</h3>
                <p className="text-gray-600">
                  Dari Bali, Lombok, Yogyakarta hingga destinasi internasional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">
                {loading ? "Memuat..." : `${filteredPackages.length} Paket Tersedia`}
              </h2>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border animate-pulse">
                    <div className="w-full h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedPackages.map((paket) => (
                  <motion.div
                    key={paket.paketId}
                    whileHover={{ scale: 1.02 }}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden">
                      {/* Menggunakan convertTravelImageUrl untuk mendapatkan URL gambar pertama */}
                      {paket.images && paket.images.length > 0 ? (
                        <img
                          src={convertTravelImageUrl(paket.images[0])} // DIGUNAKAN DI SINI
                          alt={paket.namaPaket}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                          <MapPin className="h-12 w-12 text-white" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          paket.statusPaket === 'Aktif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paket.statusPaket}
                        </span>
                      </div>

                      {/* Indikator jumlah gambar */}
                      {paket.images && paket.images.length > 1 && (
                         <div className="absolute bottom-4 left-4">
                           <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 text-white">
                             <Image className="h-3 w-3" />
                             {paket.images.length} Gambar
                           </span>
                         </div>
                      )}


                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                          {paket.kategori}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {paket.namaPaket}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {paket.deskripsi}
                      </p>

                      {/* Duration */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{paket.durasiHari} Hari</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-primary">
                            Rp {paket.harga.toLocaleString('id-ID')}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/paket</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <Button
                        onClick={() => handleLihatDetail(paket.paketId)}
                        className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                        variant="ocean"
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && !error && filteredPackages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">Tidak Ada Paket Ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba gunakan kata kunci atau filter yang berbeda
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterKategori('all');
                    setSortBy('popular');
                  }}
                  variant="ocean"
                >
                  Reset Filter
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer baru */}
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