// src/types/Fasilitas.ts

// Enum for facility types, matching the backend
export enum JenisFasilitasEnum {
    PAKET_LUAR_KOTA = 'paket_luar_kota',
    CUSTOM = 'custom',
    DROPOFF = 'dropoff',
  }
  
  // Interface for a single Detail Rute
  export interface DetailRuteLuarKota {
    ruteId?: number;
    urutanKe: number;
    namaDestinasi: string;
    alamatDestinasi: string;
    jarakDariSebelumnyaKm: number;
    estimasiWaktuTempuh: number;
    waktuKunjunganMenit: number;
    deskripsiSingkat?: string | null;
  }
  
  // Interface for a single Paket Wisata Luar Kota (response from API)
  export interface PaketWisataLuarKota {
    paketLuarKotaId: number;
    namaPaket: string;
    tujuanUtama: string;
    totalJarakKm: number;
    images: string[];
    estimasiDurasi: number;
    hargaEstimasi: number; // API response will return this as a number
    statusPaket: 'aktif' | 'non_aktif';
    pilihTanggal: string; // ISO string for the frontend form
    createdAt: string;
    updatedAt: string;
    detailRute: DetailRuteLuarKota[]; // Add this to the response interface
  }
  
  // Main interface for a Fasilitas object (response from API)
  export interface Fasilitas {
    fasilitasId: number;
    jenisFasilitas: JenisFasilitasEnum;
    namaFasilitas: string;
    deskripsi: string | null;
    createdAt: string;
    updatedAt: string;
    paketLuarKotaId: number | null;
    paketLuarKota?: PaketWisataLuarKota | null;
    dropoff?: any;
    customRute?: any[];
  }
  
  // DTO for creating a new Paket Wisata Luar Kota (for form submission)
  export interface CreatePaketWisataLuarKotaDto {
    namaPaket: string;
    tujuanUtama: string;
    totalJarakKm: number;
    estimasiDurasi: number;
    hargaEstimasi: string; // Matches backend DTO @IsDecimal(..., '0,2')
    statusPaket: 'aktif' | 'non_aktif';
    pilihTanggal: string; // Required date string for backend validation
    detailRute: DetailRuteLuarKota[];
  }
  
  // DTO for creating a new Fasilitas (for form submission)
  export interface CreateFasilitasDto {
    jenisFasilitas: JenisFasilitasEnum;
    namaFasilitas: string;
    deskripsi?: string;
    supirId?: number;
    armadaId?: number;
    paketLuarKota?: CreatePaketWisataLuarKotaDto;
  }
  
  // For pagination metadata
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }