// app/admin/paket-wisata/components/PaketWisataTable.tsx
"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  UploadCloud,
  Hash,
  Tag,
  MapPin,
  Banknote,
  Clock,
  CheckCircle2,
  CircleSlash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PaketWisata, Meta, KategoriPaket, StatusPaket } from "../../types/PaketWisata";

interface PaketWisataTableProps {
  pakets: PaketWisata[];
  meta: Meta;
  onEdit: (paket: PaketWisata) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: StatusPaket) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: {
    kategori?: KategoriPaket;
    status?: StatusPaket;
    search?: string;
  }) => void;
  currentFilters: { kategori?: KategoriPaket; status?: StatusPaket; search?: string };
}

const PaketWisataTable: React.FC<PaketWisataTableProps> = ({
  pakets,
  meta,
  onEdit,
  onDelete,
  onUpdateStatus,
  onPageChange,
  onFilterChange,
  currentFilters,
}) => {
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({
      ...currentFilters,
      [name]: value === "" ? undefined : (value as any),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({
        ...currentFilters,
        search: value === "" ? undefined : value,
      });
    }, 350);
  };

  const handleUploadClick = (paketId: number) => {
    router.push(`/admin/paket-wisata/upload/${paketId}`);
  };

  const renderKategori = (kategori: KategoriPaket | string) => {
    const k = String(kategori).toLowerCase();
    if (k === "dalam kota") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
          <Tag className="h-3.5 w-3.5" />
          Dalam Kota
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
        <Tag className="h-3.5 w-3.5" />
        Luar Kota
      </span>
    );
  };

  const renderStatus = (status: StatusPaket | string) => {
    const s = String(status).toLowerCase();
    if (s === "aktif") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
        <CircleSlash className="h-3.5 w-3.5" />
        Non Aktif
      </span>
    );
  };

  const IconButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "red" | "indigo" | "zinc" }
  > = ({ tone = "blue", className = "", children, ...props }) => {
    const toneMap = {
      blue:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus-visible:outline-blue-600",
      red:
        "text-red-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-red-600",
      indigo:
        "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus-visible:outline-indigo-600",
      zinc:
        "text-zinc-600 hover:text-zinc-700 hover:bg-zinc-50 focus-visible:outline-zinc-600",
    } as const;
    return (
      <button
        {...props}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneMap[tone]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header + Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Daftar Paket Wisata</h2>
            <p className="text-xs text-zinc-500">
              Kelola paket, harga, durasi, dan status publikasi.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              name="search"
              defaultValue={currentFilters.search || ""}
              onChange={handleSearchChange}
              placeholder="Cari nama/lokasi…"
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="kategori"
              value={currentFilters.kategori || ""}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pl-9 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-48"
            >
              <option value="">Semua Kategori</option>
              <option value="dalam kota">Dalam Kota</option>
              <option value="luar kota">Luar Kota</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="status"
              value={currentFilters.status || ""}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pl-9 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-44"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="non_aktif">Non Aktif</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {pakets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada paket wisata ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[13px] font-semibold text-zinc-600">
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Nama Paket
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Kategori
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lokasi
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Harga
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Durasi
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {pakets.map((paket, idx) => (
                <tr
                  key={paket.paketId}
                  className={`
                    text-sm text-zinc-800 transition-colors
                    ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}
                    hover:bg-blue-50/40
                  `}
                >
                  <td className="border-t border-zinc-200 px-4 py-3">{paket.paketId}</td>
                  <td className="border-t border-zinc-200 px-4 py-3 font-medium">
                    {paket.namaPaket}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {renderKategori(paket.kategori)}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">{paket.lokasi}</td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    Rp {paket.harga.toLocaleString("id-ID")}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {paket.durasiHari} Hari
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {renderStatus(paket.statusPaket)}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Upload gambar */}
                      <IconButton
                        tone="indigo"
                        onClick={() => handleUploadClick(paket.paketId)}
                        title="Upload gambar paket"
                        aria-label={`Upload gambar paket ${paket.namaPaket}`}
                      >
                        <UploadCloud className="h-5 w-5" />
                      </IconButton>

                      {/* Edit */}
                      <IconButton
                        tone="blue"
                        onClick={() => onEdit(paket)}
                        title="Edit paket"
                        aria-label={`Edit paket ${paket.namaPaket}`}
                      >
                        <Edit className="h-5 w-5" />
                      </IconButton>

                      {/* Toggle status */}
                      <IconButton
                        tone="zinc"
                        onClick={() =>
                          onUpdateStatus(
                            paket.paketId,
                            paket.statusPaket === "aktif" ? "non_aktif" : "aktif"
                          )
                        }
                        title={paket.statusPaket === "aktif" ? "Non-aktifkan" : "Aktifkan"}
                        aria-label={`Ubah status paket ${paket.namaPaket}`}
                      >
                        {paket.statusPaket === "aktif" ? (
                          <ToggleLeft className="h-5 w-5" />
                        ) : (
                          <ToggleRight className="h-5 w-5" />
                        )}
                      </IconButton>

                      {/* Hapus */}
                      <IconButton
                        tone="red"
                        onClick={() => onDelete(paket.paketId)}
                        title="Hapus paket"
                        aria-label={`Hapus paket ${paket.namaPaket}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, meta.page - 1))}
            disabled={meta.page === 1}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(meta.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`rounded-xl px-3 py-1.5 text-sm ${
                meta.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-50 border border-zinc-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              onPageChange(Math.min(meta.totalPages, meta.page + 1))
            }
            disabled={meta.page === meta.totalPages}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaketWisataTable;
