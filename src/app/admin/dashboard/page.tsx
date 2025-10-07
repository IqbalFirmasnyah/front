"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

// =====================
// Types
// =====================
interface DecodedToken {
  sub: number;
  username: string;
  role: string; // 'user' | 'admin' | 'superadmin'
  namaLengkap: string;
  adminRole?: string;
  exp: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  email: string;
}

// Adjust these according to your backend DTOs
interface Booking {
  bookingId?: number | string;
  id?: number | string;
  status?: string;
  createdAt?: string;
  tanggal_layanan?: string;
  // ...other fields
}

interface Refund {
  id?: number | string;
  status?: string; // e.g., 'pending' | 'approved' | 'rejected'
  createdAt?: string;
}

interface UserRow {
  id_user?: number | string;
  created_at?: string;
  role?: string; // if available
}

// =====================
// Helpers
// =====================


function toMonthKey(dateStr?: string) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Unknown";
  // e.g., "2025-01"
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  if (key === "Unknown") return key;
  const [y, m] = key.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const idx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${monthNames[idx]} ${y}`;
}

function lastNMonthKeys(n: number) {
  const now = new Date();
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function sumByMonth<T>(rows: T[], getDate: (r: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = toMonthKey(getDate(r));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map; // Map<YYYY-MM, count>
}

function ensureMonths(map: Map<string, number>, months: string[]) {
  const result: { monthKey: string; label: string; value: number }[] = [];
  for (const m of months) {
    result.push({ monthKey: m, label: monthLabel(m), value: map.get(m) ?? 0 });
  }
  return result;
}

// Pie helpers for roles/status buckets
function bucketCounts<T>(rows: T[], getKey: (r: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = (getKey(r) ?? "unknown").toLowerCase();
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

const PIE_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#ff8042",
  "#d88884",
  "#84d8c6",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [dashboardData, setDashboardData] = useState<
    { message: string; user: DecodedToken } | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // raw datasets
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  // =====================
  // Fetch dashboard + datasets
  // =====================
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Anda belum login atau sesi telah berakhir.");
          router.push("/login");
          return;
        }

        // decode & expiry check
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            setError("Sesi Anda telah berakhir. Silakan login kembali.");
            router.push("/login");
            return;
          }
        } catch (e) {
          console.error("Error decoding token", e);
          localStorage.removeItem("token");
          setError("Token tidak valid. Silakan login kembali.");
          router.push("/login");
          return;
        }

        // 1) Admin dashboard identity
        const dashRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dashRes.ok) {
          if (dashRes.status === 403) {
            setError("Akses Ditolak: Anda tidak memiliki hak akses yang memadai.");
            router.push("/");
            return;
          }
          if (dashRes.status === 401) {
            setError("Autentikasi gagal: Token tidak valid atau kedaluwarsa.");
            router.push("/login");
            return;
          }
          throw new Error(`Dashboard error ${dashRes.status}`);
        }
        const dashJson = await dashRes.json();
        setDashboardData(dashJson);

        // 2) Datasets (adjust paths IF your controllers use different prefixes)
        const [bookingsRes, refundsRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }, // if user list is public to admin only
          }),
        ]);

        // Bookings
        if (bookingsRes.ok) {
          const bj = await bookingsRes.json();
          // shape A: { statusCode, message, data: [...] }
          // shape B: [ ... ]
          const arr: Booking[] = Array.isArray(bj) ? bj : bj?.data ?? [];
          setBookings(arr);
        } else {
          console.warn("/bookings failed", bookingsRes.status);
        }

        // Refunds
        if (refundsRes.ok) {
          const rj = await refundsRes.json();
          const arr: Refund[] = Array.isArray(rj) ? rj : rj?.data ?? [];
          setRefunds(arr);
        } else {
          console.warn("/refunds failed", refundsRes.status);
        }

        // Users
        if (usersRes.ok) {
          const uj = await usersRes.json();
          const arr: UserRow[] = Array.isArray(uj) ? uj : uj?.data ?? uj ?? [];
          setUsers(arr);
        } else {
          console.warn("/users failed", usersRes.status);
        }
      } catch (err: any) {
        console.error("Fetch error:", err?.message || err);
        if (!error) setError("Terjadi kesalahan jaringan atau server tidak merespons.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router, pathname]);

  // =====================
  // Derived chart data
  // =====================
  const monthKeys = useMemo(() => lastNMonthKeys(6), []); // last 6 months

  const bookingSeries = useMemo(() => {
    const map = sumByMonth(bookings, (b) => b.createdAt || b.tanggal_layanan);
    return ensureMonths(map, monthKeys).map((x) => ({ month: x.label, bookings: x.value }));
  }, [bookings, monthKeys]);

  const refundSeries = useMemo(() => {
    const map = sumByMonth(refunds, (r) => r.createdAt);
    return ensureMonths(map, monthKeys).map((x) => ({ month: x.label, refunds: x.value }));
  }, [refunds, monthKeys]);

  const userSeries = useMemo(() => {
    const map = sumByMonth(users, (u) => u.created_at);
    return ensureMonths(map, monthKeys).map((x) => ({ month: x.label, users: x.value }));
  }, [users, monthKeys]);

  const refundBuckets = useMemo(() => bucketCounts(refunds, (r) => r.status), [refunds]);
  const userRoleBuckets = useMemo(
    () => bucketCounts(users, (u) => (u as any)?.role),
    [users]
  );

  const totals = useMemo(
    () => ({ bookings: bookings.length, refunds: refunds.length, users: users.length }),
    [bookings.length, refunds.length, users.length]
  );

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Report Booking", href: "/admin/report/bookings" },
    { name: "Report Refuns", href: "/admin/report/refund" },
    { name: "Paket Wisata", href: "/admin/paket-wisata" },
    { name: "Fasilitas", href: "/admin/fasilitas" },
    { name: "Supir", href: "/admin/supir" },
    { name: "Armada", href: "/admin/armada" },
    { name: "Booking", href: "/admin/booking" },
    { name: "Pengguna", href: "/admin/user" },
    { name: "Refund", href: "/admin/refund" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Memuat dashboard admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-4">
        <p className="text-xl font-semibold mb-4">Terjadi Kesalahan!</p>
        <p className="text-lg text-center">{error}</p>
        {error.includes("login") && (
          <button
            onClick={() => router.push("/login")}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Kembali ke Login
          </button>
        )}
        {error.includes("Akses Ditolak") && (
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Kembali ke Beranda
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold text-orange-400 mb-8 text-center">Admin Panel</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`block py-2 px-4 rounded-lg transition duration-200 ${
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
            {dashboardData?.user.namaLengkap || "Admin"}
          </p>
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Utama</h1>
        </header>

        {/* Greeting */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md">
            <p className="text-blue-800 text-lg">{dashboardData?.message}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Booking</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.bookings}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total Refund</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.refunds}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">Total User</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.users}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings over time */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="bookings" stroke="#8884d8" fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Refunds by month */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Refund per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={refundSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="refunds" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Users by month */}
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Baru per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#82ca9d" fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Buckets: refund status & user roles */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Komposisi Status Refund</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={refundBuckets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {refundBuckets.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Komposisi Role User</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie data={userRoleBuckets} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {userRoleBuckets.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
            <ul className="space-y-2">
              <li>
                <a href="/admin/users" className="text-blue-600 hover:underline">
                  Kelola Pengguna
                </a>
              </li>
              <li>
                <a href="/admin/payments" className="text-blue-600 hover:underline">
                  Verifikasi Pembayaran
                </a>
              </li>
              <li>
                <a href="/admin/reports" className="text-blue-600 hover:underline">
                  Lihat Laporan
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}