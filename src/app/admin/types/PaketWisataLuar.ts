export interface PaketWisataLuarKota {
    detailRute: never[];
    fasilitasId: null;
    paketLuarKotaId: number;
    namaPaket: string;
    fotoPaketLuar:string[];
    tujuanUtama: string;
    totalJarakKm: number;
    estimasiDurasi: number; // in minutes
    hargaEstimasi: number; // Use number for frontend and handle Decimal in backend
    statusPaket: 'aktif' | 'non_aktif'; // Use string literal or enum
    pilihTanggal: string; // ISO string format from backend
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DetailRuteLuarKota {
    ruteId?: number; // Optional for creation
    urutanKe: number;
    namaDestinasi: string;
    alamatDestinasi: string;
    jarakDariSebelumnyaKm: number;
    estimasiWaktuTempuh: number; // in minutes
    waktuKunjunganMenit: number;
    deskripsiSingkat?: string | null;
  }

  export interface DecodedToken {
    sub: number; // userId atau adminId
    username: string;
    role: string; // 'user', 'admin', 'superadmin'
    namaLengkap: string;
    adminRole?: string; // Hanya ada jika role adalah 'admin'
    exp: number; // Waktu kedaluwarsa (Unix timestamp)
  }
  
  // For pagination metadata
  export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }