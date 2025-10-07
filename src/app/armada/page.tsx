"use client";

import { useEffect, useState } from "react";
import { convertCarImageUrl } from "@/lib/helper/image_url";


type Armada = {
  armadaId: number;
  jenisMobil: string;
  merkMobil: string;
  platNomor: string;
  kapasitas: number;
  tahunKendaraan: number;
  statusArmada: string;
  fotoArmada?: string; // Nama file gambar
};

export default function ArmadaPage() {
  const [armadas, setArmadas] = useState<Armada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArmadas = async () => {
      try {

        const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/armada/all");
        if (!res.ok) throw new Error(`Gagal memuat data: HTTP error ${res.status}`);
        
        const json = await res.json();
        // Asumsi data armada berada di json.data
        setArmadas(json.data || []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data armada. Pastikan backend berjalan.");
      } finally {
        setLoading(false);
      }
    };

    fetchArmadas();
  }, []);

  if (loading) return <p className="p-6 text-center text-gray-700">Memuat data armada...</p>;
  if (error) return <p className="p-6 text-red-600 text-center">{error}</p>;
  if (armadas.length === 0) return <p className="p-6 text-gray-500 text-center">Belum ada armada tersedia.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-2">Daftar Armada Tersedia</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {armadas.map((armada) => (
          <div
            key={armada.armadaId}
            className="border border-gray-200 bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {armada.jenisMobil} - {armada.merkMobil}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  **Plat:** {armada.platNomor}
                </p>
                <p className="text-md mt-2">
                  **Kapasitas:** <span className="font-semibold text-orange-600">{armada.kapasitas}</span> orang
                </p>
                <p className="text-sm">
                  **Tahun:** {armada.tahunKendaraan}
                </p>
                <p
                  className={`text-sm mt-3 font-bold px-3 py-1 rounded-full w-fit ${
                    armada.statusArmada === "tersedia"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  Status: {armada.statusArmada.toUpperCase()}
                </p>
              </div>
              
              {armada.fotoArmada ? (
                // Menggunakan fungsi convertCarImageUrl untuk mendapatkan URL gambar
                <img
                  src={convertCarImageUrl(armada.fotoArmada)}
                  alt={`Foto ${armada.jenisMobil}`}
                  className="w-full max-h-40 md:w-36 md:h-24 mt-4 md:mt-0 object-cover rounded-lg shadow-md border border-gray-100"
                />
              ) : (
                <div className="w-full max-h-40 md:w-36 md:h-24 bg-gray-200 flex items-center justify-center rounded-lg mt-4 md:mt-0 text-gray-500 text-sm">
                    [Image not found]
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}