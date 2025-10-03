"use client";

import React from 'react';
import { Fasilitas, Meta, JenisFasilitasEnum } from '../../types/Fasilitas';
import { Edit, Trash2, UploadCloud } from 'lucide-react'; // Import UploadCloud

interface FasilitasTableProps {
  fasilitas: Fasilitas[];
  meta: Meta;
  onEdit: (fasilitas: Fasilitas) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { jenis?: string; search?: string }) => void;
  currentFilters: { jenis?: string; search?: string };
  onUploadImage: (fasilitas: Fasilitas) => void; 
}

const FasilitasTable: React.FC<FasilitasTableProps> = ({
  fasilitas,
  meta,
  onEdit,
  onDelete,
  onPageChange,
  onFilterChange,
  currentFilters,
  onUploadImage,
}) => {
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onFilterChange({ ...currentFilters, [e.target.name]: e.target.value === '' ? undefined : e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeout(() => {
      onFilterChange({ ...currentFilters, search: value === '' ? undefined : value });
    }, 300);
  };

  const getJenisFasilitasBadge = (jenis: JenisFasilitasEnum) => {
    switch (jenis) {
      case JenisFasilitasEnum.PAKET_LUAR_KOTA:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Paket Wisata Luar Kota</span>;
      case JenisFasilitasEnum.CUSTOM:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Custom</span>;
      case JenisFasilitasEnum.DROPOFF:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Dropoff</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Lainnya</span>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Fasilitas</h2>
        <div className="flex space-x-2">
          <select
            name="jenis"
            value={currentFilters.jenis || ''}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Semua Jenis</option>
            <option value={JenisFasilitasEnum.PAKET_LUAR_KOTA}>Paket Wisata Luar Kota</option>
            <option value={JenisFasilitasEnum.CUSTOM}>Custom</option>
            <option value={JenisFasilitasEnum.DROPOFF}>Dropoff</option>
          </select>
          <input
            type="text"
            name="search"
            defaultValue={currentFilters.search || ''}
            onChange={handleSearchChange}
            placeholder="Cari fasilitas..."
            className="border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
      </div>

      {fasilitas.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Tidak ada fasilitas ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="py-3 px-4 border-b">ID</th>
                <th className="py-3 px-4 border-b">Nama Fasilitas</th>
                <th className="py-3 px-4 border-b">Jenis</th>
                <th className="py-3 px-4 border-b">Deskripsi</th>
                <th className="py-3 px-4 border-b">Tanggal Dibuat</th>
                <th className="py-3 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fasilitas.map((fas) => (
                <tr key={fas.fasilitasId} className="hover:bg-gray-50 text-sm text-gray-800">
                  <td className="py-3 px-4 border-b">{fas.fasilitasId}</td>
                  <td className="py-3 px-4 border-b">{fas.namaFasilitas}</td>
                  <td className="py-3 px-4 border-b">
                    {getJenisFasilitasBadge(fas.jenisFasilitas)}
                  </td>
                  <td className="py-3 px-4 border-b line-clamp-2 max-w-xs">{fas.deskripsi}</td>
                  <td className="py-3 px-4 border-b">{new Date(fas.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      {/* Tombol Edit */}
                      <button
                        onClick={() => onEdit(fas)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Data"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      {/* 3. TOMBOL UPLOAD GAMBAR (KHUSUS PAKET LUAR KOTA) */}
                      {fas.jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA && (
                         <button
                            onClick={() => onUploadImage(fas)}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Unggah Gambar Paket"
                          >
                            <UploadCloud className="w-5 h-5" />
                          </button>
                      )}

                      {/* Tombol Hapus */}
                      <button
                        onClick={() => onDelete(fas.fasilitasId)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus Fasilitas"
                      >
                        <Trash2 className="w-5 h-5" />
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

export default FasilitasTable;