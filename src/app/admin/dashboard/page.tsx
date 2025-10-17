"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

/* =====================
   Types
===================== */
interface DecodedToken {
  sub: number;
  username: string;
  role: string;
  namaLengkap: string;
  adminRole?: string;
  exp: number;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  email: string;
  // kalau payload kamu punya 'roles', biarkan TS tidak mengeluh:
  roles?: string[];
}

interface Booking {
  bookingId?: number | string;
  id?: number | string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  tanggal_layanan?: string;
}

interface Refund {
  id?: number | string;
  status?: string;
  createdAt?: string;
  created_at?: string;
}

interface UserRow {
  id_user?: number | string;
  created_at?: string;
  createdAt?: string;
  role?: string;
}

/* =====================
   Helpers tanggal & utils
===================== */
function toMonthKey(dateStr?: string) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  if (key === "Unknown") return key;
  const [y, m] = key.split("-");
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
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
  return map;
}

function ensureMonths(map: Map<string, number>, months: string[]) {
  const result: { monthKey: string; label: string; value: number }[] = [];
  for (const m of months) {
    result.push({ monthKey: m, label: monthLabel(m), value: map.get(m) ?? 0 });
  }
  return result;
}

function bucketCounts<T>(rows: T[], getKey: (r: T) => string | undefined) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = (getKey(r) ?? "unknown").toLowerCase();
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function extractArray(obj: any) {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== "object") return [];
  return obj.data ?? obj.items ?? obj.result ?? obj.rows ?? [];
}

function kFormatter(n?: number) {
  if (n === undefined || n === null) return "0";
  const v = Math.abs(n);
  if (v < 1000) return `${n}`;
  if (v < 1_000_000) return `${(n / 1000).toFixed(1)}k`;
  if (v < 1_000_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  return `${(n / 1_000_000_000).toFixed(1)}b`;
}

/* =====================
   Palette & tooltip
===================== */
const PALETTE = {
  primary: "#7C3AED",   // violet-600
  success: "#10B981",   // emerald-500
  info: "#06B6D4",      // cyan-500
  warning: "#F59E0B",
  danger: "#EF4444",
  neutral: "#64748B",
};
const RING = [
  PALETTE.success, PALETTE.warning, PALETTE.danger,
  PALETTE.primary, PALETTE.info, PALETTE.neutral,
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-white/80 backdrop-blur px-3 py-2 text-sm shadow-md">
      {label && <div className="mb-1 font-medium">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name ?? p.dataKey}</span>
          <span className="ml-auto font-semibold text-gray-900">{kFormatter(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* =====================
   Component
===================== */
export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [dashboardData, setDashboardData] = useState<{ message: string; user: DecodedToken } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refunds, setRefunds]   = useState<Refund[]>([]);
  const [users, setUsers]       = useState<UserRow[]>([]);

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

        // validasi token
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

        const base = process.env.NEXT_PUBLIC_API_URL!;
        const headers = { Authorization: `Bearer ${token}` };

        // identitas admin (sekalian verifikasi akses)
        const dashRes = await fetch(`${base}/auth/admin/dashboard`, { headers });
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

        // ==== Ambil data utama ====
        const [bookingsRes, refundsRes, usersRes] = await Promise.all([
          fetch(`${base}/booking`, { headers }),  // NOTE: singular sesuai @Controller('booking')
          fetch(`${base}/refunds`, { headers }),  // sesuaikan bila controllernya beda
          fetch(`${base}/users`,  { headers }),
        ]);

        // bookings
        if (bookingsRes.ok) {
          const bj = await bookingsRes.json();
          setBookings(extractArray(bj));
        } else {
          console.warn("/booking failed", bookingsRes.status);
          setBookings([]);
        }

        // refunds (opsional, kalau belum ada boleh dikosongkan)
        if (refundsRes.ok) {
          const rj = await refundsRes.json();
          setRefunds(extractArray(rj));
        } else {
          console.warn("/refunds failed", refundsRes.status);
          setRefunds([]);
        }

        // users
        if (usersRes.ok) {
          const uj = await usersRes.json();
          setUsers(extractArray(uj));
        } else {
          console.warn("/users failed", usersRes.status);
          setUsers([]);
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

  /* =====================
     Derived series & buckets
  ===================== */
  const monthKeys = useMemo(() => lastNMonthKeys(6), []);

  const bookingSeries = useMemo(() => {
    const map = sumByMonth(bookings, (b: any) =>
      b.createdAt || b.created_at || b.tanggal_layanan || b.created
    );
    return ensureMonths(map, monthKeys).map(x => ({ month: x.label, bookings: x.value }));
  }, [bookings, monthKeys]);

  const refundSeries = useMemo(() => {
    const map = sumByMonth(refunds, (r: any) => r.createdAt || r.created_at || (r as any)?.created);
    return ensureMonths(map, monthKeys).map(x => ({ month: x.label, refunds: x.value }));
  }, [refunds, monthKeys]);

  const userSeries = useMemo(() => {
    const map = sumByMonth(users, (u: any) => u.created_at || u.createdAt || u.created || u.joinedAt);
    return ensureMonths(map, monthKeys).map(x => ({ month: x.label, users: x.value }));
  }, [users, monthKeys]);

  const refundBuckets   = useMemo(() => bucketCounts(refunds, (r) => (r as any)?.status), [refunds]);
  const userRoleBuckets = useMemo(() => bucketCounts(users,  (u) => (u as any)?.role),   [users]);

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
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Booking</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.bookings}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total Refund</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.refunds}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Total User</h3>
            <p className="text-3xl font-bold text-gray-800">{totals.users}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking per Bulan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingSeries.map(d => ({ month: d.month, value: d.bookings }))} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickFormatter={kFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Bookings"
                    stroke={PALETTE.primary}
                    strokeWidth={2.5}
                    fill="url(#gradBookings)"
                    animationDuration={700}
                    dot={{ r: 3, strokeWidth: 1, stroke: "white" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Refund per Bulan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Refund per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={refundSeries.map(d => ({ month: d.month, value: d.refunds }))} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickFormatter={kFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Refunds" fill={PALETTE.info} radius={[10, 10, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Baru per Bulan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Baru per Bulan</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userSeries.map(d => ({ month: d.month, value: d.users }))} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.success} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={PALETTE.success} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tickFormatter={kFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Users"
                    stroke={PALETTE.success}
                    strokeWidth={2.5}
                    fill="url(#gradUsers)"
                    animationDuration={700}
                    dot={{ r: 3, strokeWidth: 1, stroke: "white" }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Komposisi Status Refund */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Komposisi Status Refund</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Pie
                    data={refundBuckets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    strokeWidth={2}
                    animationDuration={700}
                  >
                    {refundBuckets.map((_, idx) => (
                      <Cell key={idx} fill={RING[idx % RING.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Refund</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {refundBuckets.reduce((a, b) => a + (b.value ?? 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Komposisi Role User */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Komposisi Role User</h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Pie
                    data={userRoleBuckets}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    strokeWidth={2}
                    animationDuration={700}
                  >
                    {userRoleBuckets.map((_, idx) => (
                      <Cell key={idx} fill={RING[idx % RING.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wide text-gray-500">Users</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {userRoleBuckets.reduce((a, b) => a + (b.value ?? 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
