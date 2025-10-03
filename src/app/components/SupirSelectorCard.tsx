"use client";

import SupirCard from "./SupirCard";

export type Supir = {
  supirId: number;
  nama: string;
  alamat: string;
  nomorHp: string;
  nomorSim: string;
  fotoSupir: string | null;
  pengalamanTahun: number;
  ratingRata: number | null;
  statusSupir: string;
};

interface Props {
  selectedSupirId?: number;
  onSelect: (id: number | undefined) => void;
  supirOptions: Supir[];
  loading?: boolean;
}

export default function SupirSelectorCard({ selectedSupirId, onSelect, supirOptions, loading }: Props) {
  if (loading) return <p>Memuat daftar supir...</p>;
  if (supirOptions.length === 0) return <p>Tidak ada supir tersedia.</p>;

  const handleSupirSelect = (supirId: number) => {
    if (selectedSupirId === supirId) onSelect(undefined);
    else onSelect(supirId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pilih Supir (Opsional)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supirOptions.map((supir) => (
          <div
            key={supir.supirId}
            className={`cursor-pointer border rounded-xl p-2 transition duration-200 ${
              selectedSupirId === supir.supirId
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:shadow-md border-gray-200"
            }`}
            onClick={() => handleSupirSelect(supir.supirId)}
          >
            <SupirCard supir={supir} />
          </div>
        ))}
      </div>
    </div>
  );
}
