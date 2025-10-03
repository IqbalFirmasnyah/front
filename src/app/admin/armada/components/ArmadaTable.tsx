// app/admin/armada/components/ArmadaTable.tsx
import React from "react";
import { Armada, Meta, StatusArmada } from "../../types/Armada"; // Sesuaikan path

interface ArmadaTableProps {
  armadas: Armada[];
  meta: Meta;
  onEdit: (armada: Armada) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: StatusArmada; search?: string }) => void;
  currentFilters: { status?: StatusArmada; search?: string };
  onUploadImage: (armada: Armada) => void;
}

const ArmadaTable: React.FC<ArmadaTableProps> = ({
  armadas,
  meta,
  onEdit,
  onDelete,
  onPageChange,
  onFilterChange,
  currentFilters,
  onUploadImage,
}) => {
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    onFilterChange({
      ...currentFilters,
      [e.target.name]: e.target.value === "" ? undefined : e.target.value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeout(() => {
      onFilterChange({
        ...currentFilters,
        search: value === "" ? undefined : value,
      });
    }, 300); // 300ms debounce
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Armada</h2>
        <div className="flex space-x-2">
          <select
            name="status"
            value={currentFilters.status || ""}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="digunakan">Digunakan</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <input
            type="text"
            name="search"
            defaultValue={currentFilters.search || ""}
            onChange={handleSearchChange}
            placeholder="Cari armada..."
            className="border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
      </div>

      {armadas.length === 0 ? (
        <p className="text-gray-600 text-center py-4">
          Tidak ada armada ditemukan.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="py-3 px-4 border-b">ID</th>
                <th className="py-3 px-4 border-b">Jenis Mobil</th>
                <th className="py-3 px-4 border-b">Merk</th>
                <th className="py-3 px-4 border-b">Plat Nomor</th>
                <th className="py-3 px-4 border-b">Kapasitas</th>
                <th className="py-3 px-4 border-b">Tahun</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {armadas.map((armada) => (
                <tr
                  key={armada.armadaId}
                  className="hover:bg-gray-50 text-sm text-gray-800"
                >
                  <td className="py-3 px-4 border-b">{armada.armadaId}</td>
                  <td className="py-3 px-4 border-b">{armada.jenisMobil}</td>
                  <td className="py-3 px-4 border-b">{armada.merkMobil}</td>
                  <td className="py-3 px-4 border-b">{armada.platNomor}</td>
                  <td className="py-3 px-4 border-b">{armada.kapasitas}</td>
                  <td className="py-3 px-4 border-b">
                    {armada.tahunKendaraan}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        armada.statusArmada === "tersedia"
                          ? "bg-green-100 text-green-800"
                          : armada.statusArmada === "digunakan"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      } capitalize`}
                    >
                      {armada.statusArmada}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(armada)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l4 4m-4-4l-9 9V18h4l9-9c1.66-1.66 1.66-4.37 0-6.03l-.12-.12a4.243 4.243 0 00-6.03 0z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(armada.armadaId)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => onUploadImage(armada)}
                        className="text-blue-600 hover:text-blue-800 transition duration-150 p-1 flex items-center justify-center"
                        title="Unggah Foto"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          ></path>
                        </svg>
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
                meta.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
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

export default ArmadaTable;
