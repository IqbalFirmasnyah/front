"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from "lucide-react";
import ImageUploadForm from "../../components/ImageUploadForm";
import { PaketWisata, DecodedToken } from "../../../types/PaketWisata";



type Props = {
  paketId: number;
};

export default function ImageUploadPageClient({ paketId }: Props) {
  const router = useRouter();

  const [paketData, setPaketData] = useState<PaketWisata | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [loggedInUser, setLoggedInUser] = useState<DecodedToken | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getToken = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthError("Token tidak ditemukan. Silakan login kembali.");
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return token;
  }, [router]);

  useEffect(() => {
    const checkAuth = () => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const token = getToken();
        const decoded: DecodedToken = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          throw new Error("Sesi Anda telah berakhir.");
        }
        setLoggedInUser(decoded);
      } catch (err: any) {
        setAuthError(err?.message || "Token tidak valid.");
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [getToken, router]);

  const fetchPaketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/${paketId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 404) {
          setError("Paket wisata tidak ditemukan.");
        } else if (res.status === 401 || res.status === 403) {
          throw new Error("Akses tidak diizinkan. Silakan login kembali.");
        } else {
          throw new Error(json?.message || "Gagal mengambil data paket.");
        }
        return;
      }

      setPaketData(json.data);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [paketId, getToken]);

  useEffect(() => {
    if (!authLoading && !authError && loggedInUser) {
      fetchPaketData();
    }
  }, [authLoading, authError, loggedInUser, fetchPaketData]);

  const handleImageUpload = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setError(null);
      try {
        const token = getToken();
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/upload-images/${paketId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          const msg = Array.isArray(json?.message)
            ? json.message.join(", ")
            : json?.message || json?.error || "Gagal mengunggah gambar.";
          throw new Error(msg);
        }

        setPaketData(json.data);
        alert("Gambar berhasil diunggah!");
      } catch (err: any) {
        setError(err?.message || "Gagal mengunggah gambar.");
      } finally {
        setUploading(false);
      }
    },
    [paketId, getToken]
  );

  const handleDeleteExistingImage = useCallback(
    async (imageName: string) => {
      if (!window.confirm(`Apakah Anda yakin ingin menghapus gambar ${imageName}?`)) return;

      setUploading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/delete-image/${paketId}?imageName=${encodeURIComponent(imageName)}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();
        if (!res.ok) {
          const msg = Array.isArray(json?.message)
            ? json.message.join(", ")
            : json?.message || json?.error || "Gagal menghapus gambar.";
          throw new Error(msg);
        }

        setPaketData(json.data);
        alert("Gambar berhasil dihapus!");
      } catch (err: any) {
        setError(err?.message || "Gagal menghapus gambar.");
      } finally {
        setUploading(false);
      }
    },
    [paketId, getToken]
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Memuat data...</p>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-8">
        <p className="text-xl font-semibold mb-4">Error!</p>
        <p className="text-lg text-center">{authError || error}</p>
        <button
          onClick={() => router.push("/admin/paket-wisata")}
          className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Paket
        </button>
      </div>
    );
  }

  if (!paketData) return null;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Gambar Paket Wisata</h1>
        <button
          onClick={() => router.push("/admin/paket-wisata")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 flex items-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </button>
      </div>

      <ImageUploadForm
        paketId={paketData.paketId}
        paketName={paketData.namaPaket}
        existingImages={paketData.images || []}
        isLoading={uploading}
        onUpload={handleImageUpload}
        onDeleteExisting={handleDeleteExistingImage}
      />

      {uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl">
            <p className="text-lg font-semibold text-indigo-600">Sedang memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
}
