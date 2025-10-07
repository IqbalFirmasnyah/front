// app/admin/fasilitas/components/FasilitasTable.tsx
"use client";

import React, { useRef } from "react";
import { Fasilitas, Meta, JenisFasilitasEnum } from "../../types/Fasilitas";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  UploadCloud,
  Hash,
  Tag,
  FileText,
  Calendar,
} from "lucide-react";

interface FasilitasTableProps {
  fasilitas: Fasilitas[];
  meta: Meta;
  onEdit: (fasilitas: Fasilitas) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { jenis?: string; search?: string }) => void;
  currentFilters: { jenis?: string; search?: string };
  onUploadImage: (fasilitas: Fasilitas) => void;
}

const FasilitasTable: React.FC<FasilitasTableProps> = ({
  fasilitas,
  meta,
  onEdit,
  onDelete,
  onPageChange,
  onFilterChange,
  currentFilters,
  onUploadImage,
}) => {
  // Debounce search (clear timer sebelumnya)
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({
      ...currentFilters,
      [name]: value === "" ? undefined : value,
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

  const renderJenisBadge = (jenis: JenisFasilitasEnum) => {
    switch (jenis) {
      case JenisFasilitasEnum.PAKET_LUAR_KOTA:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
            <Tag className="h-3.5 w-3.5" />
            Paket Wisata Luar Kota
          </span>
        );
      case JenisFasilitasEnum.CUSTOM:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-200">
            <Tag className="h-3.5 w-3.5" />
            Custom
          </span>
        );
      case JenisFasilitasEnum.DROPOFF:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <Tag className="h-3.5 w-3.5" />
            Dropoff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
            <Tag className="h-3.5 w-3.5" />
            Lainnya
          </span>
        );
    }
  };

  const IconButton: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "red" | "indigo" }
  > = ({ tone = "blue", className = "", children, ...props }) => {
    const toneMap = {
      blue:
        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus-visible:outline-blue-600",
      red:
        "text-red-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-red-600",
      indigo:
        "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus-visible:outline-indigo-600",
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
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Daftar Fasilitas</h2>
            <p className="text-xs text-zinc-500">
              Kelola jenis fasilitas, deskripsi, dan media terkait.
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
              placeholder="Cari nama/desk…"
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="jenis"
              value={currentFilters.jenis || ""}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pl-9 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-56"
            >
              <option value="">Semua Jenis</option>
              <option value={JenisFasilitasEnum.PAKET_LUAR_KOTA}>
                Paket Wisata Luar Kota
              </option>
              <option value={JenisFasilitasEnum.CUSTOM}>Custom</option>
              <option value={JenisFasilitasEnum.DROPOFF}>Dropoff</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {fasilitas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada fasilitas ditemukan.</p>
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
                  Nama Fasilitas
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Jenis
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Deskripsi
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal Dibuat
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {fasilitas.map((fas, idx) => (
                <tr
                  key={fas.fasilitasId}
                  className={`
                    text-sm text-zinc-800 transition-colors
                    ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}
                    hover:bg-blue-50/40
                  `}
                >
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {fas.fasilitasId}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {fas.namaFasilitas}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {renderJenisBadge(fas.jenisFasilitas)}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    <div className="line-clamp-2 max-w-md text-zinc-700">
                      {fas.deskripsi}
                    </div>
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    {new Date(fas.createdAt).toLocaleDateString()}
                  </td>
                  <td className="border-t border-zinc-200 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <IconButton
                        tone="blue"
                        onClick={() => onEdit(fas)}
                        title="Edit fasilitas"
                        aria-label={`Edit fasilitas ${fas.namaFasilitas}`}
                      >
                        <Edit className="h-5 w-5" />
                      </IconButton>

                      {fas.jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA && (
                        <IconButton
                          tone="indigo"
                          onClick={() => onUploadImage(fas)}
                          title="Unggah gambar paket"
                          aria-label={`Unggah gambar ${fas.namaFasilitas}`}
                        >
                          <UploadCloud className="h-5 w-5" />
                        </IconButton>
                      )}

                      <IconButton
                        tone="red"
                        onClick={() => onDelete(fas.fasilitasId)}
                        title="Hapus fasilitas"
                        aria-label={`Hapus fasilitas ${fas.namaFasilitas}`}
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

export default FasilitasTable;
