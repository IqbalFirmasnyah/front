// app/admin/user/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import UserTable from "./components/userTable";

export interface Meta {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface UserRow {
  createdAt: string;
  updatedAt: string;
  userId: number;
  alamat: string;
  username: string;
  email: string;
  password: string; // JANGAN ditampilkan
  namaLengkap: string;
  tanggalLahir: string;
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

// JWT payload (menyesuaikan dengan punyamu)
interface DecodedToken {
  sub: number;
  username: string;
  role: string; // 'user' | 'admin' | 'superadmin'
  namaLengkap: string;
  adminRole?: string;
  exp: number; // unix (detik)
}

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();

  // ---- Auth state
  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // ---- Data state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });
  const [filters, setFilters] = useState<{
    status?: "aktif" | "non_aktif";
    search?: string;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("token") : null),
    []
  );

  // ---- Auth check (mirip Supir page)
  useEffect(() => {
    const checkAuth = () => {
      setAuthLoading(true);
      setAuthError(null);
      const t = localStorage.getItem("token");
      if (!t) {
        setAuthError("Anda belum login atau sesi telah berakhir.");
        router.push("/login");
        setAuthLoading(false);
        return;
      }
      try {
        const decoded: DecodedToken = jwtDecode(t);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setAuthError("Sesi Anda telah berakhir. Silakan login kembali.");
          router.push("/login");
          setAuthLoading(false);
          return;
        }
        setLoggedInUser(decoded);
      } catch (e) {
        localStorage.removeItem("token");
        setAuthError("Token tidak valid. Silakan login kembali.");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // ---- Fetch users
  const fetchUsers = useCallback(
    async (page = 1) => {
      if (authLoading || authError || !loggedInUser) return;

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(meta.pageSize));
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

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

        if (Array.isArray(json)) {
          // backend belum support pagination → FE fallback
          const totalItems = data.length;
          const start = (page - 1) * meta.pageSize;
          const end = start + meta.pageSize;
          setUsers(data.slice(start, end));
          setMeta({
            page,
            pageSize: meta.pageSize,
            totalPages: Math.max(1, Math.ceil(totalItems / meta.pageSize)),
            totalItems,
          });
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
    },
    [authLoading, authError, loggedInUser, filters, meta.pageSize, router, token]
  );

  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) {
      fetchUsers(meta.page);
    }
  }, [fetchUsers, authLoading, authError, loggedInUser, meta.page]);

  // ---- Handlers
  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    setMeta((m) => ({ ...m, page }));
  };

  const handleFilterChange = (f: {
    status?: "aktif" | "non_aktif";
    search?: string;
  }) => {
    setMeta((m) => ({ ...m, page: 1 }));
    setFilters(f);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus user ini?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error(`Delete failed ${res.status}`);
      await fetchUsers(meta.page);
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus user");
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // ---- UI guard
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Memuat sesi admin...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-4">
        <p className="text-xl font-semibold mb-4">Akses Ditolak!</p>
        <p className="text-lg text-center">{authError}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  // ---- Page layout (selaras dengan Supir page)
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold text-orange-400 mb-8 text-center">
          Admin Panel
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {[
              { name: "Dashboard", href: "/admin/dashboard" },
              { name: "Report Booking", href: "/admin/report/bookings" },
              { name: "Report Refuns", href: "/admin/report/refund" },
              { name: "Paket Wisata", href: "/admin/paket-wisata" },
              { name: "Fasilitas", href: "/admin/fasilitas" },
              { name: "Supir", href: "/admin/supir" },
              { name: "Armada", href: "/admin/armada" },
              { name: "Booking", href: "/admin/booking" },
              { name: "Pengguna", href: "/admin/user" }, // halaman aktif
              { name: "Refund", href: "/admin/refund" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`block py-2 px-4 rounded-lg transition ${
                    pathname === link.href
                      ? "bg-orange-500 text-white shadow-md"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Logged in as:</p>
          <p className="font-semibold text-orange-400">
            {loggedInUser?.namaLengkap || "Admin"}
          </p>
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
          {/* (Optional) tombol tambah user bisa diarahkan ke page create */}
          <a
            href="/admin/users/create"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Tambah Pengguna
          </a>
        </header>

        {loading && !users.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-700">Memuat data pengguna...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <UserTable
            users={users}
            meta={meta}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        )}
      </main>
    </div>
  );
}
