// app/admin/paket-wisata/components/PaketWisataForm.tsx
import React, { useState, useEffect } from 'react';
import { PaketWisata, KategoriPaket, StatusPaket } from '../../types/PaketWisata'; // Sesuaikan path

interface PaketWisataFormProps {
  initialData?: PaketWisata | null; // Data untuk mode edit
  onSubmit: (data: any) => void; // Fungsi saat form disubmit
  onCancel: () => void; // Fungsi saat form dibatalkan
  loading: boolean;
  error: string | null;
}

const PaketWisataForm: React.FC<PaketWisataFormProps> = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const [formData, setFormData] = useState({
    namaPaket: '',
    namaTempat: '',
    lokasi: '',
    deskripsi: '',
    itinerary: '',
    jarakKm: 0,
    durasiHari: 0,
    pilihTanggal: '', // Format YYYY-MM-DD
    harga: 0,
    fotoPaket: '',
    kategori: 'dalam kota' as KategoriPaket,
    statusPaket: 'aktif' as StatusPaket,
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.pilihTanggal ? new Date(initialData.pilihTanggal).toISOString().split('T')[0] : '';
      setFormData({
        namaPaket: initialData.namaPaket || '',
        namaTempat: initialData.namaTempat || '',
        lokasi: initialData.lokasi || '',
        deskripsi: initialData.deskripsi || '',
        itinerary: initialData.itinerary || '',
        jarakKm: initialData.jarakKm || 0,
        durasiHari: initialData.durasiHari || 0,
        pilihTanggal: formattedDate,
        harga: initialData.harga || 0,
        fotoPaket: initialData.fotoPaket || '',
        kategori: initialData.kategori || 'dalam kota',
        statusPaket: initialData.statusPaket || 'aktif',
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initialData ? 'Edit Paket Wisata' : 'Tambah Paket Wisata Baru'}
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="namaPaket" className="block text-sm font-medium text-gray-700">Nama Paket</label>
            <input
              type="text"
              id="namaPaket"
              name="namaPaket"
              value={formData.namaPaket}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="namaTempat" className="block text-sm font-medium text-gray-700">Nama Tempat</label>
            <input
              type="text"
              id="namaTempat"
              name="namaTempat"
              value={formData.namaTempat}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">Lokasi</label>
            <input
              type="text"
              id="lokasi"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="itinerary" className="block text-sm font-medium text-gray-700">Itinerary</label>
            <textarea
              id="itinerary"
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="jarakKm" className="block text-sm font-medium text-gray-700">Jarak (KM)</label>
              <input
                type="number"
                id="jarakKm"
                name="jarakKm"
                value={formData.jarakKm}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label htmlFor="durasiHari" className="block text-sm font-medium text-gray-700">Durasi (Hari)</label>
              <input
                type="number"
                id="durasiHari"
                name="durasiHari"
                value={formData.durasiHari}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="pilihTanggal" className="block text-sm font-medium text-gray-700">Pilih Tanggal</label>
            <input
              type="date"
              id="pilihTanggal"
              name="pilihTanggal"
              value={formData.pilihTanggal}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="harga" className="block text-sm font-medium text-gray-700">Harga</label>
            <input
              type="number"
              id="harga"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              step="0.01" // Untuk harga dengan desimal
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">Kategori</label>
            <select
              id="kategori"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="dalam kota">Dalam Kota</option>
              <option value="luar kota">Luar Kota</option>
            </select>
          </div>
          <div>
            <label htmlFor="statusPaket" className="block text-sm font-medium text-gray-700">Status Paket</label>
            <select
              id="statusPaket"
              name="statusPaket"
              value={formData.statusPaket}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="aktif">Aktif</option>
              <option value="non_aktif">Non Aktif</option>
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

export default PaketWisataForm;