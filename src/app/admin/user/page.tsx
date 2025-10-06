"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

// =====================
// Types
// =====================
export interface Meta {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface UserRow {
  createdAt: string; // Date ISO dari backend
  updatedAt: string; // Date ISO dari backend
  userId: number;
  alamat: string;
  username: string;
  email: string;
  password: string; // JANGAN ditampilkan ke UI
  namaLengkap: string;
  tanggalLahir: string; // Date ISO
  noHp: string;
  fotoProfil: string | null;
  statusAktif: boolean;
}

export interface UsersResponseDirect extends Array<UserRow> {}
export interface UsersResponseWrapped {
  data: UserRow[];
  page?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
}

// =====================
// Util
// =====================
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
  const masked = name.length <= 2 ? "*".repeat(name.length) : name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
  return `${masked}@${domain}`;
}

// =====================
// Table Component (Layout mirip PaketWisataTable)
// =====================
interface UserTableProps {
  users: UserRow[];
  meta: Meta;
  onEdit: (user: UserRow) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: "aktif" | "non_aktif"; search?: string }) => void;
  currentFilters: { status?: "aktif" | "non_aktif"; search?: string };
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  meta,
  onEdit,
  onDelete,
  onToggleActive,
  onPageChange,
  onFilterChange,
  currentFilters,
}) => {
  const router = useRouter();

  // Debounced search
  const [searchText, setSearchText] = useState(currentFilters.search || "");
  useEffect(() => {
    const t = setTimeout(() => {
      onFilterChange({ ...currentFilters, search: searchText || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Pengguna</h2>
        <div className="flex space-x-2">
          <select
            name="status"
            value={currentFilters.status || ""}
            onChange={(e) =>
              onFilterChange({ ...currentFilters, status: (e.target.value || undefined) as any })
            }
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="non_aktif">Non Aktif</option>
          </select>
          <input
            type="text"
            name="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Cari nama / email / username ..."
            className="border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Tidak ada pengguna ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="py-3 px-4 border-b">ID</th>
                <th className="py-3 px-4 border-b">Profil</th>
                <th className="py-3 px-4 border-b">Nama</th>
                <th className="py-3 px-4 border-b">Username</th>
                <th className="py-3 px-4 border-b">Email</th>
                <th className="py-3 px-4 border-b">No. HP</th>
                <th className="py-3 px-4 border-b">Alamat</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Bergabung</th>
                <th className="py-3 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-gray-50 text-sm text-gray-800">
                  <td className="py-3 px-4 border-b">{u.userId}</td>
                  <td className="py-3 px-4 border-b">
                    {u.fotoProfil ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.fotoProfil}
                        alt={u.namaLengkap}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {u.namaLengkap?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b whitespace-nowrap">{u.namaLengkap}</td>
                  <td className="py-3 px-4 border-b">{u.username}</td>
                  <td className="py-3 px-4 border-b">{maskEmail(u.email)}</td>
                  <td className="py-3 px-4 border-b">{u.noHp || "-"}</td>
                  <td className="py-3 px-4 border-b max-w-[240px] truncate" title={u.alamat}>
                    {u.alamat || "-"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        u.statusAktif
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.statusAktif ? "aktif" : "non_aktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2 items-center">
                      {/* contoh: upload foto profil */}
                      <button
                        onClick={() => router.push(`/admin/users/${u.userId}/upload-foto`)}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-100 transition duration-150"
                        title="Upload Foto"
                      >
                        <UploadCloud className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => onEdit(u)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l4 4m-4-4l-9 9V18h4l9-9c1.66-1.66 1.66-4.37 0-6.03l-.12-.12a4.243 4.243 0 00-6.03 0z"
                          ></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => onToggleActive(u.userId, !u.statusAktif)}
                        className={`text-sm rounded-full w-5 h-5 flex items-center justify-center ${
                          u.statusAktif
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        title={u.statusAktif ? "Non-aktifkan" : "Aktifkan"}
                      >
                        {u.statusAktif ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => onDelete(u.userId)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: meta.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 rounded-md ${
                meta.page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// =====================
// Page: /admin/users
// =====================
const AdminUsersPage: React.FC = () => {
  const router = useRouter();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, totalPages: 1, pageSize: 10, totalItems: 0 });
  const [filters, setFilters] = useState<{ status?: "aktif" | "non_aktif"; search?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("token") : null), []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(meta.pageSize));
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);

      const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Autentikasi gagal: silakan login kembali.");
          router.push("/login");
          return;
        }
        if (res.status === 403) {
          setError("Akses ditolak.");
          router.push("/");
          return;
        }
        throw new Error(`Users fetch failed ${res.status}`);
      }

      const json: UsersResponseDirect | UsersResponseWrapped = await res.json();
      const data: UserRow[] = Array.isArray(json) ? json : json.data ?? [];

      // Jika backend belum support pagination, hitung manual di FE (fallback)
      if (Array.isArray(json)) {
        const totalItems = data.length;
        const start = (page - 1) * meta.pageSize;
        const end = start + meta.pageSize;
        setUsers(data.slice(start, end));
        setMeta({ page, pageSize: meta.pageSize, totalPages: Math.max(1, Math.ceil(totalItems / meta.pageSize)), totalItems });
      } else {
        setUsers(data);
        setMeta({
          page: json.page ?? page,
          totalPages: json.totalPages ?? 1,
          pageSize: json.pageSize ?? meta.pageSize,
          totalItems: json.totalItems ?? data.length,
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Gagal memuat pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(meta.page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handlers
  const handleEdit = (user: UserRow) => {
    router.push(`/admin/users/${user.userId}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus user ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
      await fetchUsers(meta.page);
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus user");
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    try {
      // Sesuaikan endpoint backend kamu. Contoh umum:
      // PATCH /users/:id/status  { statusAktif: boolean }
      const res = await fetch(`${API_BASE}/users/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ statusAktif: next }),
      });

      if (!res.ok) {
        // fallback: PUT /users/:id (update umum)
        const res2 = await fetch(`${API_BASE}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ statusAktif: next }),
        });
        if (!res2.ok) throw new Error("Gagal mengubah status pengguna");
      }
      await fetchUsers(meta.page);
    } catch (e: any) {
      alert(e?.message || "Gagal mengubah status pengguna");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    setMeta((m) => ({ ...m, page }));
    fetchUsers(page);
  };

  const handleFilterChange = (f: { status?: "aktif" | "non_aktif"; search?: string }) => {
    setMeta((m) => ({ ...m, page: 1 }));
    setFilters(f);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Memuat data pengguna...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-4">
        <p className="text-xl font-semibold mb-4">Terjadi Kesalahan!</p>
        <p className="text-lg text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <UserTable
        users={users}
        meta={meta}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onPageChange={handlePageChange}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />
    </div>
  );
};

export default AdminUsersPage;
