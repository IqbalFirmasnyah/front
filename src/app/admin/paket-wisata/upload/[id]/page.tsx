"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { ArrowLeft } from 'lucide-react';
import ImageUploadForm from '../../components/ImageUploadForm';
import { PaketWisata } from '../../../types/PaketWisata'; 
import { DecodedToken }from '../../../types/PaketWisata';

// Definisikan interface untuk parameter halaman
interface UploadPageProps {
  params: {
    id: string; // ID Paket Wisata dari URL
  };
}

const API_BASE_URL = 'http://localhost:3001/paket-wisata';

export default function ImageUploadPage({ params }: UploadPageProps) {
  const router = useRouter();
  const paketId = parseInt(params.id);

  const [paketData, setPaketData] = useState<PaketWisata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // --- Autentikasi State (dapat disederhanakan jika menggunakan Context/Redux) ---
  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  // --- Akhir Autentikasi State ---

  const getToken = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
        setAuthError('Token tidak ditemukan. Silakan login kembali.');
        router.push('/login');
        throw new Error('Unauthorized');
    }
    return token;
  }, [router]);


  // 1. Ambil data paket wisata saat pertama kali dimuat
  const fetchPaketData = useCallback(async () => {
    if (isNaN(paketId)) {
        setError('ID Paket Wisata tidak valid.');
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/${paketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
             setError('Paket wisata tidak ditemukan.');
        } else if (res.status === 401 || res.status === 403) {
             throw new Error('Akses tidak diizinkan. Silakan login kembali.');
        } else {
             throw new Error(data.message || 'Gagal mengambil data paket.');
        }
      }

      setPaketData(data.data);

    } catch (err: any) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paketId, getToken]);
  
  // 2. Efek untuk autentikasi dan memuat data pengguna
  useEffect(() => {
    const checkAuth = async () => {
        setAuthLoading(true);
        setAuthError(null);
        try {
            const token = getToken();
            const decoded: DecodedToken = jwtDecode(token);

            if (decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                throw new Error('Sesi Anda telah berakhir.');
            }

            setLoggedInUser(decoded);
        } catch (err: any) {
            console.error('Error verifying token:', err.message);
            setAuthError(err.message || 'Token tidak valid.');
            router.push('/login');
        } finally {
            setAuthLoading(false);
        }
    };

    checkAuth();
  }, [router, getToken]);

  // 3. Efek untuk memanggil fetchPaketData setelah autentikasi selesai
  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) {
        fetchPaketData();
    }
  }, [authLoading, authError, loggedInUser, fetchPaketData]);


  // Handler untuk proses upload file
  const handleImageUpload = useCallback(async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      const token = getToken();
      
      const formData = new FormData();
      // Tambahkan setiap file ke FormData dengan field name 'images'
      files.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`${API_BASE_URL}/upload-images/${paketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Penting: Jangan set Content-Type untuk form-data yang berisi file.
          // Browser akan otomatis menambahkannya dengan boundary.
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Cek jika error dari API adalah string[] (dari class-validator) atau string
        const errorMessages = Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error);
        throw new Error(`Gagal mengunggah gambar: ${errorMessages}`);
      }

      // Update paketData dengan respons terbaru
      setPaketData(data.data); 
      // Menggunakan custom modal/message box daripada alert() untuk aplikasi Next.js/React
      // Untuk tujuan demo, saya tetap menggunakan alert() karena tidak ada custom modal di kode.
      alert('Gambar berhasil diunggah!');

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [paketId, getToken]);

  // Handler untuk menghapus gambar yang sudah ada
  const handleDeleteExistingImage = useCallback(async (imageName: string) => {
    // Mengganti confirm() dengan alert() karena confirm() tidak disarankan di lingkungan sandbox
    if (!window.confirm(`Apakah Anda yakin ingin menghapus gambar ${imageName}?`)) return;

    setUploading(true);
    setError(null);

    try {
        const token = getToken();
        
        // Menggunakan query parameter seperti yang didefinisikan di controller
        const res = await fetch(`${API_BASE_URL}/delete-image/${paketId}?imageName=${imageName}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            const errorMessages = Array.isArray(data.message) ? data.message.join(', ') : (data.message || data.error);
            throw new Error(`Gagal menghapus gambar: ${errorMessages}`);
        }

        // Update paketData dengan respons terbaru
        setPaketData(data.data);
        alert('Gambar berhasil dihapus!');

    } catch (err: any) {
        console.error('Delete error:', err);
        setError(err.message);
    } finally {
        setUploading(false);
    }
  }, [paketId, getToken]);


  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Memuat data...</p>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-8">
        <p className="text-xl font-semibold mb-4">Error!</p>
        <p className="text-lg text-center">{authError || error}</p>
        <button
          onClick={() => router.push('/admin/paket-wisata')}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  if (!paketData) {
      return null;
  }
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Gambar Paket Wisata</h1>
        <button
          onClick={() => router.push('/admin/paket-wisata')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 flex items-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </button>
      </div>

      <ImageUploadForm
        paketId={paketData.paketId}
        paketName={paketData.namaPaket}
        existingImages={paketData.images || []}
        isLoading={uploading}
        onUpload={handleImageUpload}
        onDeleteExisting={handleDeleteExistingImage}
      />

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl">
            <p className="text-lg font-semibold text-indigo-600">Sedang memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
}