"use client";

import React, { useState } from 'react';
import { Armada } from '../../types/Armada'; // Sesuaikan path

interface UploadImageModalProps {
  armada: Armada;
  onClose: () => void;
  onUploadSuccess: (armadaId: number) => void;
}

const UploadImageModal: React.FC<UploadImageModalProps> = ({ armada, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validasi sederhana
      if (!selectedFile.type.startsWith('image/')) {
        setError('File yang dipilih harus berupa gambar.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Ukuran file maksimal 5MB.');
        setFile(null);
        return;
      }
      
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Pilih file gambar terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const formData = new FormData();
      // 'image' harus sama dengan field name di FileInterceptor controller Anda
      formData.append('image', file); 

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/armada/upload-image/${armada.armadaId}`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}` 
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        // Tangani pesan error dari HttpException di controller
        const errorMessage = data.message ? (Array.isArray(data.message) ? data.message.join(', ') : data.message) : 'Gagal mengunggah gambar.';
        throw new Error(errorMessage);
      }

      onUploadSuccess(armada.armadaId); // Panggil fungsi sukses untuk refresh data
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Terjadi kesalahan saat mengunggah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Unggah Foto Armada</h2>
        <p className="mb-4 text-gray-600">Armada: <span className="font-semibold">{armada.merkMobil} ({armada.platNomor})</span></p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Pilih File Gambar (Max 5MB)</label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-white transition duration-300 ${
                loading || !file 
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              disabled={loading || !file}
            >
              {loading ? 'Mengunggah...' : 'Unggah Foto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;