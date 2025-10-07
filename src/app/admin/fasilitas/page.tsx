"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import FasilitasTable from "./components/FasilitasTable";
import FasilitasForm from "./components/FasilitasForm";
import {
  Fasilitas,
  Meta,
  CreateFasilitasDto,
  JenisFasilitasEnum,
} from "../types/Fasilitas";

interface DecodedToken {
  sub: number;
  username: string;
  role: string;
  namaLengkap: string;
  adminRole?: string;
  exp: number;
}


export default function AdminFasilitasPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [fasilitas, setFasilitas] = useState<Fasilitas[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFasilitas, setEditingFasilitas] = useState<Fasilitas | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    jenis?: string;
    search?: string;
    page?: number;
    limit?: number;
  }>({
    page: 1,
    limit: 10,
  });

  // --- LOGIKA UTILITY ---
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token tidak ditemukan.');
    return token;
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  // -----------------------

  // --- LOGIKA AUTENTIKASI ---
  useEffect(() => {
    const checkAuthAndLoadUser = async () => {
      setAuthLoading(true);
      setAuthError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthError("Anda belum login atau sesi telah berakhir.");
        router.push("/login");
        setAuthLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setAuthError("Sesi Anda telah berakhir. Silakan login kembali.");
          router.push("/login");
          return;
        }
        setLoggedInUser(decoded);
      } catch (err: any) {
        localStorage.removeItem("token");
        setAuthError("Token tidak valid. Silakan login kembali.");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuthAndLoadUser();
  }, [router]);
  // -------------------------

  // --- LOGIKA FETCH DATA (READ) ---
  const fetchFasilitas = useCallback(async () => {
    if (authLoading || authError || !loggedInUser) return;

    setLoading(true);
    setApiFeedback(null);
    try {
      const token = getToken();

      const queryString = new URLSearchParams(filters as Record<string, string>).toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas?${queryString}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401 || res.status === 403) router.push("/login");
        throw new Error(errorData.message || `Gagal mengambil data fasilitas (${res.status})`);
      }

      const result = await res.json();
      setFasilitas(result.data || []);
      setMeta(result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });

    } catch (err: any) {
      console.error("Error fetching fasilitas:", err.message);
      setApiFeedback(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, router, authLoading, authError, loggedInUser]);

  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) fetchFasilitas();
  }, [fetchFasilitas, authLoading, authError, loggedInUser]);


  // --- LOGIKA UPLOAD DAN DELETE GAMBAR (CRUD FILE) ---

  const uploadImagesHandler = async (paketLuarKotaId: number, files: FileList) => {
    const token = getToken();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]); 
    }

    const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/paket-wisata-luar-kota/upload-images/${paketLuarKotaId}`;
    
    const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
        const errMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Gagal mengunggah gambar.');
        throw new Error(errMsg);
    }
  };

  const deleteImageHandler = useCallback(async (imageName: string) => {
    const token = getToken();
    const paketId = editingFasilitas?.paketLuarKota?.paketLuarKotaId; 

    if (!paketId) {
        setFormError("ID paket tidak valid untuk penghapusan gambar.");
        return;
    }
    if (!window.confirm(`Apakah Anda yakin ingin menghapus gambar ${imageName}?`)) return;

    try {
        const deleteUrl = `${process.env.NEXT_PUBLIC_API_URL}/fasilitas/delete-image/${paketId}?imageName=${imageName}`;
        const res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Gagal menghapus gambar.');
        }
        
        // Perbarui state editingFasilitas secara lokal
        if (editingFasilitas && editingFasilitas.paketLuarKota) {
            const updatedImages = editingFasilitas.paketLuarKota.images.filter(img => img !== imageName);
            setEditingFasilitas({
                ...editingFasilitas,
                paketLuarKota: {
                    ...editingFasilitas.paketLuarKota,
                    images: updatedImages,
                }
            } as Fasilitas);
        }
        setFormError(null);
        setApiFeedback('Gambar berhasil dihapus.');
        
    } catch (err: any) {
        setFormError(`Gagal hapus gambar: ${err.message}`);
    }
  }, [editingFasilitas]);


  // --- LOGIKA FORM SUBMIT UTAMA (CREATE/UPDATE) ---
  // Menggabungkan submit JSON dan Upload File
  const handleFormSubmit = async (data: CreateFasilitasDto, files: FileList | null) => {
    setFormError(null);
    setLoading(true);
    
    const isEditing = !!editingFasilitas;
    const url = isEditing ? `${process.env.NEXT_PUBLIC_API_URL}/fasilitas/${editingFasilitas?.fasilitasId}` : `${process.env.NEXT_PUBLIC_API_URL}/fasilitas/add`;
    const method = isEditing ? 'PATCH' : 'POST';
    
    let currentPaketLuarKotaId: number | null = null;
    let successMessage = `Fasilitas berhasil di${isEditing ? 'perbarui' : 'buat'}!`;

    try {
      const token = getToken();

      // 1. SUBMIT DATA JSON UTAMA (FASILITAS + PAKET LUAR KOTA)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        const errMsg = Array.isArray(responseData.message) ? responseData.message.join(', ') : (responseData.message || 'Gagal menyimpan data utama.');
        throw new Error(errMsg);
      }

      // 2. DAPATKAN ID PAKET LUAR KOTA (dari respons CREATE atau data EDIT)
      const resultData = responseData.data || responseData;
      // Asumsi respons CREATE/PATCH mengembalikan ID paketLuarKotaId di root atau nested.
      currentPaketLuarKotaId = resultData.paketLuarKotaId || resultData.paketLuarKota?.paketLuarKotaId;

      // 3. UNGGAH FILE (Jika ada file baru dan jenisnya Paket Luar Kota)
      if (files && files.length > 0 && currentPaketLuarKotaId && data.jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA) {
        try {
            await uploadImagesHandler(currentPaketLuarKotaId, files);
            successMessage += ' Gambar baru berhasil diunggah.';
        } catch (uploadError: any) {
            // Jika upload gagal, catat error dan lanjutkan
            successMessage += ` Namun, unggah gambar gagal: ${uploadError.message}.`;
            console.error(uploadError);
        }
      }
      
      setApiFeedback(successMessage);
      setShowForm(false);
      setEditingFasilitas(null);
      fetchFasilitas(); // Refresh data

    } catch (err: any) {
      console.error('Error submitting form:', err.message);
      setFormError(err.message); // Tampilkan error di form
    } finally {
      setLoading(false);
    }
  };


  // --- LOGIKA HAPUS FASILITAS (CRUD DELETE) ---
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus fasilitas ini?")) return;
    setLoading(true);
    setApiFeedback(null);
    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.message || `Gagal menghapus fasilitas (${res.status})`
        );
      }

      setApiFeedback('Fasilitas berhasil dihapus.');
      fetchFasilitas();
    } catch (err: any) {
      console.error("Error deleting fasilitas:", err.message);
      setApiFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };


  // --- HANDLER UI & NAVIGATION ---

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilters: { jenis?: string; search?: string }) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleAddClick = () => {
    setEditingFasilitas(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleEditClick = (fasilitas: Fasilitas) => {
    setEditingFasilitas(fasilitas);
    setFormError(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFasilitas(null);
    setFormError(null);
  };

  // --- HANDLER NAVIGASI UPLOAD GAMBAR DARI TABEL ---
  const handleUploadImageClick = (fasilitas: Fasilitas) => {
      // Pastikan ada ID paket luar kota yang terkait untuk navigasi
      if (fasilitas.paketLuarKotaId) {
          router.push(`/admin/paket-wisata-luar-kota/upload/${fasilitas.paketLuarKotaId}`);
      } else {
          setApiFeedback('ID Paket Luar Kota tidak ditemukan. Silakan edit fasilitas terlebih dahulu.');
      }
  };
  // --------------------------------------------------

  // --- RENDER UTAMA ---
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
        {/* ... (Sidebar Navigation) ... */}
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
            className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Manajemen Fasilitas
          </h1>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Tambah Fasilitas Baru
          </button>
        </header>
        
        {apiFeedback && (
          <div className={`p-4 rounded-lg mb-4 ${apiFeedback.includes('Gagal') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {apiFeedback}
          </div>
        )}

        {loading && !fasilitas.length ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-xl text-gray-700">Memuat data fasilitas...</p>
          </div>
        ) : (
          <FasilitasTable
            fasilitas={fasilitas}
            meta={meta}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            currentFilters={filters}
            onUploadImage={handleUploadImageClick} 
          />
        )}

        {showForm && (
          <FasilitasForm
            initialData={editingFasilitas}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            loading={loading}
            error={formError}
            onDeleteExistingImage={deleteImageHandler}
          />
        )}
      </main>
    </div>
  );
}