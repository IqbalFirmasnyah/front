"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
} from "react";
import { Trash2, UploadCloud, XCircle } from "lucide-react";

interface ImageUploadFormProps {
  paketId: number;
  paketName: string;
  existingImages: string[];
  isLoading: boolean;
  onUpload: (files: File[]) => Promise<void>;
  onDeleteExisting: (imageName: string) => Promise<void>;
}

const MAX_FILES = 20;      // batas per unggahan (sesuai FilesInterceptor)
const MAX_FILE_MB = 5;     // batas ukuran tiap file
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "${process.env.NEXT_PUBLIC_API_URL}";
const PUBLIC_DIR = "travel-images"; // ganti ke "package-images" jika khusus paket Luar Kota

type Preview = { name: string; url: string; isNew: boolean };

export default function ImageUploadForm({
  paketId,
  paketName,
  existingImages,
  isLoading,
  onUpload,
  onDeleteExisting,
}: ImageUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ---- Helpers ----
  const makeError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const isImage = (f: File) => f.type.startsWith("image/");
  const isAllowedSize = (f: File) => f.size <= MAX_FILE_MB * 1024 * 1024;

  const asKey = (f: File) => `${f.name}_${f.size}`;

  // ---- File add logic (from input / drop) ----
  const addFiles = useCallback(
    (files: File[]) => {
      setError(null);
      if (!files.length) return;

      // Filter gambar + ukuran
      const invalidType = files.find((f) => !isImage(f));
      if (invalidType) {
        makeError("Hanya file gambar yang diizinkan (JPEG/PNG/GIF, dll.).");
        return;
      }
      const tooBig = files.find((f) => !isAllowedSize(f));
      if (tooBig) {
        makeError(`Ukuran tiap file maks. ${MAX_FILE_MB}MB.`);
        return;
      }

      // Cegah duplikat (berdasarkan nama+ukuran)
      const currentKeys = new Set(selectedFiles.map(asKey));
      const unique = files.filter((f) => !currentKeys.has(asKey(f)));

      // Batasi total per unggahan
      const total = selectedFiles.length + unique.length;
      if (total > MAX_FILES) {
        makeError(
          `Maksimal ${MAX_FILES} file per unggahan. Anda memilih ${unique.length} file baru, total menjadi ${total}.`
        );
        return;
      }

      // Buat preview URL
      const newUrls = unique.map((f) => URL.createObjectURL(f));

      setSelectedFiles((prev) => [...prev, ...unique]);
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    },
    [selectedFiles]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    // reset input agar file yang sama bisa dipilih ulang nanti
    e.target.value = "";
  };

  // ---- Drag & Drop ----
  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  // ---- Remove / Clear ----
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      // bersihkan objectURL untuk yang dihapus
      const toRevoke = prev[index];
      if (toRevoke) URL.revokeObjectURL(toRevoke);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllSelected = () => {
    // bersihkan semua URL preview
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  // ---- Submit ----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      makeError("Pilih minimal satu gambar untuk diunggah.");
      return;
    }
    await onUpload(selectedFiles);
    clearAllSelected();
  };

  // ---- Cleanup on unmount ----
  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Render lists ----
  const filePreviews = useMemo<Preview[]>(
    () =>
      previewUrls.map((url, i) => ({
        name: selectedFiles[i]?.name ?? `baru-${i + 1}`,
        url,
        isNew: true,
      })),
    [selectedFiles, previewUrls]
  );

  const existingPreviews = useMemo<Preview[]>(
    () =>
      (existingImages ?? []).map((name) => ({
        name,
        // kalau API kirim full URL, pakai langsung; kalau tidak, build dari base
        url: name.includes("://")
          ? name
          : `${API_BASE}/public/${PUBLIC_DIR}/${encodeURIComponent(name)}`,
        isNew: false,
      })),
    [existingImages]
  );

  const allImages = useMemo(
    () => [...existingPreviews, ...filePreviews],
    [existingPreviews, filePreviews]
  );

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 sm:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1">
        Upload Gambar untuk {paketName}
      </h2>
      <p className="text-gray-500 mb-6">Paket ID: {paketId}</p>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center"
          role="alert"
        >
          <XCircle className="w-5 h-5 mr-3 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Upload area */}
      <form onSubmit={handleSubmit} className="mb-8">
        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "flex flex-col items-center justify-center cursor-pointer rounded-lg border-2 border-dashed p-6 sm:p-8 transition",
            dragOver ? "border-indigo-500 bg-indigo-50" : "border-indigo-300 bg-indigo-50/60",
            isLoading ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
          <span className="text-base sm:text-lg font-semibold text-indigo-600">
            Klik untuk memilih atau tarik-lepas file gambar
          </span>
          <span className="text-xs sm:text-sm text-gray-500 text-center mt-1">
            Maksimal {MAX_FILES} file per unggahan. Format: JPG, PNG, GIF, dll. Ukuran ≤ {MAX_FILE_MB}MB/file.
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>

        {selectedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700">
                {selectedFiles.length} file siap diunggah
              </h3>
              <button
                type="button"
                onClick={clearAllSelected}
                disabled={isLoading}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                title="Hapus semua file yang baru dipilih"
              >
                Hapus semua
              </button>
            </div>

            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={`${file.name}_${file.size}_${index}`}
                  className="flex justify-between items-center p-3 bg-white border border-indigo-200 rounded-lg shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isLoading}
                    className="ml-4 text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100 disabled:opacity-50"
                    aria-label={`Hapus ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="submit"
              disabled={isLoading || selectedFiles.length === 0}
              className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mengunggah..." : `Unggah ${selectedFiles.length} Gambar`}
            </button>
          </div>
        )}
      </form>

      {/* Galeri */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Galeri Gambar ({allImages.length})
        </h3>

        {allImages.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada gambar yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={`${image.name}_${index}`}
                className="relative group overflow-hidden rounded-lg shadow-md border"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = null;
                    img.src =
                      "https://placehold.co/256x256/eeeeee/333333?text=No%20Image";
                  }}
                />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[10px] sm:text-xs text-white px-1 py-0.5 absolute top-0 left-0 bg-black/60 rounded-br">
                    {image.name}
                  </span>
                  {!image.isNew ? (
                    <button
                      onClick={() => onDeleteExisting(image.name)}
                      disabled={isLoading}
                      className="text-white hover:text-red-400 p-2 rounded-full transition disabled:opacity-50"
                      title="Hapus gambar ini"
                      aria-label={`Hapus ${image.name}`}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  ) : (
                    <span className="text-green-300 font-bold text-sm sm:text-base">
                      BARU (Preview)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
