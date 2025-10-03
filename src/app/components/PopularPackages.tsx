"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PackageCard, { TourPackage } from "@/app/components/PackageCard";

interface Fasilitas {
  fasilitasId: number;
  namaFasilitas: string;
  deskripsi?: string;
  harga?: number;
}

const PopularPackages: React.FC = () => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // --- 1. Cek Status Login ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // --- 2. Handlers Fetch Data (Menggunakan useCallback) ---
  
  // Handler untuk fetch paket wisata (tidak memerlukan token)
  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/paket-wisata/all", {
        cache: "no-store",
      });
      const result = await res.json();

      if (res.ok) {
        setPackages(result.data || []);
      } else {
        console.error("Failed to fetch packages:", result.message);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  }, []);

  // Handler untuk fetch fasilitas (membutuhkan token)
  const fetchFasilitas = useCallback(async (token: string) => {
    try {
      const res = await fetch("http://localhost:3001/fasilitas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengambil data fasilitas.");
      }

      const responseData = await res.json();
      setFasilitasList(responseData.data || []);
    } catch (err: any) {
      console.error("Error fetching fasilitas list:", err);
      setError(err.message || "Terjadi kesalahan saat memuat fasilitas.");
    }
  }, []);
  
  // --- 3. Effect Utama untuk Mengatur Data dan Loading ---
  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    const loadData = async () => {
      // Selalu fetch paket wisata
      const packagePromise = fetchPackages();
      
      let fasilitasPromise: Promise<void> | null = null;
      
      // Hanya fetch fasilitas jika ada token
      if (token) {
        fasilitasPromise = fetchFasilitas(token);
      }
      
      // Tunggu kedua promise (yang fasilitas mungkin null)
      await Promise.all([packagePromise, fasilitasPromise].filter(p => p !== null));

      setLoading(false); 
    };

    loadData();
    // Gunakan [isLoggedIn] di dependency agar data fasilitas di-refresh saat login/logout
  }, [fetchPackages, fetchFasilitas, isLoggedIn]); 

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg">Loading paket wisata & fasilitas...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Pilihan Paket Wisata
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nikmati perjalanan menyenangkan dengan berbagai destinasi terbaik.
          </p>
        </div>

        {/* Grid Paket Wisata */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {packages.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 text-center py-20">
              <div className="text-6xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold mb-2">
                Belum ada paket wisata yang tersedia.
              </h3>
              <p className="text-muted-foreground">
                Kembali lagi nanti untuk melihat penawaran terbaru!
              </p>
            </div>
          ) : (
            packages.map((paket) => (
              <PackageCard
                key={paket.paketId}
                // PackageCard akan menggunakan `pkg.fotoPaket` dan helper URL
                package={paket} 
                hideBookingButton
                onBookNow={(id) => router.push(`/paket-wisata/${id}`)}
              />
            ))
          )}
        </div>

        {/* Tombol lihat semua paket wisata (hanya muncul kalau login) */}
        {isLoggedIn && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/paket-wisata")}
              className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
            >
              Lihat Semua Paket Wisata
            </button>
          </div>
        )}

        {/* Grid Fasilitas */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Fasilitas</h2>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : fasilitasList.length === 0 ? (
            <p className="text-gray-600">
              {isLoggedIn ? "Belum ada fasilitas yang tersedia." : "Login untuk melihat fasilitas tambahan."}
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fasilitasList.map((fasilitas) => (
                <li
                  key={fasilitas.fasilitasId}
                  className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {fasilitas.namaFasilitas}
                  </h3>
                  {fasilitas.deskripsi && (
                    <p className="text-gray-600 mt-2">{fasilitas.deskripsi}</p>
                  )}
                  {fasilitas.harga && (
                    <p className="mt-2 font-bold text-primary">
                      Rp {fasilitas.harga.toLocaleString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Tombol lihat semua fasilitas (hanya muncul kalau login) */}
          {isLoggedIn && (
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push("/fasilitas")}
                className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition"
              >
                Lihat Semua Fasilitas
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularPackages;