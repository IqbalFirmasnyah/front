// app/admin/supir/components/SupirForm.tsx
import React, { useState, useEffect } from 'react';
import { Supir, StatusSupir } from '../../types/Supir'; // Sesuaikan path

interface SupirFormProps {
  initialData?: Supir | null; // Data untuk mode edit
  onSubmit: (data: any) => void; // Fungsi saat form disubmit
  onCancel: () => void; // Fungsi saat form dibatalkan
  loading: boolean;
  error: string | null;
}

const SupirForm: React.FC<SupirFormProps> = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    nomorHp: '',
    nomorSim: '',
    fotoSupir: '',
    pengalamanTahun: 0,
    ratingRata: 0,
    statusSupir: 'tersedia' as StatusSupir,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama || '',
        alamat: initialData.alamat || '',
        nomorHp: initialData.nomorHp || '',
        nomorSim: initialData.nomorSim || '',
        fotoSupir: initialData.fotoSupir || '',
        pengalamanTahun: initialData.pengalamanTahun || 0,
        ratingRata: initialData.ratingRata || 0,
        statusSupir: initialData.statusSupir || 'tersedia',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initialData ? 'Edit Data Supir' : 'Tambah Supir Baru'}
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="nomorHp" className="block text-sm font-medium text-gray-700">Nomor HP</label>
              <input
                type="text"
                id="nomorHp"
                name="nomorHp"
                value={formData.nomorHp}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="nomorSim" className="block text-sm font-medium text-gray-700">Nomor SIM</label>
              <input
                type="text"
                id="nomorSim"
                name="nomorSim"
                value={formData.nomorSim}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="fotoSupir" className="block text-sm font-medium text-gray-700">URL Foto Supir (Opsional)</label>
            <input
              type="text"
              id="fotoSupir"
              name="fotoSupir"
              value={formData.fotoSupir}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pengalamanTahun" className="block text-sm font-medium text-gray-700">Pengalaman (Tahun)</label>
              <input
                type="number"
                id="pengalamanTahun"
                name="pengalamanTahun"
                value={formData.pengalamanTahun}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="ratingRata" className="block text-sm font-medium text-gray-700">Rating Rata-rata</label>
              <input
                type="number"
                id="ratingRata"
                name="ratingRata"
                value={formData.ratingRata}
                onChange={handleChange}
                step="0.1" // Untuk rating desimal
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
          <div>
            <label htmlFor="statusSupir" className="block text-sm font-medium text-gray-700">Status Supir</label>
            <select
              id="statusSupir"
              name="statusSupir"
              value={formData.statusSupir}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="tersedia">Tersedia</option>
              <option value="bertugas">Bertugas</option>
              <option value="off">Off</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupirForm;