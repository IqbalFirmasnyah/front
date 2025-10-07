"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plane, Clock } from 'lucide-react';
import Header from "../components/Header";
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { convertPackageImageUrl } from "@/lib/helper/image_url";


type PaketLuarKota = {
  paketLuarKotaId: number;
  namaPaket: string;
  lokasi: string;
  deskripsi: string;
  hargaEstimasi: number | null;
  // fotoPaket: string | null; // Properti ini mungkin usang jika 'images' digunakan
  fotoPaketWisata: string[]
  statusPaket: string;
};

export default function PaketWisataLuarPage() {
  const [paketList, setPaketList] = useState<PaketLuarKota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formatRupiah = (value: number | null | undefined) =>
    value != null ? `Rp ${value.toLocaleString("id-ID")}` : "Harga tidak tersedia";

  useEffect(() => {
    const fetchPaketLuar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token tidak ditemukan. Harap login ulang.");
        }

        // Endpoint: ${process.env.NEXT_PUBLIC_API_URL}/paket-wisata-luar/active
        const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/paket-wisata-luar-kota/all", { // Menggunakan endpoint 'all' yang ada di controller
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
            const errorData = await res.json();
            if (res.status === 401) {
                localStorage.removeItem("token");
                router.push("/login");
                throw new Error("Sesi berakhir, silakan login kembali.");
            }
            throw new Error(errorData.message || "Gagal mengambil data paket luar kota.");
        }

        const json = await res.json();
        // Asumsi data berada di json.data
        setPaketList(json.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaketLuar();
  }, [router]);

  if (loading) return <p className="p-4 text-center text-gray-700">Memuat data paket luar kota...</p>;
  if (error) return <p className="p-4 text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-blue-500 to-cyan-500 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Paket Wisata Luar Kota
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Petualangan tak terbatas di luar kota
            </p>
          </div>
        </section>
        
        {/* Packages Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paketList.length === 0 ? (
                <div className="md:col-span-full lg:col-span-full text-center py-16">
                  <div className="text-6xl mb-4">✈️</div>
                  <h3 className="text-2xl font-bold mb-2">Belum ada paket wisata luar kota yang tersedia.</h3>
                  <p className="text-muted-foreground">Kembali lagi nanti untuk melihat penawaran terbaru!</p>
                </div>
              ) : (
                paketList.map((paket) => {
                  // Ambil nama file gambar pertama
                  const firstImage = paket.fotoPaketWisata?.[0];
                  // Konversi ke URL
                  const imageUrl = firstImage ? convertPackageImageUrl(firstImage) : null;
                  
                  return (
                    <div
                      key={paket.paketLuarKotaId}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        {imageUrl ? (
                          <img
                            src={imageUrl} // Menggunakan URL yang sudah dikonversi
                            alt={paket.namaPaket}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                            <Plane className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge
                            className={`${
                              paket.statusPaket === 'Aktif'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {paket.statusPaket}
                          </Badge>
                        </div>

                        {/* Location Badge */}
                        <div className="absolute bottom-4 right-4">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            {paket.lokasi}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {paket.namaPaket}
                        </h2>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary">
                            {formatRupiah(paket.hargaEstimasi)}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">/paket</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {paket.deskripsi}
                        </p>

                        {/* View Details Button */}
                        <Button
                          onClick={() =>
                            router.push(`/paket-wisata-luar/${paket.paketLuarKotaId}`)
                          }
                          className="w-full mt-4"
                          variant="ocean"
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jelajah Tour & Travel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}