"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

// Import semua types termasuk DecodedToken dari file types terpusat
import PaketWisataTable from './components/PaketWisataTable';
import PaketWisataForm from './components/PaketWisataForm';
import { PaketWisata, Meta, KategoriPaket, StatusPaket, DecodedToken } from '../types/PaketWisata'; 

export default function AdminPaketWisataPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [pakets, setPakets] = useState<PaketWisata[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPaket, setEditingPaket] = useState<PaketWisata | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // --- State baru untuk data pengguna yang login ---
  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // --- Akhir State baru ---
  const [filters, setFilters] = useState<{ kategori?: KategoriPaket; status?: StatusPaket; search?: string; page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  });
  
  // Efek untuk autentikasi dan memuat data pengguna yang login
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      setAuthLoading(true);
      setAuthError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        setAuthError('Anda belum login atau sesi telah berakhir.');
        router.push('/login');
        setAuthLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);

        // Periksa kedaluwarsa token
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setAuthError('Sesi Anda telah berakhir. Silakan login kembali.');
          router.push('/login');
          setAuthLoading(false);
          return;
        }

        setLoggedInUser(decoded);
      } catch (err: any) {
        console.error('Error verifying token:', err);
        localStorage.removeItem('token');
        setAuthError('Token tidak valid. Silakan login kembali.');
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthAndLoadUser();
  }, [router]);

  const fetchPaketWisata = useCallback(async () => {
    // Pastikan user sudah terautentikasi sebelum fetch data
    if (authLoading || authError || !loggedInUser) {
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token tidak ditemukan, silakan login terlebih dahulu.');
        router.push('/login');
        return;
      }

      const queryString = new URLSearchParams(filters as Record<string, string>).toString();
      // Menggunakan fetch dari window global
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/all?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) {
            setError('Akses tidak diizinkan. Silakan login kembali.');
            router.push('/login');
        } else {
            // Perbaiki penanganan error agar bisa menampilkan pesan dari backend
            const message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
            throw new Error(message || `Gagal mengambil data paket wisata (${res.status})`);
        }
        return;
      }

      const result = await res.json();
      setPakets(result.data || []);
      setMeta(result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });

    } catch (err: any) {
      console.error('Error fetching paket wisata:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, router, authLoading, authError, loggedInUser]);  

  useEffect(() => {
    // Panggil fetchPaketWisata hanya setelah autentikasi selesai dan berhasil
    if (!authLoading && !authError && loggedInUser) {
        fetchPaketWisata();
    }
  }, [fetchPaketWisata, authLoading, authError, loggedInUser]);

  const handleFormSubmit = async (formData: any) => {
    setFormError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      let res: Response;
      const url = editingPaket ? `${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/${editingPaket.paketId}` : `${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/add`;
      const method = editingPaket ? 'PATCH' : 'POST';

      res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'Operasi gagal.');
      }

      setShowForm(false);
      setEditingPaket(null);
      fetchPaketWisata();
    } catch (err: any) {
      console.error('Error submitting form:', err.message);
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Ganti confirm() dengan window.confirm()
    if (!window.confirm('Apakah Anda yakin ingin menghapus paket wisata ini?')) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(message || `Gagal menghapus paket wisata (${res.status})`);
      }

      fetchPaketWisata();
    } catch (err: any) {
      console.error('Error deleting paket wisata:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: StatusPaket) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        throw new Error(message || `Gagal memperbarui status paket wisata (${res.status})`);
      }

      fetchPaketWisata();
    } catch (err: any) {
      console.error('Error updating status:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: { kategori?: KategoriPaket; status?: StatusPaket; search?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleAddClick = () => {
    setEditingPaket(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleEditClick = (paket: PaketWisata) => {
    setEditingPaket(paket);
    setFormError(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPaket(null);
    setFormError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Tampilkan loading atau error autentikasi terlebih dahulu
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
          onClick={() => router.push('/login')}
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  // Setelah admin terautentikasi dan data pengguna tersedia, baru tampilkan konten
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold text-orange-400 mb-8 text-center">Admin Panel</div>
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
               { name: "Pengguna", href: "/admin/user" },
               { name: "Refund", href: "/admin/refund" },
            ].map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`block py-2 px-4 rounded-lg transition duration-200 ${
                    pathname === link.href ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'
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
          <p className="font-semibold text-orange-400">{loggedInUser?.namaLengkap || 'Admin'}</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Paket Wisata</h1>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Tambah Paket Baru
          </button>
        </header>

        {loading && !pakets.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-700">Memuat data paket wisata...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
            <PaketWisataTable
            pakets={pakets}
            meta={meta}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            currentFilters={filters} 
          />
        )}

        {showForm && (
          <PaketWisataForm
            initialData={editingPaket}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            loading={loading}
            error={formError}
          />
        )}
      </main>
    </div>
  );
}