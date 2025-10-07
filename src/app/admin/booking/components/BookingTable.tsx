"use client";

import React, { useState } from 'react';
import { Booking, Meta, BookingStatus as BookingStatusType } from '../../types/Booking';
import { useRouter } from 'next/navigation';

// Import komponen Shadcn UI yang diperlukan
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, // Ganti DropdownMenuCheckboxItem menjadi DropdownMenuItem
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from 'lucide-react'; // Menggunakan ikon Lucide

// Interface untuk Reschedule
export interface Reschedule {
  status: string;
  rescheduleId: number;
  tanggalBaru: string;
  alasan: string;
  createdAt: string;
}

interface BookingTableProps {
  bookings: Booking[];
  meta: Meta;
  onEdit: (booking: Booking) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, newStatus: BookingStatusType) => void;
  onUpdateRescheduleStatus: (rescheduleId: number, newStatus: 'approved' | 'rejected', bookingId: number) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: BookingStatusType; search?: string }) => void;
  currentFilters: { status?: BookingStatusType; search?: string };
}

// Opsi status booking
const statusOptions: BookingStatusType[] = [
    'waiting approve admin', 'pending_payment', 'payment_CONFIRMED', 'confirmed', 'expired', 'cancelled'
];

// ********************************************
// StatusDropdown BARU menggunakan Shadcn UI
// ********************************************
interface StatusDropdownProps {
    bookingId: number;
    currentStatus: BookingStatusType;
    onUpdate: (id: number, newStatus: BookingStatusType) => void;
}

const formatStatusLabel = (status: string) => status.replace(/_/g, ' ');

const ShadcnStatusDropdown: React.FC<StatusDropdownProps> = ({ bookingId, currentStatus, onUpdate }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 text-xs flex items-center" // Custom styling untuk menyesuaikan ukuran tabel
                >
                    {formatStatusLabel(currentStatus)}
                    <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-50">
                <DropdownMenuLabel>Ubah Status Booking</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statusOptions.map((status) => (
                    <DropdownMenuItem
                        key={status}
                        // Jika menggunakan CheckboxItem, Anda perlu mengelola state 'checked'
                        // Menggunakan DropdownMenuItem lebih cocok untuk aksi update status
                        onSelect={() => onUpdate(bookingId, status)}
                        className={`capitalize text-sm cursor-pointer ${
                            status === currentStatus ? 'bg-blue-50 font-semibold text-blue-700' : ''
                        }`}
                    >
                        {formatStatusLabel(status)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  meta,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdateRescheduleStatus,
  onPageChange,
  onFilterChange,
  currentFilters,
}) => {
  const router = useRouter();
  const [expandedReschedules, setExpandedReschedules] = useState<Set<number>>(new Set());
  
  // ... (Fungsi toggleRescheduleDetails, handleFilterChange, handleSearchChange)

  const toggleRescheduleDetails = (bookingId: number) => {
    const newExpanded = new Set(expandedReschedules);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedReschedules(newExpanded);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    onFilterChange({ ...currentFilters, [e.target.name]: e.target.value === '' ? undefined : e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeout(() => {
        onFilterChange({ ...currentFilters, search: value === '' ? undefined : value });
    }, 300);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Booking</h2>
        <div className="flex space-x-2">
          {/* Filter Status (menggunakan Select, tapi styling Shadcn) */}
          <select
            name="status"
            value={currentFilters.status || ''}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status} className="capitalize">
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="search"
            defaultValue={currentFilters.search || ''}
            onChange={handleSearchChange}
            placeholder="Cari kode booking..."
            className="border border-gray-300 rounded-md p-2 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-600 text-center py-4">Tidak ada booking ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="py-3 px-4 border-b">ID</th>
                <th className="py-3 px-4 border-b">Kode Booking</th>
                <th className="py-3 px-4 border-b">Pelanggan</th>
                <th className="py-3 px-4 border-b">Detail Layanan</th>
                <th className="py-3 px-4 border-b">Tgl Mulai</th>
                <th className="py-3 px-4 border-b">Harga</th>
                <th className="py-3 px-4 border-b">Status</th>
                <th className="py-3 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const hasPendingReschedule = (booking.reschedules ?? []).some(r => r.status === 'pending');
                const hasReschedules = (booking.reschedules ?? []).length > 0;
                const isExpanded = expandedReschedules.has(booking.bookingId);
                const pendingReschedule = (booking.reschedules ?? []).find(r => r.status === 'pending');

                return (
                  <React.Fragment key={booking.bookingId}>
                    <tr className="hover:bg-gray-50 text-sm text-gray-800">
                      <td className="py-3 px-4 border-b">{booking.bookingId}</td>
                      <td className="py-3 px-4 border-b">{booking.kodeBooking}</td>
                      <td className="py-3 px-4 border-b">
                        {booking.user?.namaLengkap || 'N/A'} <br/>
                        <span className="text-xs text-gray-500">{booking.user?.email || ''}</span>
                      </td>
                      <td className="py-3 px-4 border-b text-xs">
                        {booking.paket && (
                            <>
                                <strong>Paket:</strong> {booking.paket.namaPaket} ({booking.paket.lokasi})
                            </>
                        )}
                        {booking.paketLuarKota && (
                            <>
                                <strong>PLK:</strong> {booking.paketLuarKota.namaPaket} ({booking.paketLuarKota.tujuanUtama})
                            </>
                        )}
                        {booking.fasilitas && (
                            <>
                                <strong>Fasilitas:</strong> {booking.fasilitas.namaFasilitas} ({booking.fasilitas.jenisFasilitas.replace(/_/g, ' ').toLowerCase()})
                            </>
                        )}
                        {!booking.paket && !booking.paketLuarKota && !booking.fasilitas && 'Custom/Lainnya'}
                        <br/>
                        {booking.supir && <span className="text-gray-600">Supir: {booking.supir.nama}</span>}
                        {booking.armada && <span className="text-gray-600"> | Armada: {booking.armada.platNomor}</span>}
                      </td>
                      <td className="py-3 px-4 border-b">{new Date(booking.tanggalMulaiWisata).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-4 border-b">Rp {parseFloat(booking.estimasiHarga).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.statusBooking === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.statusBooking === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                              booking.statusBooking === 'payment_CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              booking.statusBooking === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            } capitalize`}
                          >
                            {formatStatusLabel(booking.statusBooking)}
                          </span>
                          {hasPendingReschedule && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 animate-pulse">
                              Reschedule
                            </span>
                          )}
                          {hasReschedules && (
                            <button
                              onClick={() => toggleRescheduleDetails(booking.bookingId)}
                              className="text-blue-600 hover:text-blue-800 text-xs underline"
                            >
                              {isExpanded ? 'Sembunyikan' : 'Lihat'} Reschedule ({booking.reschedules?.length})
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex flex-col space-y-2 items-start">
                          
                          {/* 1. Dropdown Status (Menggunakan Shadcn UI) */}
                          <div className="flex space-x-2 items-center">
                            <ShadcnStatusDropdown
                                bookingId={booking.bookingId}
                                currentStatus={booking.statusBooking}
                                onUpdate={onUpdateStatus}
                            />
                            
                            <Button
                              onClick={() => onDelete(booking.bookingId)}
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:bg-red-50 hover:text-red-800 h-7 w-7" // Styling disesuaikan dengan Button Shadcn
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {/* 2. Aksi Tinjau Reschedule (Tombol Lebih Jelas) */}
                          {hasPendingReschedule && pendingReschedule && (
                            <div className="flex space-x-2 items-center mt-2 p-1 bg-purple-50 rounded-md border border-purple-200">
                                <span className="text-xs font-medium text-purple-700">Tinjau Reschedule:</span>
                                <Button
                                    onClick={() => onUpdateRescheduleStatus(pendingReschedule.rescheduleId, 'approved', booking.bookingId)}
                                    className="h-6 px-2 text-xs"
                                >
                                    Setuju
                                </Button>
                                <Button
                                    onClick={() => onUpdateRescheduleStatus(pendingReschedule.rescheduleId, 'rejected', booking.bookingId)}
                                    className="h-6 px-2 text-xs"
                                    variant="destructive"
                                >
                                    Tolak
                                </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Reschedule Details Row - Konten tetap sama */}
                    {isExpanded && hasReschedules && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="py-4 px-4 border-b">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-700 mb-3">Riwayat Reschedule:</h4>
                            {booking.reschedules?.map((reschedule, index) => (
                              <div key={reschedule.rescheduleId} className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-600">Status:</span>
                                    <div className="mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(reschedule.status)}`}>
                                        {reschedule.status === 'pending' ? 'Menunggu' : 
                                         reschedule.status === 'approved' ? 'Disetujui' : 
                                         reschedule.status === 'rejected' ? 'Ditolak' : reschedule.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Tanggal Baru:</span>
                                    <div className="mt-1 text-gray-800">
                                      {formatDate(reschedule.tanggalBaru)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">Tanggal Pengajuan:</span>
                                    <div className="mt-1 text-gray-800">
                                      {formatDate(reschedule.createdAt)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-600">ID Reschedule:</span>
                                    <div className="mt-1 text-gray-800">
                                      #{reschedule.rescheduleId}
                                    </div>
                                  </div>
                                </div>
                                {reschedule.alasan && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <span className="font-medium text-gray-600">Alasan:</span>
                                    <div className="mt-1 text-gray-800 bg-gray-50 p-2 rounded text-sm">
                                      {reschedule.alasan}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Quick Action for Pending Reschedules (Tombol menggunakan Button Shadcn) */}
                                {reschedule.status === 'pending' && !pendingReschedule && ( 
                                  <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                                    <Button
                                      onClick={() => onUpdateRescheduleStatus(reschedule.rescheduleId, 'approved', booking.bookingId)}
                                      className="h-7 px-3 text-xs"
                                    >
                                      Setujui
                                    </Button>
                                    <Button
                                      onClick={() => onUpdateRescheduleStatus(reschedule.rescheduleId, 'rejected', booking.bookingId)}
                                      className="h-7 px-3 text-xs"
                                      variant="destructive"
                                    >
                                      Tolak
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() => onPageChange(meta.page - 1)}
            disabled={meta.page === 1}
            variant="outline"
          >
            Previous
          </Button>
          {[...Array(meta.totalPages)].map((_, i) => (
            <Button
              key={i}
              onClick={() => onPageChange(i + 1)}
              variant={meta.page === i + 1 ? 'default' : 'outline'}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            onClick={() => onPageChange(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingTable;