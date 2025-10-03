// components/ImageUploadForm.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, useMemo } from 'react';
import { Trash2, UploadCloud, XCircle } from 'lucide-react';

interface ImageUploadFormProps {
    paketId: number;
    paketName: string;
    existingImages: string[];
    isLoading: boolean;
    onUpload: (files: File[]) => Promise<void>;
    onDeleteExisting: (imageName: string) => Promise<void>;
}

const MAX_FILES = 20;


export default function ImageUploadForm({
  paketId,
  paketName,
  existingImages,
  isLoading,
  onUpload,
  onDeleteExisting,
}: ImageUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
    if (nonImageFiles.length > 0) {
      setError('Hanya file gambar (JPEG, PNG, GIF, dll.) yang diizinkan.');
      e.target.value = ''; 
      return;
    }

    const totalFiles = existingImages.length + selectedFiles.length + files.length;
    if (totalFiles > MAX_FILES) {
      setError(`Maksimal total ${MAX_FILES} gambar (sudah ada + baru). Pilih kurang.`);
      e.target.value = '';
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Pilih minimal satu gambar untuk diunggah.');
      return;
    }
    
    await onUpload(selectedFiles);
    setSelectedFiles([]); 
  };
  
  // 1. Dapatkan preview file baru yang dipilih
  const filePreviews = useMemo(() => selectedFiles.map(file => ({
    name: file.name,
    url: URL.createObjectURL(file),
    isNew: true
  })), [selectedFiles]);

  
  const allImages = [
    ...existingImages.map(name => ({
        name,
        url: `http://localhost:3001/public/package-images/${name}`,
        
        isNew: false
    })),
    ...filePreviews
  ];
  
  
  return (
    <div className="bg-white shadow-xl rounded-xl p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
        Upload Gambar untuk {paketName}
      </h2>
      <p className="text-gray-500 mb-6">Paket ID: {paketId}</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
          <XCircle className="w-5 h-5 mr-3" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Bagian Upload Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" />
          <span className="text-lg font-semibold text-indigo-600">Pilih File Gambar Baru</span>
          <span className="text-sm text-gray-500">Maksimal {MAX_FILES - existingImages.length} file baru. Total maksimal: {MAX_FILES}.</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading || existingImages.length >= MAX_FILES}
            className="hidden"
          />
        </label>
        
        {selectedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              {selectedFiles.length} File Siap Unggah:
            </h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-white border border-indigo-200 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isLoading}
                    className="ml-4 text-red-500 hover:text-red-700 transition duration-150 p-1 rounded-full hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              disabled={isLoading || selectedFiles.length === 0}
              className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengunggah...' : `Unggah ${selectedFiles.length} Gambar`}
            </button>
          </div>
        )}
      </form>
      
      {/* Bagian Galeri Gambar */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Galeri Gambar ({allImages.length})
        </h3>
        {allImages.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada gambar yang diunggah.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-md border-2 border-gray-200">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error('❌ Failed to load image:', image.url);
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = `https://placehold.co/128x128/eeeeee/333333?text=Broken`;
                  }}
                />
                
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <span className="text-xs text-white p-1 absolute top-0 left-0 bg-black bg-opacity-60 rounded-br-lg">{image.name}</span>

                  {!image.isNew && (
                    <button
                      onClick={() => onDeleteExisting(image.name)}
                      disabled={isLoading}
                      className="text-white hover:text-red-400 p-2 rounded-full transition duration-200 disabled:opacity-50"
                      title="Hapus Gambar Ini"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  )}
                  {image.isNew && (
                    <span className="text-green-300 font-bold text-lg">BARU (Preview)</span>
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