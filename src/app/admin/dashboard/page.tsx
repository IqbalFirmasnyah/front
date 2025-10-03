"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode


// Definisikan interface untuk payload JWT yang didekode (di sisi klien)
interface DecodedToken {
  sub: number; // Ini akan menjadi userId atau adminId
  username: string;
  role: string; // 'user', 'admin', 'superadmin'
  namaLengkap: string;
  adminRole?: string; // Hanya ada jika role adalah 'admin' atau 'superadmin'
  exp: number; // Expiration time (Unix timestamp)
  // Tambahkan properti lain yang mungkin ada di objek req.user Anda dari backend
  isAdmin: boolean;
  isSuperAdmin: boolean;
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname(); // Untuk menandai link aktif di sidebar

  const [dashboardData, setDashboardData] = useState<{ message: string, user: DecodedToken } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Anda belum login atau sesi telah berakhir.');
          router.push('/login'); // Arahkan ke halaman login
          return;
        }

        let decodedToken: DecodedToken;
        try {
          decodedToken = jwtDecode<DecodedToken>(token);
          // Periksa apakah token sudah kedaluwarsa
          if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setError('Sesi Anda telah berakhir. Silakan login kembali.');
            router.push('/login');
            return;
          }

          // Periksa peran: hanya admin atau superadmin yang boleh di sini
        //   if (decodedToken.role !== Role.Admin && decodedToken.role !== Role.SuperAdmin) {
        //     localStorage.removeItem('token'); // Hapus token jika bukan admin
        //     setError('Akses Ditolak: Anda tidak memiliki hak akses sebagai admin.');
        //     router.push('/'); // Redirect ke halaman utama jika bukan admin
        //     return;
        //   }

        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          localStorage.removeItem('token');
          setError('Token tidak valid. Silakan login kembali.');
          router.push('/login');
          return;
        }

        // Jika token valid dan peran sesuai, panggil endpoint backend
        const res = await fetch('http://localhost:3001/auth/admin/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorDetail = await res.json();
          // Backend akan merespons 401/403 jika token invalid/peran tidak cocok
          if (res.status === 403) {
            setError('Akses Ditolak: Anda tidak memiliki hak akses yang memadai.');
            router.push('/');
          } else if (res.status === 401) {
            setError('Autentikasi gagal: Token tidak valid atau kedaluwarsa.');
            router.push('/login');
          } else {
            throw new Error(errorDetail.message || `Gagal mengambil data dashboard admin (${res.status})`);
          }
          return;
        }

        const data: { message: string, user: DecodedToken } = await res.json();
        setDashboardData(data); // Simpan data dashboard, termasuk objek user dari req.user backend
        
      } catch (err: any) {
        console.error('Error fetching admin dashboard:', err.message);
        if (!error) { // Hanya set error jika belum di-set oleh penanganan status HTTP
          setError('Terjadi kesalahan jaringan atau server tidak merespons.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboard();
  }, [router, pathname]); // Tambahkan pathname sebagai dependency karena ini memengaruhi URL aktif

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Paket Wisata', href: '/admin/paket-wisata' },
    { name: 'Fasilitas', href: '/admin/fasilitas' },
    { name: 'Supir', href: '/admin/supir' },
    { name: 'Armada', href: '/admin/armada' },
    { name: 'Booking', href: '/admin/booking' },
    { name: 'Pesanan', href: '/admin/pesanan' },
    { name: 'Refund', href: '/admin/refund' },
  ];

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
        {error.includes('login') && (
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Kembali ke Login
          </button>
        )}
        {error.includes('Akses Ditolak') && (
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Kembali ke Beranda
          </button>
        )}
      </div>
    );
  }

  // Jika data dashboard sudah ada, tampilkan konten
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
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'hover:bg-gray-700 text-gray-300'
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
          {/* Tampilkan nama admin dari dashboardData */}
          <p className="font-semibold text-orange-400">{dashboardData?.user.namaLengkap || 'Admin'}</p>
          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Utama</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pesan Selamat Datang */}
          <div className="bg-blue-100 p-6 rounded-lg shadow-md col-span-full">
            <p className="text-blue-800 text-lg">{dashboardData?.message}</p>
          </div>

          {/* Informasi Admin */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Akun Admin</h2>
            <p className="text-gray-700 mb-2"><strong>Nama Lengkap:</strong> {dashboardData?.user.namaLengkap}</p>
            <p className="text-gray-700 mb-2"><strong>Username:</strong> {dashboardData?.user.username}</p>
            <p className="text-gray-700 mb-2"><strong>Email:</strong> {dashboardData?.user.email}</p>
            <p className="text-gray-700 mb-2"><strong>Role Sistem:</strong> <span className="capitalize">{dashboardData?.user.role}</span></p>
            {dashboardData?.user.adminRole && (
               <p className="text-gray-700 mb-2"><strong>Peran Spesifik:</strong> <span className="capitalize">{dashboardData?.user.adminRole.replace('_', ' ')}</span></p>
            )}
          </div>

          {/* Contoh Card Statistik (bisa diganti dengan data real) */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Cepat</h2>
            <p className="text-gray-700 mb-2">Total Booking: <span className="font-bold">120</span></p>
            <p className="text-gray-700 mb-2">Pengguna Aktif: <span className="font-bold">85</span></p>
            <p className="text-700 mb-2">Pendapatan Bulan Ini: <span className="font-bold">Rp 50.000.000</span></p>
          </div>

          {/* Card Aksi Cepat (bisa diganti dengan link/tombol ke halaman admin lain) */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
            <ul className="space-y-2">
              <li><a href="/admin/users" className="text-blue-600 hover:underline">Kelola Pengguna</a></li>
              <li><a href="/admin/payments" className="text-blue-600 hover:underline">Verifikasi Pembayaran</a></li>
              <li><a href="/admin/reports" className="text-blue-600 hover:underline">Lihat Laporan</a></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}