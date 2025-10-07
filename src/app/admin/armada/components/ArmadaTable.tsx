// app/admin/armada/components/ArmadaTable.tsx
"use client";

import React, { useRef } from "react";
import { Armada, Meta, StatusArmada } from "../../types/Armada";
import {
  Search,
  Filter,
  SquarePen,
  Trash2,
  CheckCircle2,
  Car,
  Wrench,
  Users,
  Calendar,
  Hash,
  Barcode,
  Upload,
  CarFront,
} from "lucide-react";

interface ArmadaTableProps {
  armadas: Armada[];
  meta: Meta;
  onEdit: (armada: Armada) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: StatusArmada; search?: string }) => void;
  currentFilters: { status?: StatusArmada; search?: string };
  onUploadImage: (armada: Armada) => void;
}

const ArmadaTable: React.FC<ArmadaTableProps> = ({
  armadas,
  meta,
  onEdit,
  onDelete,
  onPageChange,
  onFilterChange,
  currentFilters,
  onUploadImage,
}) => {
  // Debounce search yang benar (clear timer sebelumnya)
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

  const renderStatus = (status: StatusArmada | string) => {
    const s = String(status).toLowerCase();
    if (s === "tersedia") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Tersedia
        </span>
      );
    }
    if (s === "digunakan") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
          <Car className="h-3.5 w-3.5" />
          Digunakan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <Wrench className="h-3.5 w-3.5" />
        Maintenance
      </span>
    );
  };

  const IconButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "red" }
  > = ({ tone = "blue", className = "", children, ...props }) => {
    const toneClass =
      tone === "blue"
        ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus-visible:outline-blue-600"
        : "text-red-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-red-600";
    return (
      <button
        {...props}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneClass} ${className}`}
      >
        {children}
      </button>
    );
  };

  const SubtleButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  > = ({ className = "", children, ...props }) => {
    return (
      <button
        {...props}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${className}`}
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
            <CarFront className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Daftar Armada</h2>
            <p className="text-xs text-zinc-500">
              Kelola data armada, status penggunaan, dan media kendaraan.
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
              placeholder="Cari jenis/merk/plat…"
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="status"
              value={currentFilters.status || ""}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pl-9 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-48"
            >
              <option value="">Semua Status</option>
              <option value="tersedia">Tersedia</option>
              <option value="digunakan">Digunakan</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {armadas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada armada ditemukan.</p>
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
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Jenis Mobil
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Merk
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    Plat Nomor
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Kapasitas
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tahun
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
              {armadas.map((armada, idx) => (
                <tr
                  key={armada.armadaId}
                  className={`
                    text-sm text-zinc-800 transition-colors
                    ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}
                    hover:bg-blue-50/40
                  `}
                >
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {armada.armadaId}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                        <Car className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{armada.jenisMobil}</span>
                    </div>
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {armada.merkMobil}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {armada.platNomor}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {armada.kapasitas}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {armada.tahunKendaraan}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {renderStatus(armada.statusArmada)}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <IconButton
                        tone="blue"
                        onClick={() => onEdit(armada)}
                        title="Edit armada"
                        aria-label={`Edit armada ${armada.platNomor}`}
                      >
                        <SquarePen className="h-5 w-5" />
                      </IconButton>
                      <IconButton
                        tone="red"
                        onClick={() => onDelete(armada.armadaId)}
                        title="Hapus armada"
                        aria-label={`Hapus armada ${armada.platNomor}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </IconButton>
                      <SubtleButton
                        onClick={() => onUploadImage(armada)}
                        title="Unggah foto armada"
                        aria-label={`Unggah foto armada ${armada.platNomor}`}
                        className="ml-1"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </SubtleButton>
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

export default ArmadaTable;
