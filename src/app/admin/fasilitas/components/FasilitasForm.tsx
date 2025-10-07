"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { JenisFasilitasEnum, Fasilitas, CreateFasilitasDto } from '../../types/Fasilitas';
import { X, Upload, Image as ImageIcon } from 'lucide-react'; // Import ikon

// Pastikan Anda memiliki helper ini atau definisikan di sini
const convertPackageImageUrl = (images: string) => {
    // Sesuaikan path ini dengan path Multer Anda: './public/package-images'
    return `${process.env.NEXT_PUBLIC_API_URL}/public/package-images/${images}`;
}

interface FasilitasFormProps {
  initialData?: Fasilitas | null;
  // Ubah onSubmit untuk juga menerima FileList
  onSubmit: (data: CreateFasilitasDto, files: FileList | null) => void; 
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  onDeleteExistingImage?: (imageName: string) => void;
}

const FasilitasForm: React.FC<FasilitasFormProps> = ({ initialData, onSubmit, onCancel, loading, error, onDeleteExistingImage }) => {
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<CreateFasilitasDto>({
    defaultValues: {
      jenisFasilitas: JenisFasilitasEnum.CUSTOM,
      namaFasilitas: '',
      deskripsi: '',
      paketLuarKota: {
        namaPaket: '',
        tujuanUtama: '',
        totalJarakKm: 0,
        estimasiDurasi: 0,
        hargaEstimasi: 0 as any,
        statusPaket: 'aktif',
        pilihTanggal: '',
        detailRute: [{
          urutanKe: 1,
          namaDestinasi: '',
          alamatDestinasi: '',
          jarakDariSebelumnyaKm: 0,
          estimasiWaktuTempuh: 0,
          waktuKunjunganMenit: 0,
        }],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "paketLuarKota.detailRute",
  });

  const jenisFasilitas = watch("jenisFasilitas");
  
  // State dan Ref untuk Unggah Gambar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  
  // Ambil daftar gambar yang sudah ada dari initialData (untuk mode edit)
  const existingImages = initialData?.paketLuarKota?.images || [];


  useEffect(() => {
    if (initialData) {
      const initialFormValues: any = {
        jenisFasilitas: initialData.jenisFasilitas,
        namaFasilitas: initialData.namaFasilitas,
        deskripsi: initialData.deskripsi,
      };

      if (initialData.jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA && initialData.paketLuarKota) {
        initialFormValues.paketLuarKota = {
          ...initialData.paketLuarKota,
          hargaEstimasi: initialData.paketLuarKota.hargaEstimasi,
          pilihTanggal: initialData.paketLuarKota.pilihTanggal ? new Date(initialData.paketLuarKota.pilihTanggal).toISOString().split('T')[0] : '',
        };
      }
      reset(initialFormValues);
    }
  }, [initialData, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setFilePreviews(newPreviews);
    }
  };


  const handleSubmitForm = (data: CreateFasilitasDto) => {
    const dataToSubmit = { ...data };
    if (dataToSubmit.jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA && dataToSubmit.paketLuarKota) {
      // Convert hargaEstimasi to string for the backend DTO
      dataToSubmit.paketLuarKota.hargaEstimasi = String(dataToSubmit.paketLuarKota.hargaEstimasi);
      // Hapus properti images dari payload JSON (karena files dikirim terpisah)
      // delete (dataToSubmit.paketLuarKota as any).images;
    } else {
      delete dataToSubmit.paketLuarKota;
    }
    
    const files = fileInputRef.current?.files || null;
    
    // Kirim data JSON dan FileList ke parent handler
    onSubmit(dataToSubmit, files);
  };


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {initialData ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}
        </h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          
          {/* Bagian Fasilitas Dasar (Jenis, Nama, Deskripsi) */}
          {/* ... (tidak berubah) ... */}
          <div>
            <label htmlFor="jenisFasilitas" className="block text-sm font-medium text-gray-700">Jenis Fasilitas</label>
            <select
              id="jenisFasilitas"
              {...register('jenisFasilitas')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value={JenisFasilitasEnum.PAKET_LUAR_KOTA}>Paket Wisata Luar Kota</option>
              <option value={JenisFasilitasEnum.CUSTOM}>Custom</option>
              <option value={JenisFasilitasEnum.DROPOFF}>Dropoff</option>
            </select>
          </div>
          <div>
            <label htmlFor="namaFasilitas" className="block text-sm font-medium text-gray-700">Nama Fasilitas</label>
            <input
              type="text"
              id="namaFasilitas"
              {...register('namaFasilitas', { required: true })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.namaFasilitas && <span className="text-red-500 text-sm">Nama Fasilitas wajib diisi.</span>}
          </div>
          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="deskripsi"
              {...register('deskripsi')}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>


          {/* Bagian dinamis untuk Paket Wisata Luar Kota */}
          {jenisFasilitas === JenisFasilitasEnum.PAKET_LUAR_KOTA && (
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="text-lg font-bold">Detail Paket Wisata Luar Kota</h3>
              {/* Input Paket Luar Kota (Nama, Tujuan, Harga, Jarak, Durasi, Tanggal) */}
              {/* ... (tidak berubah) ... */}
              <div>
                <label htmlFor="paketLuarKota.namaPaket" className="block text-sm font-medium text-gray-700">Nama Paket</label>
                <input
                  type="text"
                  id="paketLuarKota.namaPaket"
                  {...register('paketLuarKota.namaPaket', { required: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.namaPaket && <span className="text-red-500 text-sm">Nama Paket wajib diisi.</span>}
              </div>
              <div>
                <label htmlFor="paketLuarKota.tujuanUtama" className="block text-sm font-medium text-gray-700">Tujuan Utama</label>
                <input
                  type="text"
                  id="paketLuarKota.tujuanUtama"
                  {...register('paketLuarKota.tujuanUtama', { required: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.tujuanUtama && <span className="text-red-500 text-sm">Tujuan Utama wajib diisi.</span>}
              </div>
              <div>
                <label htmlFor="paketLuarKota.hargaEstimasi" className="block text-sm font-medium text-gray-700">Harga Estimasi</label>
                <input
                  type="number"
                  id="paketLuarKota.hargaEstimasi"
                  {...register('paketLuarKota.hargaEstimasi', { required: true, valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.hargaEstimasi && <span className="text-red-500 text-sm">Harga Estimasi wajib diisi.</span>}
              </div>
              
              <div>
                <label htmlFor="paketLuarKota.totalJarakKm" className="block text-sm font-medium text-gray-700">Total Jarak (km)</label>
                <input
                  type="number"
                  id="paketLuarKota.totalJarakKm"
                  {...register('paketLuarKota.totalJarakKm', { required: true, valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.totalJarakKm && <span className="text-red-500 text-sm">Total Jarak wajib diisi.</span>}
              </div>
              <div>
                <label htmlFor="paketLuarKota.estimasiDurasi" className="block text-sm font-medium text-gray-700">Estimasi Durasi (hari)</label>
                <input
                  type="number"
                  id="paketLuarKota.estimasiDurasi"
                  {...register('paketLuarKota.estimasiDurasi', { required: true, valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.estimasiDurasi && <span className="text-red-500 text-sm">Estimasi Durasi wajib diisi.</span>}
              </div>
              
              <div>
                <label htmlFor="paketLuarKota.pilihTanggal" className="block text-sm font-medium text-gray-700">Tanggal Mulai Wisata</label>
                <input
                  type="date"
                  id="paketLuarKota.pilihTanggal"
                  {...register('paketLuarKota.pilihTanggal', { required: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.paketLuarKota?.pilihTanggal && <span className="text-red-500 text-sm">Tanggal wajib diisi.</span>}
              </div>
              
              {/* --- BAGIAN UNGGAH GAMBAR BARU --- */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Unggah Foto Paket (Max 20)</label>
                
                {/* Tampilan Gambar yang Sudah Ada (Mode Edit) */}
                {existingImages.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2 border p-2 rounded-md">
                    <p className="w-full text-xs text-gray-500 mb-1">Gambar Terunggah:</p>
                    {existingImages.map((imgName: string) => (
                      <div key={imgName} className="relative w-20 h-20 overflow-hidden rounded-md group">
                        <img
                          src={convertPackageImageUrl(imgName)}
                          alt="Existing Package Image"
                          className="w-full h-full object-cover"
                        />
                        {/* Tombol Hapus Gambar Lama */}
                        {onDeleteExistingImage && (
                          <button
                            type="button"
                            onClick={() => onDeleteExistingImage(imgName)}
                            className="absolute inset-0 bg-red-600 bg-opacity-70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Gambar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}


                {/* Input File Baru */}
                <input
                  type="file"
                  id="imageUpload"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">Pilih gambar baru untuk diunggah.</p>
                
                {/* Pratinjau Gambar Baru */}
                {filePreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="w-20 h-20 overflow-hidden rounded-md border border-dashed flex items-center justify-center">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

              </div>
              {/* --- AKHIR BAGIAN UNGGAH GAMBAR BARU --- */}


              {/* Form Dinamis untuk Detail Rute */}
              <h4 className="font-semibold mt-4">Detail Rute</h4>
              {/* ... (tidak berubah) ... */}
              {fields.map((field, index) => (
                <div key={field.id} className="border p-3 rounded-md space-y-2 relative">
                  <p className="text-sm font-medium text-gray-700">Rute ke-{index + 1}</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Nama Destinasi</label>
                    <input
                      type="text"
                      {...register(`paketLuarKota.detailRute.${index}.namaDestinasi`, { required: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    />
                    {errors.paketLuarKota?.detailRute?.[index]?.namaDestinasi && <span className="text-red-500 text-xs">Nama Destinasi wajib diisi.</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Alamat Destinasi</label>
                    <input
                      type="text"
                      {...register(`paketLuarKota.detailRute.${index}.alamatDestinasi`, { required: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    />
                    {errors.paketLuarKota?.detailRute?.[index]?.alamatDestinasi && <span className="text-red-500 text-xs">Alamat Destinasi wajib diisi.</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Jarak Dari Sebelumnya (km)</label>
                    <input
                      type="number"
                      {...register(`paketLuarKota.detailRute.${index}.jarakDariSebelumnyaKm`, { required: true, valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    />
                    {errors.paketLuarKota?.detailRute?.[index]?.jarakDariSebelumnyaKm && <span className="text-red-500 text-xs">Jarak wajib diisi.</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Estimasi Waktu Tempuh (menit)</label>
                    <input
                      type="number"
                      {...register(`paketLuarKota.detailRute.${index}.estimasiWaktuTempuh`, { required: true, valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    />
                    {errors.paketLuarKota?.detailRute?.[index]?.estimasiWaktuTempuh && <span className="text-red-500 text-xs">Waktu tempuh wajib diisi.</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Waktu Kunjungan (menit)</label>
                    <input
                      type="number"
                      {...register(`paketLuarKota.detailRute.${index}.waktuKunjunganMenit`, { required: true, valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    />
                    {errors.paketLuarKota?.detailRute?.[index]?.waktuKunjunganMenit && <span className="text-red-500 text-xs">Waktu kunjungan wajib diisi.</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Deskripsi Singkat (Opsional)</label>
                    <textarea
                      {...register(`paketLuarKota.detailRute.${index}.deskripsiSingkat`)}
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                    ></textarea>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ urutanKe: fields.length + 1, namaDestinasi: '', alamatDestinasi: '', jarakDariSebelumnyaKm: 0, estimasiWaktuTempuh: 0, waktuKunjunganMenit: 0, deskripsiSingkat: '' })}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
              >
                + Tambah Rute
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FasilitasForm;