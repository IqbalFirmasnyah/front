"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { format } from "date-fns";
import Header from "@/app/components/Header";

// --- API CONFIGURATION ---
const API_BASE_URL = "http://localhost:3001";

// --- TYPES ---
interface BookingDetail {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
  paket?: { namaPaket: string };
  paketLuarKota?: { namaPaket: string };
  fasilitas?: { namaFasilitas: string };
}

interface CreateRescheduleDto {
  bookingId: number;
  tanggalBaru: string;
  alasan: string;
}

// --- FUNGSI VALIDASI BACK-END ---

/**
 * Memanggil endpoint validasi H-3 dan H+1 di backend.
 * Jika validasi gagal, fungsi ini akan melempar Error yang ditangkap di handleSubmit.
 */
const validateRescheduleApi = async (
  bookingId: number,
  tanggalBaru: string,
  token: string
) => {
  // Backend Anda (RescheduleController) akan menerima tanggalBaru: string
  // dan mengubahnya menjadi Date object untuk validasi H-3 dan H+1.
  const res = await fetch(`${API_BASE_URL}/reschedule/validate/${bookingId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tanggalBaru: tanggalBaru,
    }),
  });

  const result = await res.json();

  if (!res.ok) {
    // Jika status 400 Bad Request, lempar pesan error dari backend
    const errorMessage = result.message || "Validasi reschedule gagal.";
    throw new Error(errorMessage);
  }

  return result; // Lolos validasi
};

// --- COMPONENT UTAMA ---
export default function RescheduleRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get("bookingId");

  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null
  );
  const [tanggalBaru, setTanggalBaru] = useState("");
  const [alasan, setAlasan] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingIdParam) {
        setError("ID booking tidak ditemukan.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/booking/${bookingIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal mengambil data booking.");
        }

        const data = await res.json();
        
        // Perbaikan untuk struktur respons API
        const bookingData = data.data || data; 

        if (!bookingData || !bookingData.bookingId) {
            throw new Error("Struktur data booking tidak valid atau data kosong.");
        }

        setBookingDetail(bookingData);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data booking.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingIdParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const trimmedAlasan = alasan.trim();
    
    // Validasi 1: Cek apakah data booking sudah ada
    if (!bookingDetail) {
      setError("Data booking belum selesai dimuat. Mohon tunggu sebentar atau muat ulang halaman.");
      setSubmitLoading(false);
      return;
    }

    // Validasi 2: Cek input kosong
    if (!tanggalBaru || !trimmedAlasan) {
      setError("Tanggal baru dan alasan harus diisi.");
      setSubmitLoading(false);
      return;
    }

    const tanggalLama = new Date(bookingDetail.tanggalMulaiWisata);
    const tanggalBaruDate = new Date(tanggalBaru);

    // ⭐ CATATAN: Validasi ini sekarang memungkinkan reschedule ke Tgl Lama atau sebelumnya (T-1)
    // namun akan ditangkap oleh BACK-END jika melanggar H-3 pengajuan atau H+1 tanggal baru.
    // Validasi lokal ini hanya mencegah memilih tanggal di masa lalu absolut (sebelum hari ini).
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (tanggalBaruDate < today) {
         setError("Tanggal baru tidak boleh di masa lalu.");
         setSubmitLoading(false);
         return;
    }


    try {
      // ⭐ LANGKAH 1: VALIDASI H-3 dan H+1 dari BACK-END ⭐
      await validateRescheduleApi(bookingDetail.bookingId, tanggalBaru, token);

      const payload: CreateRescheduleDto = {
        bookingId: bookingDetail.bookingId,
        tanggalBaru,
        alasan: trimmedAlasan, // Gunakan alasan yang sudah di-trim untuk payload
      };

      // ⭐ LANGKAH 2: KIRIM PERMINTAAN RESCHEDULE (jika validasi lolos) ⭐
      const res = await fetch(`${API_BASE_URL}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal mengajukan reschedule.");
      }

      setSuccess(
        "Permintaan reschedule berhasil diajukan! Anda akan diarahkan kembali."
      );
      setTimeout(() => {
        router.push("/my-booking");
      }, 3000);
    } catch (err: any) {
      // Menangkap error dari validateRescheduleApi (H-3/H+1) atau error POST utama
      setError(err.message || "Terjadi kesalahan saat mengajukan reschedule.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Memuat detail booking...</span>
      </div>
    );
  }

  // Jika error diset DAN bookingDetail null (kasus gagal total fetch)
  if (error && !bookingDetail) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  // Menampilkan fallback error jika gagal mendapatkan data namun tidak ada error (kasus struktur data invalid)
  if (!bookingDetail && !loading && !error) {
     return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg border border-gray-200">
                <p className="text-red-500 font-medium">Gagal memuat detail booking.</p>
                <p className="text-gray-500 mt-2">Pastikan booking ID valid dan Anda sudah login. Silakan kembali dan coba lagi.</p>
                <Button onClick={() => router.back()} className="mt-4">
                  Kembali
                </Button>
            </div>
        </div>
    );
  }


  const originalItemName =
    bookingDetail?.paket?.namaPaket ||
    bookingDetail?.paketLuarKota?.namaPaket ||
    bookingDetail?.fasilitas?.namaFasilitas ||
    "Tidak Dikenal";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 max-w-2xl mx-auto px-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Ajukan Reschedule
        </h1>

        {/* Kontainer form hanya dirender jika bookingDetail ada */}
        {bookingDetail && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Detail Booking Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <strong>Kode Booking:</strong> {bookingDetail.kodeBooking}
                    </div>
                    <div>
                      <strong>Layanan:</strong> {originalItemName}
                    </div>
                    <div>
                      <strong>Tanggal Asli:</strong>{" "}
                      {format(
                        new Date(bookingDetail.tanggalMulaiWisata),
                        "dd/MM/yyyy"
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(bookingDetail.tanggalSelesaiWisata),
                        "dd/MM/yyyy"
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-8 shadow-lg rounded-lg space-y-6 border border-gray-200"
              >
                <div>
                  <Label
                    htmlFor="tanggalBaru"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tanggal Baru yang Diajukan
                  </Label>
                  <Input
                    type="date"
                    id="tanggalBaru"
                    value={tanggalBaru}
                    onChange={(e) => setTanggalBaru(e.target.value)}
                    className="w-full"
                    required
                    // ⭐ PERUBAHAN: Set MIN hanya ke tanggal HARI INI
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="alasan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alasan Pengajuan Reschedule
                  </Label>
                  <Textarea
                    id="alasan"
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    rows={4}
                    className="w-full"
                    required
                    placeholder="Jelaskan alasan Anda mengajukan reschedule..."
                  />
                </div>

                {error && (
                  <div className="flex items-center justify-center p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <p className="text-green-600 text-sm text-center">{success}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  // Tombol hanya disabled saat submit loading, mengandalkan validasi JS
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengajukan...
                    </>
                  ) : (
                    "Ajukan Reschedule"
                  )}
                </Button>
              </form>
            </>
        )}
      </main>
      <footer className="bg-gray-100 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jelajah Tour & Travel. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
