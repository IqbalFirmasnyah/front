import React, { useState, useEffect } from 'react';
import { Armada, StatusArmada } from '../../types/Armada'; // <-- Menggunakan import yang benar

// Hapus definisi tipe lokal di sini agar tidak konflik dengan file '../types/Armada'
// type StatusArmada = 'tersedia' | 'digunakan' | 'maintenance';
// interface Armada { ... }


interface ArmadaFormProps {
  initialData?: Armada | null; // Data untuk mode edit
  onSubmit: (data: any) => void; // Fungsi saat form disubmit
  onCancel: () => void; // Fungsi saat form dibatalkan
  loading: boolean;
  error: string | null;
}

// --- Toast Component ---
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-xl text-white transition-all duration-300 transform z-[100]";
  const typeClasses = type === 'success' ? "bg-green-500" : "bg-red-600";
  
  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center space-x-3">
        {type === 'success' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        )}
        <span className="font-medium">{message}</span>
        <button onClick={onDismiss} className="ml-4 opacity-70 hover:opacity-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};
// --- End Toast Component ---


const ArmadaForm: React.FC<ArmadaFormProps> = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState({
    jenisMobil: initialData?.jenisMobil || '', // Default dari initialData atau ''
    merkMobil: initialData?.merkMobil || '',
    platNomor: initialData?.platNomor || '',
    kapasitas: initialData?.kapasitas || 0,
    tahunKendaraan: initialData?.tahunKendaraan || new Date().getFullYear(),
    statusArmada: initialData?.statusArmada || 'tersedia' as StatusArmada,
    fotoArmada: initialData?.fotoArmada || '',
  });

  // State untuk mengelola Toast (notifikasi berhasil/gagal)
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' | null }>({
    show: false,
    message: '',
    type: null,
  });
  
  // State untuk mengelola pesan kesalahan validasi per input
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  // State untuk melacak apakah submission sudah dimulai
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Fungsi untuk menyembunyikan toast
  const hideToast = () => setToast(prev => ({ ...prev, show: false }));

  // Mengisi form saat initialData berubah (untuk mode edit)
  // Logic ini bisa disederhanakan karena sudah menggunakan initialData?. di useState di atas, 
  // tetapi dipertahankan untuk meng-handle jika initialData di-load secara async/berubah setelah mount.
  useEffect(() => {
    if (initialData) {
      setFormData({
        jenisMobil: initialData.jenisMobil || '',
        merkMobil: initialData.merkMobil || '',
        platNomor: initialData.platNomor || '',
        kapasitas: initialData.kapasitas || 0,
        tahunKendaraan: initialData.tahunKendaraan || new Date().getFullYear(),
        statusArmada: initialData.statusArmada || 'tersedia',
        fotoArmada: initialData.fotoArmada || '',
      });
    }
  }, [initialData]);

  // Efek untuk menampilkan toast setelah proses submission selesai
  useEffect(() => {
    // Cek jika submission sudah dimulai DAN loading sudah selesai (berubah dari true ke false)
    if (hasAttemptedSubmit && !loading) {
      if (error) {
        // Gagal: Tampilkan toast error
        setToast({ show: true, message: `Gagal menyimpan data armada: ${error}`, type: 'error' });
      } else if (Object.keys(validationErrors).length === 0) {
        // Sukses (hanya jika tidak ada error validasi client-side)
        setToast({ show: true, message: initialData ? 'Data armada berhasil diperbarui!' : 'Armada baru berhasil ditambahkan!', type: 'success' });
        
        setTimeout(() => {
            onCancel(); // Tutup form setelah toast sukses terlihat sebentar
        }, 1500); 
      }
      setHasAttemptedSubmit(false); // Reset status attempt
    }
  }, [loading, error, hasAttemptedSubmit, initialData, onCancel, validationErrors]);

  // Efek untuk menyembunyikan toast secara otomatis
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(hideToast, 4000); // Toast akan hilang dalam 4 detik
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Bersihkan pesan error validasi untuk field yang sedang diubah
    setValidationErrors(prev => {
        if (prev[name as keyof typeof formData]) {
            const { [name as keyof typeof formData]: _, ...rest } = prev;
            return rest as Partial<Record<keyof typeof formData, string>>;
        }
        return prev;
    });
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors: Partial<Record<keyof typeof formData, string>> = {};

    // --- Validation Logic ---
    if (!formData.jenisMobil.trim()) {
      errors.jenisMobil = 'Jenis Mobil wajib diisi.';
    }
    if (!formData.merkMobil.trim()) {
      errors.merkMobil = 'Merk Mobil wajib diisi.';
    }
    if (!formData.platNomor.trim()) {
      errors.platNomor = 'Plat Nomor wajib diisi.';
    }
    if (formData.kapasitas <= 0) {
      errors.kapasitas = 'Kapasitas harus lebih dari 0.';
    }
    const currentYear = new Date().getFullYear();
    if (formData.tahunKendaraan < 1900 || formData.tahunKendaraan > currentYear) {
      errors.tahunKendaraan = `Tahun kendaraan harus antara 1900 dan ${currentYear}.`;
    }

    setValidationErrors(errors);

    // Jika ada error, hentikan submission
    if (Object.keys(errors).length > 0) {
      // Set toast error untuk memberi tahu pengguna tentang masalah validasi
      setToast({ show: true, message: 'Harap perbaiki kesalahan dalam formulir.', type: 'error' });
      return;
    }

    // Jika validasi sukses, panggil onSubmit
    onSubmit(formData);
  };

  const getInputClassName = (fieldName: keyof typeof formData) => {
    const baseClasses = "mt-1 block w-full rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm p-2.5 transition";
    const errorClass = validationErrors[fieldName] ? 'border-2 border-red-500' : 'border border-gray-300';
    return `${baseClasses} ${errorClass}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-extrabold mb-6 text-gray-800 border-b pb-2">
            {initialData ? 'Edit Data Armada' : 'Tambah Armada Baru'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="jenisMobil" className="block text-sm font-semibold text-gray-700">Jenis Mobil</label>
              <input
                type="text"
                id="jenisMobil"
                name="jenisMobil"
                value={formData.jenisMobil}
                onChange={handleChange}
                className={getInputClassName('jenisMobil')}
                required
              />
              {validationErrors.jenisMobil && (
                <p className="mt-1 text-red-500 text-xs font-medium">{validationErrors.jenisMobil}</p>
              )}
            </div>
            <div>
              <label htmlFor="merkMobil" className="block text-sm font-semibold text-gray-700">Merk Mobil</label>
              <input
                type="text"
                id="merkMobil"
                name="merkMobil"
                value={formData.merkMobil}
                onChange={handleChange}
                className={getInputClassName('merkMobil')}
                required
              />
              {validationErrors.merkMobil && (
                <p className="mt-1 text-red-500 text-xs font-medium">{validationErrors.merkMobil}</p>
              )}
            </div>
            <div>
              <label htmlFor="platNomor" className="block text-sm font-semibold text-gray-700">Plat Nomor</label>
              <input
                type="text"
                id="platNomor"
                name="platNomor"
                value={formData.platNomor}
                onChange={handleChange}
                className={getInputClassName('platNomor')}
                required
              />
              {validationErrors.platNomor && (
                <p className="mt-1 text-red-500 text-xs font-medium">{validationErrors.platNomor}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kapasitas" className="block text-sm font-semibold text-gray-700">Kapasitas Penumpang</label>
                <input
                  type="number"
                  id="kapasitas"
                  name="kapasitas"
                  value={formData.kapasitas}
                  onChange={handleChange}
                  min="1"
                  className={getInputClassName('kapasitas')}
                  required
                />
                {validationErrors.kapasitas && (
                  <p className="mt-1 text-red-500 text-xs font-medium">{validationErrors.kapasitas}</p>
                )}
              </div>
              <div>
                <label htmlFor="tahunKendaraan" className="block text-sm font-semibold text-gray-700">Tahun Kendaraan</label>
                <input
                  type="number"
                  id="tahunKendaraan"
                  name="tahunKendaraan"
                  value={formData.tahunKendaraan}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className={getInputClassName('tahunKendaraan')}
                  required
                />
                {validationErrors.tahunKendaraan && (
                  <p className="mt-1 text-red-500 text-xs font-medium">{validationErrors.tahunKendaraan}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="statusArmada" className="block text-sm font-semibold text-gray-700">Status Armada</label>
              <select
                id="statusArmada"
                name="statusArmada"
                value={formData.statusArmada}
                onChange={handleChange}
                // Status Armada is a select, less prone to direct validation errors from user input
                className="mt-1 block w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm p-2.5 transition bg-white"
                required
              >
                <option value="tersedia">Tersedia</option>
                <option value="digunakan">Digunakan</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label htmlFor="fotoArmada" className="block text-sm font-semibold text-gray-700">URL Foto Armada (Opsional)</label>
              <input
                type="text"
                id="fotoArmada"
                name="fotoArmada"
                value={formData.fotoArmada}
                onChange={handleChange}
                placeholder="Contoh: https://placehold.co/600x400"
                className={getInputClassName('fotoArmada')}
              />
              {/* Note: Tidak ada validasi khusus untuk URL di sini, tetapi bisa ditambahkan jika perlu */}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 text-sm font-medium bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Armada'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Tampilkan Toast jika show bernilai true */}
      {toast.show && toast.type && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={hideToast} 
        />
      )}
    </>
  );
};

export default ArmadaForm;
