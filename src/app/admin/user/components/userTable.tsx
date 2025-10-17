// app/admin/user/components/UserTable.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Filter,
  Hash,
  AtSign,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Trash2,
  CheckCircle2,
  CircleSlash,
} from "lucide-react";
import type { Meta, UserRow } from "../page";


function formatDate(d: string) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  const masked =
    name.length <= 2
      ? "*".repeat(name.length)
      : name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  return `${masked}@${domain}`;
}

const StatusBadge: React.FC<{ aktif: boolean }> = ({ aktif }) => {
  return aktif ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Aktif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
      <CircleSlash className="h-3.5 w-3.5" />
      Non Aktif
    </span>
  );
};

interface UserTableProps {
  users: UserRow[];
  meta: Meta;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: {
    status?: "aktif" | "non_aktif";
    search?: string;
  }) => void;
  currentFilters: { status?: "aktif" | "non_aktif"; search?: string };
}


const UserTable: React.FC<UserTableProps> = ({
  users,
  meta,
  onDelete,
  onPageChange,
  onFilterChange,
  currentFilters,
}) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [searchText, setSearchText] = useState(currentFilters.search || "");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...currentFilters, search: searchText || undefined });
    }, 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <div className="mx-auto max-w-screen-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header + Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Daftar Pengguna</h2>
          <p className="text-xs text-zinc-500">Kelola akun, status aktif, dan informasi kontak.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              name="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Cari nama / email / username…"
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
            />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="status"
              value={currentFilters.status || ""}
              onChange={(e) =>
                onFilterChange({
                  ...currentFilters,
                  status: (e.target.value || undefined) as any,
                })
              }
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
      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0">
            {/* Kontrol lebar kolom agar rapi */}
            <colgroup>
              <col className="w-14" /> {/* ID */}
              <col className="w-44 sm:w-48" /> {/* Nama */}
              <col className="hidden sm:table-column sm:w-40" /> {/* Username */}
              <col className="w-48 sm:w-56" /> {/* Email */}
              <col className="hidden md:table-column md:w-36" /> {/* No HP */}
              <col className="hidden lg:table-column" /> {/* Alamat */}
              <col className="w-28" /> {/* Status */}
              <col className="hidden md:table-column md:w-36" /> {/* Bergabung */}
              <col className="w-20" /> {/* Aksi */}
            </colgroup>

            <thead>
              <tr className="text-left text-[13px] font-semibold text-zinc-600">
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Nama
                </th>
                <th className="sticky top-0 z-10 hidden bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur sm:table-cell">
                  Username
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4" />
                    Email
                  </div>
                </th>
                <th className="sticky top-0 z-10 hidden bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur md:table-cell">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    No. HP
                  </div>
                </th>
                <th className="sticky top-0 z-10 hidden bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur lg:table-cell">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Status
                </th>
                <th className="sticky top-0 z-10 hidden bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur md:table-cell">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Bergabung
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur text-center">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u.userId}
                  className={`text-sm text-zinc-800 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                  } hover:bg-blue-50/40`}
                >
                  <td className="border-t border-zinc-200 px-3 py-3">{u.userId}</td>

                  <td className="border-t border-zinc-200 px-3 py-3 whitespace-nowrap font-medium truncate">
                    {u.namaLengkap}
                  </td>

                  <td className="border-t border-zinc-200 px-3 py-3 hidden sm:table-cell truncate">
                    {u.username}
                  </td>

                  <td className="border-t border-zinc-200 px-3 py-3 truncate" title={u.email}>
                    {maskEmail(u.email)}
                  </td>

                  <td className="border-t border-zinc-200 px-3 py-3 hidden md:table-cell truncate">
                    {u.noHp || "-"}
                  </td>

                  <td
                    className="border-t border-zinc-200 px-3 py-3 hidden lg:table-cell truncate"
                    title={u.alamat}
                  >
                    {u.alamat || "-"}
                  </td>

                  <td className="border-t border-zinc-200 px-3 py-3">
                    <StatusBadge aktif={u.statusAktif} />
                  </td>

                  <td className="border-t border-zinc-200 px-3 py-3 hidden md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>

                  
                  <td className="border-t border-zinc-200 px-3 py-3">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onDelete(u.userId)}
                        title="Hapus pengguna"
                        aria-label={`Hapus pengguna ${u.namaLengkap}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg 
                                   text-red-600 hover:text-red-700 hover:bg-red-50 
                                   focus-visible:outline focus-visible:outline-2 
                                   focus-visible:outline-offset-2 focus-visible:outline-red-600
                                   transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, meta.page - 1))}
            disabled={meta.page === 1}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: meta.totalPages }).map((_, i) => (
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
            onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))}
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

export default UserTable;
