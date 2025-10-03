"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

import ArmadaTable from './components/ArmadaTable'; 
import ArmadaForm from './components/ArmadaForm'; // Asumsikan Anda memiliki ArmadaForm yang berfungsi
import UploadImageModal from './components/UploadImageModal';
import { Armada, Meta, StatusArmada } from '../types/Armada'; // Sesuaikan path

// Definisikan interface untuk payload JWT
interface DecodedToken {
  sub: number; 
  username: string;
  role: string; 
  namaLengkap: string;
  adminRole?: string; 
  exp: number; 
}

export default function AdminArmadaPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [armadas, setArmadas] = useState<Armada[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArmada, setEditingArmada] = useState<Armada | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State untuk Unggah Foto
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [armadaToUpload, setArmadaToUpload] = useState<Armada | null>(null);

  // State untuk Auth
  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{ status?: StatusArmada; search?: string; page?: number; limit?: number }>({
    page: 1,
    limit: 10,
  });

  // --- 1. AUTENTIKASI ---
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      setAuthLoading(true);
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
          return;
        }
        setLoggedInUser(decoded);
      } catch (err: any) {
        localStorage.removeItem('token');
        setAuthError('Token tidak valid. Silakan login kembali.');
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuthAndLoadUser();
  }, [router]);

  // --- 2. FETCH DATA (READ) ---
  const fetchArmadas = useCallback(async () => {
    if (authLoading || authError || !loggedInUser) {
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const queryString = new URLSearchParams(filters as Record<string, string>).toString();
      const res = await fetch(`http://localhost:3001/armada/all?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) {
            router.push('/login');
        } 
        throw new Error(errorData.message || `Gagal mengambil data armada (${res.status})`);
      }

      const result = await res.json();
      setArmadas(result.data || []);
      setMeta(result.meta || { total: result.data?.length || 0, page: 1, limit: 10, totalPages: 1 }); // Sesuaikan jika API tidak mengirim meta
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, router, authLoading, authError, loggedInUser]);

  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) {
        fetchArmadas();
    }
  }, [fetchArmadas, authLoading, authError, loggedInUser]);

  // --- 3. CRUD HANDLERS ---
  
  // CREATE & UPDATE
  const handleFormSubmit = async (formData: any) => {
    setFormError(null);
    setLoading(true); 
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const url = editingArmada ? 
        `http://localhost:3001/armada/${editingArmada.armadaId}` : 
        'http://localhost:3001/armada/add';
      const method = editingArmada ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Operasi gagal.');
      }

      setShowForm(false);
      setEditingArmada(null);
      await fetchArmadas(); 
      setError(`Armada berhasil di${editingArmada ? 'perbarui' : 'tambahkan'}.`);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus armada ini? Tindakan ini tidak dapat dibatalkan.')) return;
    
    setLoading(true); 
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`http://localhost:3001/armada/${id}`, {
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || `Gagal menghapus armada (${res.status})`);
      }
      
      setError(`Armada ID ${id} berhasil dihapus.`); 
      await fetchArmadas(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); 
      setTimeout(() => setError(null), 5000); 
    }
  };


  // --- 4. FORM & MODAL CONTROLS ---

  const handlePageChange = (page: number) => { 
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: { status?: StatusArmada; search?: string }) => { 
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleAddClick = () => {
    setEditingArmada(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleEditClick = (armada: Armada) => {
    setEditingArmada(armada);
    setFormError(null);
    setShowForm(true);
  };

  const handleCancelForm = () => { 
    setShowForm(false);
    setEditingArmada(null);
    setFormError(null);
  };

  const handleLogout = () => { 
    localStorage.removeItem('token');
    router.push('/login');
  };
  
  // HANDLERS UNGGAH FOTO
  const handleUploadImageClick = (armada: Armada) => {
    setArmadaToUpload(armada);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setArmadaToUpload(null);
    setShowUploadModal(false);
    // Tidak reset error utama di sini agar pesan sukses upload tetap terlihat
  };

  const handleUploadSuccess = async (armadaId: number) => {
    setError(`Foto armada ID ${armadaId} berhasil diunggah!`);
    await fetchArmadas(); 
    setTimeout(() => setError(null), 5000); 
  };
  

  // --- 5. RENDER UTAMA ---

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
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold text-orange-400 mb-8 text-center">Admin Panel</div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {[
              { name: 'Dashboard', href: '/admin/dashboard' },
              { name: 'Armada', href: '/admin/armada' },
              // ... link lainnya
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
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Armada</h1>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Tambah Armada Baru
          </button>
        </header>

        {loading && !armadas.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-700">Memuat data armada...</p>
          </div>
        ) : error ? (
          // Tampilkan pesan error/sukses
          <div className={`p-4 rounded-lg mb-4 ${error.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{error}</div>
        ) : null}

        <ArmadaTable
          armadas={armadas}
          meta={meta}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          onUploadImage={handleUploadImageClick}
        />

        {showForm && (
          <ArmadaForm
            initialData={editingArmada}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            loading={loading}
            error={formError}
          />
        )}
        
        {/* MODAL UNGGAH FOTO */}
        {showUploadModal && armadaToUpload && (
            <UploadImageModal
                armada={armadaToUpload}
                onClose={handleCloseUploadModal}
                onUploadSuccess={handleUploadSuccess}
            />
        )}
      </main>
    </div>
  );
}