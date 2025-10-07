"use client";

import { useEffect, useState } from "react";

interface DetailRute {
  ruteId: number;
  urutanKe: number;
  namaDestinasi: string;
  alamatDestinasi: string;
  jarakDariSebelumnyaKm: number;
  estimasiWaktuTempuh: string;
  waktuKunjunganMenit: number;
  deskripsiSingkat: string;
  paketLuarKotaId: number;
}

export default function DetailRutePage() {
  const [ruteList, setRuteList] = useState<DetailRute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRute = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/detail-rute/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Gagal memuat detail rute");

        const json = await res.json();
        setRuteList(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRute();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Daftar Detail Rute</h1>

      {ruteList.length === 0 ? (
        <p className="text-gray-600">Belum ada data rute tersedia.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {ruteList.map((rute) => (
            <div
              key={rute.ruteId}
              className="bg-white border shadow-sm rounded-xl p-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {rute.urutanKe}. {rute.namaDestinasi}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                Alamat: {rute.alamatDestinasi}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Jarak: {rute.jarakDariSebelumnyaKm} km
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Estimasi Waktu Tempuh: {rute.estimasiWaktuTempuh}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Waktu Kunjungan: {rute.waktuKunjunganMenit} menit
              </p>
              <p className="text-sm text-gray-700 italic">
                {rute.deskripsiSingkat}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Paket Luar Kota ID: {rute.paketLuarKotaId}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
