// src/admin/types/Booking.ts

// Enum untuk status booking di frontend (untuk filter/dropdown)
// Sesuaikan dengan enum BookingStatus dari Prisma Client atau backend Anda
export type BookingStatus = 'waiting approve admin' | 'pending_payment' | 'payment_CONFIRMED' | 'confirmed' | 'expired' | 'cancelled';

export interface Reschedule {
  status: string;
  rescheduleId: number;
  tanggalBaru: string;
  alasan: string;
  createdAt: string;
}
export interface Booking {
  bookingId: number;
  userId: number;
  paketId: number | null;
  paketLuarKotaId: number | null;
  fasilitasId: number | null;
  supirId: number;
  armadaId: number;
  kodeBooking: string;
  tanggalBooking: string; // ISO string
  tanggalMulaiWisata: string; // ISO string
  tanggalSelesaiWisata: string; // ISO string
  jumlahPeserta: number;
  estimasiHarga: string; // Prisma.Decimal akan menjadi string di JSON
  inputCustomTujuan: string | null;
  statusBooking: BookingStatus;
  catatanKhusus: string | null;
  expiredAt: string; // ISO string
  createdAt: string;
  updatedAt: string;

  // Sertakan relasi yang di-include dari backend (untuk tampilan)
  user?: { // Pilih field yang relevan untuk user
    userId: number;
    username: string;
    namaLengkap: string;
    email: string;
  };
  paket?: { // Pilih field yang relevan untuk paket wisata dalam kota
    paketId: number;
    namaPaket: string;
    lokasi: string;
  };
  paketLuarKota?: { // Pilih field yang relevan untuk paket wisata luar kota
    paketLuarKotaId: number;
    namaPaket: string;
    tujuanUtama: string;
  };
  fasilitas?: { // Pilih field yang relevan untuk fasilitas
    fasilitasId: number;
    namaFasilitas: string;
    jenisFasilitas: string;
    // ... detail fasilitas lebih lanjut jika diperlukan
  };
  supir?: {
    supirId: number;
    nama: string;
    nomorHp: string;
  };
  armada?: {
    armadaId: number;
    jenisMobil: string;
    platNomor: string;
  };
  reschedules?: Reschedule[];
}

// Untuk Pagination
export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}