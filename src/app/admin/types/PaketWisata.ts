
export interface PaketWisata {
    paketId: number;
    namaPaket: string;
    namaTempat: string;
    lokasi: string;
    deskripsi: string;
    itinerary: string;
    jarakKm: number;
    images: string[];
    durasiHari: number; // Sesuaikan dengan tipe number dari backend
    pilihTanggal: string; // Tanggal dalam format ISO string dari backend
    harga: number; // Pastikan ini number di frontend
    fotoPaket: string | null; // Sesuaikan dengan nama properti dari backend
    kategori: 'dalam kota' | 'luar kota'; // Gunakan string literal atau enum
    statusPaket: 'aktif' | 'non_aktif'; // Gunakan string literal atau enum
    createdAt: string; // Asumsikan ada di response DTO
    updatedAt: string; // Asumsikan ada di response DTO
  }
  
  export type KategoriPaket = 'dalam kota' | 'luar kota';
  export type StatusPaket = 'aktif' | 'non_aktif';
  
  // Untuk pagination
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

  export interface DecodedToken {
    sub: number; // userId atau adminId
    username: string;
    role: string; // 'user', 'admin', 'superadmin'
    namaLengkap: string;
    adminRole?: string; // Hanya ada jika role adalah 'admin'
    exp: number; // Waktu kedaluwarsa (Unix timestamp)
  }