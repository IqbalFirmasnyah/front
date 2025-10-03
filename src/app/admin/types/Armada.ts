// src/admin/types/Armada.ts (Buat folder dan file ini jika belum ada)

// Mirip dengan CreateArmadaDto, tetapi dengan ID dan timestamp dari database
export interface Armada {
    armadaId: number;
    jenisMobil: string;
    merkMobil: string;
    platNomor: string;
    kapasitas: number;
    tahunKendaraan: number;
    statusArmada: 'tersedia' | 'digunakan' | 'maintenance'; // Gunakan string literal untuk konsistensi
    fotoArmada: string | null; // Bisa null jika opsional
    createdAt: string; // Asumsikan ada di response dari backend
    updatedAt: string; // Asumsikan ada di response dari backend
  }
  
  // Enum untuk status armada di frontend (untuk filter/dropdown)
  export type StatusArmada = 'tersedia' | 'digunakan' | 'maintenance';
  
  // Untuk Pagination (jika service Armada juga mengembalikan meta)
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }