// app/admin/booking/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

import BookingTable from './components/BookingTable';
import { Booking, Meta, BookingStatus as BookingStatusType } from '../types/Booking';
import Header from '@/app/components/Header'; // Asumsi komponen Header ada di path ini

// Definisikan interface untuk payload JWT yang didekode di sisi klien
interface DecodedToken {
  id: number;
  username: string;
  role: string;
  namaLengkap: string;
  adminRole?: string;
  exp: number;
}

export default function AdminBookingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      setAuthLoading(true);
      setAuthError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setAuthError('Anda belum login atau sesi telah berakhir.');
        router.push('/login');
        setAuthLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setAuthError('Sesi Anda telah berakhir. Silakan login kembali.');
          router.push('/login');
          setAuthLoading(false);
          return;
        }

        if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
          localStorage.removeItem('token');
          setAuthError('Akses Ditolak: Anda tidak memiliki hak akses sebagai admin.');
          router.push('/');
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

  const [filters, setFilters] = useState<{ status?: BookingStatusType; search?: string; page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  });

  const fetchBookings = useCallback(async () => {
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

      const stringifiedFilters: Record<string, string> = {};
      for (const key in filters) {
        if (Object.prototype.hasOwnProperty.call(filters, key)) {
          const value = filters[key as keyof typeof filters];
          if (value !== undefined) {
            stringifiedFilters[key] = String(value);
          }
        }
      }
      const queryString = new URLSearchParams(stringifiedFilters).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking?${queryString}`, {
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
          throw new Error(errorData.message || `Gagal mengambil data booking (${res.status})`);
        }
        return;
      }
      const result = await res.json();
      setBookings(result.data || []);
      setMeta(result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (err: any) {
      console.error('Error fetching bookings:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, router, authLoading, authError, loggedInUser]);

  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) {
      fetchBookings();
    }
  }, [fetchBookings, authLoading, authError, loggedInUser]);

  const handleUpdateStatus = async (id: number, newStatus: BookingStatusType) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ statusBooking: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Gagal memperbarui status booking (${res.status})`);
      }
      fetchBookings();
    } catch (err: any) {
      console.error('Error updating status:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus booking ini?')) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/booking/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Gagal menghapus booking (${res.status})`);
      }
      fetchBookings();
    } catch (err: any) {
      console.error('Error deleting booking:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: { status?: BookingStatusType; search?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleUpdateRescheduleStatus = async (rescheduleId: number, newStatus: 'approved' | 'rejected', bookingId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Admin token not found.');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reschedule/${rescheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal memperbarui status reschedule.');
      }
      alert(`Status reschedule berhasil diubah menjadi ${newStatus}.`);
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengubah status reschedule.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100">
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

      <main className="flex-1 p-8">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Booking</h1>
        </header>
        {loading && !bookings.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-700">Memuat data booking...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
        ) : (
          <BookingTable
            bookings={bookings}
            meta={meta}
            onEdit={() => {}}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            onUpdateRescheduleStatus={handleUpdateRescheduleStatus}
            currentFilters={filters}
          />
        )}
      </main>
    </div>
  );
}