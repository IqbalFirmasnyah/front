"use client"
import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { UploadCloud } from 'lucide-react'; // Import ikon untuk upload
import { PaketWisata, Meta, KategoriPaket, StatusPaket } from '../../types/PaketWisata'; 

interface PaketWisataTableProps {
  pakets: PaketWisata[];
  meta: Meta;
  onEdit: (paket: PaketWisata) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: StatusPaket) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { kategori?: KategoriPaket; status?: StatusPaket; search?: string }) => void;
  currentFilters: { kategori?: KategoriPaket; status?: StatusPaket; search?: string }; 
}

const PaketWisataTable: React.FC<PaketWisataTableProps> = ({
  pakets,
  meta,
  onEdit,
  onDelete,
  onUpdateStatus,
  onPageChange,
  onFilterChange,
  currentFilters,
}) => {
  const router = useRouter(); // Inisialisasi router untuk navigasi

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onFilterChange({ ...currentFilters, [e.target.name]: e.target.value === '' ? undefined : e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Debounce search input for better performance on large datasets
    const value = e.target.value;
    setTimeout(() => {
        onFilterChange({ ...currentFilters, search: value === '' ? undefined : value });
    }, 300); // 300ms debounce
  };

  const handleUploadClick = (paketId: number) => {
    // Navigasi ke halaman upload gambar
    router.push(`/admin/paket-wisata/upload/${paketId}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Paket Wisata</h2>
        <div className="flex space-x-2">
          <select
            name="kategori"
            value={currentFilters.kategori || ''}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Semua Kategori</option>
            <option value="dalam kota">Dalam Kota</option>
            <option value="luar kota">Luar Kota</option>
          </select>
          <select
            name="status"
            value={currentFilters.status || ''}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="non_aktif">Non Aktif</option>
          </select>
          <input
            type="text"
            name="search"
            defaultValue={currentFilters.search || ''} // Use defaultValue for debounced input
            onChange={handleSearchChange}
            placeholder="Cari paket..."
            className="border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
      </div>

      {pakets.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Tidak ada paket wisata ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="py-3 px-4 border-b">ID</th>
                <th className="py-3 px-4 border-b">Nama Paket</th>
                <th className="py-3 px-4 border-b">Kategori</th>
                <th className="py-3 px-4 border-b">Lokasi</th>
                <th className="py-3 px-4 border-b">Harga</th>
                <th className="py-3 px-4 border-b">Durasi</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pakets.map((paket) => (
                <tr key={paket.paketId} className="hover:bg-gray-50 text-sm text-gray-800">
                  <td className="py-3 px-4 border-b">{paket.paketId}</td>
                  <td className="py-3 px-4 border-b">{paket.namaPaket}</td>
                  <td className="py-3 px-4 border-b capitalize">{paket.kategori}</td>
                  <td className="py-3 px-4 border-b">{paket.lokasi}</td>
                  <td className="py-3 px-4 border-b">Rp {paket.harga.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4 border-b">{paket.durasiHari} Hari</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        paket.statusPaket === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-110 text-red-800'
                      } capitalize`}
                    >
                      {paket.statusPaket.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2 items-center">
                       {/* Tombol Upload Gambar */}
                       <button
                          onClick={() => handleUploadClick(paket.paketId)}
                          className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-100 transition duration-150"
                          title="Upload Gambar"
                        >
                          <UploadCloud className="w-5 h-5" />
                        </button>
                        
                      <button
                        onClick={() => onEdit(paket)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l4 4m-4-4l-9 9V18h4l9-9c1.66-1.66 1.66-4.37 0-6.03l-.12-.12a4.243 4.243 0 00-6.03 0z"></path></svg>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(paket.paketId, paket.statusPaket === 'aktif' ? 'non_aktif' : 'aktif')}
                        className={`text-sm rounded-full w-5 h-5 flex items-center justify-center ${
                            paket.statusPaket === 'aktif' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                        }`}
                        title={paket.statusPaket === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                      >
                        {paket.statusPaket === 'aktif' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(paket.paketId)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(meta.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-1 rounded-md ${
                meta.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PaketWisataTable;