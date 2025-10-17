"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking, Meta, BookingStatus as BookingStatusType } from "../../types/Booking";

import {
  Search,
  Filter,
  Edit,
  Trash2,
  UploadCloud,
  Hash,
  Tag,
  MapPin,
  Banknote,
  Clock,
  CheckCircle2,
  CircleSlash,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  User,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

// ==============================
// Types
// ==============================
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
  onUpdateRescheduleStatus: (
    rescheduleId: number,
    newStatus: "approved" | "rejected",
    bookingId: number
  ) => void;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { status?: BookingStatusType; search?: string }) => void;
  currentFilters: { status?: BookingStatusType; search?: string };
}

// ==============================
// Constants & Helpers
// ==============================
const statusOptions: BookingStatusType[] = [
  "waiting approve admin",
  "pending_payment",
  "confirmed",
  "expired",
  "cancelled",
];

const formatStatusLabel = (status: string) => status.replace(/_/g, " ");

const getRescheduleBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Icon Button util (identik gaya dengan PaketWisataTable)
const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "blue" | "red" | "indigo" | "zinc" }
> = ({ tone = "blue", className = "", children, ...props }) => {
  const toneMap = {
    blue: "text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus-visible:outline-blue-600",
    red: "text-red-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-red-600",
    indigo:
      "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 focus-visible:outline-indigo-600",
    zinc: "text-zinc-600 hover:text-zinc-700 hover:bg-zinc-50 focus-visible:outline-zinc-600",
  } as const;
  return (
    <button
      {...props}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${toneMap[tone]} ${className}`}
    >
      {children}
    </button>
  );
};

// Dropdown status (shadcn), kecil & rapi
const StatusDropdown: React.FC<{
  bookingId: number;
  currentStatus: BookingStatusType;
  onUpdate: (id: number, newStatus: BookingStatusType) => void;
}> = ({ bookingId, currentStatus, onUpdate }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          {formatStatusLabel(currentStatus)}
          <ChevronDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 z-50">
        <DropdownMenuLabel>Ubah Status Booking</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statusOptions.map((status) => (
          <DropdownMenuItem
            key={status}
            onSelect={() => onUpdate(bookingId, status)}
            className={`capitalize text-sm cursor-pointer ${
              status === currentStatus ? "bg-blue-50 font-semibold text-blue-700" : ""
            }`}
          >
            {formatStatusLabel(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ==============================
// Main Table (identik gaya PaketWisataTable)
// ==============================
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
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedReschedules, setExpandedReschedules] = useState<Set<number>>(new Set());

  const toggleRescheduleDetails = (bookingId: number) => {
    const next = new Set(expandedReschedules);
    if (next.has(bookingId)) next.delete(bookingId);
    else next.add(bookingId);
    setExpandedReschedules(next);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    onFilterChange({
      ...currentFilters,
      [name]: value === "" ? undefined : (value as any),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({
        ...currentFilters,
        search: value === "" ? undefined : value,
      });
    }, 350);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Header + Filters (identik pattern) */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
            <Tag className="h-5 w-5" />
          </div>
        <div>
            <h2 className="text-lg font-semibold text-zinc-900">Daftar Booking</h2>
            <p className="text-xs text-zinc-500">Kelola status, reschedule, dan aksi lainnya.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              name="search"
              defaultValue={currentFilters.search || ""}
              onChange={handleSearchChange}
              placeholder="Cari kode/username…"
              className="w-full rounded-xl border border-zinc-300 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-72"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <select
              name="status"
              value={currentFilters.status || ""}
              onChange={handleFilterChange}
              className="w-full appearance-none rounded-xl border border-zinc-300 py-2 pl-9 pr-8 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:w-48"
            >
              <option value="">Semua Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {formatStatusLabel(s)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada booking ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[13px] font-semibold text-zinc-600">
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Kode Booking
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pelanggan
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Detail Layanan
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Tgl Mulai
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Harga
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-4 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking, idx) => {
                const hasReschedules = (booking.reschedules ?? []).length > 0;
                const isExpanded = expandedReschedules.has(booking.bookingId);
                const pendingReschedule = (booking.reschedules ?? []).find((r) => r.status === "pending");

                return (
                  <React.Fragment key={booking.bookingId}>
                    <tr
                      className={`
                        text-sm text-zinc-800 transition-colors
                        ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}
                        hover:bg-blue-50/40
                      `}
                    >
                      <td className="border-t border-zinc-200 px-4 py-3">{booking.bookingId}</td>
                      <td className="border-t border-zinc-200 px-4 py-3 font-medium">
                        {booking.kodeBooking}
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3">
                        <div className="leading-tight">
                          <div className="font-medium">{booking.user?.namaLengkap || "N/A"}</div>
                          <div className="text-xs text-zinc-500">{booking.user?.email || ""}</div>
                        </div>
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3 text-xs">
                        {booking.paket && (
                          <>
                            <strong>Paket:</strong> {booking.paket.namaPaket} ({booking.paket.lokasi})
                          </>
                        )}
                        {booking.paketLuarKota && (
                          <>
                            {booking.paket ? <><br /></> : null}
                            <strong>PLK:</strong> {booking.paketLuarKota.namaPaket} (
                            {booking.paketLuarKota.tujuanUtama})
                          </>
                        )}
                        {booking.fasilitas && (
                          <>
                            {(booking.paket || booking.paketLuarKota) ? <><br /></> : null}
                            <strong>Fasilitas:</strong> {booking.fasilitas.namaFasilitas} (
                            {booking.fasilitas.jenisFasilitas.replace(/_/g, " ").toLowerCase()})
                          </>
                        )}
                        {!booking.paket && !booking.paketLuarKota && !booking.fasilitas && "Custom/Lainnya"}
                        <br />
                        {booking.supir && <span className="text-zinc-600">Supir: {booking.supir.nama}</span>}
                        {booking.armada && (
                          <span className="text-zinc-600"> | Armada: {booking.armada.platNomor}</span>
                        )}
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3">
                        {new Date(booking.tanggalMulaiWisata).toLocaleDateString("id-ID")}
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3">
                        Rp {parseFloat(booking.estimasiHarga).toLocaleString("id-ID")}
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Badge status booking */}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              booking.statusBooking === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.statusBooking === "pending_payment"
                                ? "bg-yellow-100 text-yellow-800"
                                : booking.statusBooking === "payment_CONFIRMED"
                                ? "bg-blue-100 text-blue-800"
                                : booking.statusBooking === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            } capitalize`}
                          >
                            {formatStatusLabel(booking.statusBooking)}
                          </span>

                          {/* Kalau ada reschedule pending, beri badge info */}
                          {(booking.reschedules ?? []).some((r) => r.status === "pending") && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              Reschedule pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border-t border-zinc-200 px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {/* Baris tombol: dropdown status + hapus (IDENTIK ikon button) */}
                          <div className="flex items-center gap-1.5">
                            <StatusDropdown
                              bookingId={booking.bookingId}
                              currentStatus={booking.statusBooking}
                              onUpdate={onUpdateStatus}
                            />
                            <IconButton
                              tone="red"
                              onClick={() => onDelete(booking.bookingId)}
                              title="Hapus booking"
                              aria-label={`Hapus booking ${booking.kodeBooking}`}
                            >
                              <Trash2 className="h-5 w-5" />
                            </IconButton>
                          </div>

                          {/* Tombol detail reschedule — ditempatkan DI BAWAH dropdown status */}
                          {hasReschedules && (
                            <button
                              onClick={() => toggleRescheduleDetails(booking.bookingId)}
                              className="self-start rounded-xl border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 transition"
                            >
                              {isExpanded ? "Sembunyikan" : "Lihat"} Reschedule (
                              {booking.reschedules?.length})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* DETAIL RESCHEDULE — tombol Setuju/Tolak hanya muncul di sini */}
                    {isExpanded && hasReschedules && (
                      <tr className={`${idx % 2 === 0 ? "bg-zinc-50/40" : "bg-white"}`}>
                        <td colSpan={8} className="px-4 py-4 border-t border-zinc-200">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-zinc-700">Riwayat Reschedule</h4>

                            {booking.reschedules?.map((r) => (
                              <div
                                key={r.rescheduleId}
                                className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
                              >
                                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                                  <div>
                                    <div className="text-zinc-600">Status</div>
                                    <div className="mt-1">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getRescheduleBadgeColor(
                                          r.status
                                        )}`}
                                      >
                                        {r.status === "pending"
                                          ? "Menunggu"
                                          : r.status === "approved"
                                          ? "Disetujui"
                                          : r.status === "rejected"
                                          ? "Ditolak"
                                          : r.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-zinc-600">Tanggal Baru</div>
                                    <div className="mt-1 text-zinc-800">{formatDateTime(r.tanggalBaru)}</div>
                                  </div>
                                  <div>
                                    <div className="text-zinc-600">Tanggal Pengajuan</div>
                                    <div className="mt-1 text-zinc-800">{formatDateTime(r.createdAt)}</div>
                                  </div>
                                  <div>
                                    <div className="text-zinc-600">ID Reschedule</div>
                                    <div className="mt-1 text-zinc-800">#{r.rescheduleId}</div>
                                  </div>
                                </div>

                                {r.alasan && (
                                  <div className="mt-3 border-t border-zinc-100 pt-3">
                                    <div className="text-zinc-600">Alasan</div>
                                    <div className="mt-1 rounded bg-zinc-50 p-2 text-sm text-zinc-800">
                                      {r.alasan}
                                    </div>
                                  </div>
                                )}

                                {/* Quick actions — HANYA di detail */}
                                {r.status === "pending" && (
                                  <div className="mt-3 border-t border-zinc-100 pt-3 flex gap-2">
                                    <Button
                                      onClick={() =>
                                        onUpdateRescheduleStatus(
                                          r.rescheduleId,
                                          "approved",
                                          booking.bookingId
                                        )
                                      }
                                      className="h-8 px-3 text-xs"
                                    >
                                      Setujui
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        onUpdateRescheduleStatus(
                                          r.rescheduleId,
                                          "rejected",
                                          booking.bookingId
                                        )
                                      }
                                      className="h-8 px-3 text-xs"
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

      {/* Pagination (identik style) */}
      {meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, meta.page - 1))}
            disabled={meta.page === 1}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(meta.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`rounded-xl px-3 py-1.5 text-sm ${
                meta.page === i + 1
                  ? "bg-blue-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-50 border border-zinc-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))}
            disabled={meta.page === meta.totalPages}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
