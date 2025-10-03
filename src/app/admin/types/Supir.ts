// src/admin/types/Supir.ts (Buat folder dan file ini jika belum ada)

// Mirip dengan CreateSupirDto, tetapi dengan ID dan timestamp dari database
export interface Supir {
    supirId: number;
    nama: string;
    alamat: string;
    nomorHp: string;
    nomorSim: string;
    fotoSupir: string | null; // Bisa null jika opsional
    pengalamanTahun: number;
    ratingRata: number | null; // Pastikan ini number di frontend
    statusSupir: 'tersedia' | 'bertugas' | 'off'; // Gunakan string literal untuk konsistensi
    createdAt: string; // Asumsikan ada di response dari backend
    updatedAt: string; // Asumsikan ada di response dari backend
  }
  
  // Enum untuk status supir di frontend (untuk filter/dropdown)
  export type StatusSupir = 'tersedia' | 'bertugas' | 'off';
  
  // Untuk Pagination (jika service Supir juga mengembalikan meta)
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }