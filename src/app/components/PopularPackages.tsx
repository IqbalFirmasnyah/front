"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PackageCard, { TourPackage } from "@/app/components/PackageCard";
import ArmadaCard, {
  SkeletonArmadaCard,
  type Armada as ArmadaType,
} from "@/app/components/ArmadaCard";
import SupirCard from "@/app/components/SupirCard";

/* =========================
   Types
========================= */
type Fasilitas = {
  fasilitasId: number;
  namaFasilitas: string;
  deskripsi?: string;
  harga?: number;
};

type SupirNormalized = {
  supirId: number;
  nama: string;
  alamat: string;
  nomorHp: string;
  nomorSim: string;
  fotoSupir: string | null;
  pengalamanTahun: number;
  ratingRata: number | null;
  statusSupir: string;
};

/* =========================
   Skeleton Components
========================= */
const SkeletonCard: React.FC = () => (
  <div className="rounded-xl overflow-hidden border bg-white shadow-sm animate-pulse">
    <div className="h-48 sm:h-52 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
    </div>
    <div className="p-5 pt-0">
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  </div>
);

const SkeletonTile: React.FC = () => (
  <div className="p-6 bg-white rounded-xl border shadow-sm animate-pulse">
    <div className="h-4 w-1/2 bg-gray-200 rounded" />
    <div className="h-3 w-5/6 bg-gray-200 rounded mt-3" />
    <div className="h-3 w-1/3 bg-gray-200 rounded mt-3" />
  </div>
);

/* =========================
   Helpers
========================= */
const grid3 =
  "grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 [@media(min-width:1024px)]:grid-cols-[repeat(3,minmax(0,1fr))]";

function mapLuarToTourPackage(lp: any): TourPackage {
  return {
    paketId: lp?.id ?? lp?.paketId ?? lp?.paketWisataLuarKotaId ?? Math.floor(Math.random() * 1e9),
    namaPaket: lp?.namaPaket ?? lp?.nama ?? "Paket Luar Kota",
    namaTempat: lp?.namaTempat ?? lp?.lokasi ?? "",
    lokasi: lp?.lokasi ?? "-",
    deskripsi: lp?.deskripsi ?? "",
    itinerary: lp?.itinerary ?? "",
    jarakKm: lp?.jarakKm ?? 0,
    durasiHari: lp?.durasiHari ?? lp?.durasi ?? 0,
    pilihTanggal: lp?.pilihTanggal ?? lp?.tanggalMulaiWisata ?? new Date().toISOString(),
    harga: lp?.harga ?? lp?.hargaEstimasi ?? 0,
    images: lp?.images ?? (lp?.fotoPaket ? [lp.fotoPaket] : []),
    fotoPaket: lp?.fotoPaket ?? "",
    kategori: lp?.kategori ?? "luar kota",
    statusPaket: lp?.statusPaket ?? "aktif",
    tanggalMulaiWisata: lp?.tanggalMulaiWisata,
    tanggalSelesaiWisata: lp?.tanggalSelesaiWisata,
  };
}

const normalizeSupir = (s: any): SupirNormalized => ({
  supirId: s?.supirId ?? s?.id ?? Math.floor(Math.random() * 1e9),
  nama: s?.nama ?? s?.namaSupir ?? "Supir",
  alamat: s?.alamat ?? s?.alamatSupir ?? "-",
  nomorHp: s?.nomorHp ?? s?.noHp ?? s?.telepon ?? "-",
  nomorSim: s?.nomorSim ?? s?.noSim ?? "-",
  fotoSupir: s?.fotoSupir ?? s?.image ?? null,
  pengalamanTahun: s?.pengalamanTahun ?? s?.pengalaman ?? 0,
  ratingRata: typeof s?.ratingRata === "number" ? s.ratingRata : null,
  statusSupir: s?.statusSupir ?? (s?.statusAktif ? "tersedia" : "tidak tersedia"),
});

const normalizeArmada = (a: any): ArmadaType => ({
  armadaId: a?.armadaId ?? a?.id ?? Math.floor(Math.random() * 1e9),
  jenisMobil: a?.jenisMobil ?? a?.jenis ?? a?.tipe ?? "-",
  merkMobil: a?.merkMobil ?? a?.merk ?? a?.brand ?? "-",
  platNomor: a?.platNomor ?? a?.plat ?? a?.noPolisi ?? "-",
  kapasitas: a?.kapasitas ?? 0,
  tahunKendaraan: a?.tahunKendaraan ?? a?.tahun ?? 0,
  statusArmada: a?.statusArmada ?? a?.status ?? "aktif",
  fotoArmada: a?.fotoArmada ?? a?.image ?? a?.foto ?? undefined,
});

/* =========================
   Component
========================= */
const PopularPackages: React.FC = () => {
  const router = useRouter();

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [errorPackages, setErrorPackages] = useState<string | null>(null);

  const [fasilitasList, setFasilitasList] = useState<Fasilitas[]>([]);
  const [loadingFasilitas, setLoadingFasilitas] = useState(true);
  const [errorFasilitas, setErrorFasilitas] = useState<string | null>(null);

  const [supirs, setSupirs] = useState<SupirNormalized[]>([]);
  const [loadingSupir, setLoadingSupir] = useState(true);
  const [errorSupir, setErrorSupir] = useState<string | null>(null);

  const [armadas, setArmadas] = useState<ArmadaType[]>([]);
  const [loadingArmada, setLoadingArmada] = useState(true);
  const [errorArmada, setErrorArmada] = useState<string | null>(null);

  /* -------- Fetchers -------- */
  const fetchPackages = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paket-wisata/all`, { cache: "no-store", signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Gagal mengambil paket wisata.");
    return (json.data ?? []) as TourPackage[];
  }, []);

  const fetchFasilitas = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fasilitas`, { cache: "no-store", signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Gagal mengambil fasilitas.");
    return (json.data ?? []) as Fasilitas[];
  }, []);

  const fetchSupirs = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supir/all`, { cache: "no-store", signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Gagal mengambil data supir.");
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return (data as any[]).map(normalizeSupir);
  }, []);

  const fetchArmadas = useCallback(async (signal?: AbortSignal) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/armada/all`, { cache: "no-store", signal });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Gagal mengambil data armada.");
    const data = Array.isArray(json) ? json : (json.data ?? []);
    return (data as any[]).map(normalizeArmada);
  }, []);

  /* -------- Initial load -------- */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingPackages(true);
        setLoadingFasilitas(true);
        setLoadingSupir(true);
        setLoadingArmada(true);

        const [pkg, fas, sup, arm] = await Promise.all([
          fetchPackages(controller.signal).catch((e) => {
            setErrorPackages(String(e?.message || e));
            return [];
          }),
          fetchFasilitas(controller.signal).catch((e) => {
            setErrorFasilitas(String(e?.message || e));
            return [];
          }),
          fetchSupirs(controller.signal).catch((e) => {
            setErrorSupir(String(e?.message || e));
            return [];
          }),
          fetchArmadas(controller.signal).catch((e) => {
            setErrorArmada(String(e?.message || e));
            return [];
          }),
        ]);

        setPackages(pkg);
        setFasilitasList(fas);
        setSupirs(sup);
        setArmadas(arm);
      } finally {
        setLoadingPackages(false);
        setLoadingFasilitas(false);
        setLoadingSupir(false);
        setLoadingArmada(false);
      }
    })();

    return () => controller.abort();
  }, [fetchPackages, fetchFasilitas, fetchSupirs, fetchArmadas]);

  /* -------- UI -------- */
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* ========== Paket Wisata ========== */}
        <header className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-wider uppercase text-primary font-semibold">Rekomendasi Kami</p>
          <h2 className="mt-2 text-balance text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Pilihan Paket Wisata Populer
          </h2>
          <p className="mt-3 text-pretty text-gray-600 max-w-2xl mx-auto">
            Nikmati perjalanan menyenangkan ke berbagai destinasi terbaik—harga kompetitif, jadwal fleksibel, dan layanan ramah.
          </p>
        </header>

        {errorPackages && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errorPackages}</div>
        )}

        {loadingPackages ? (
          <div className={grid3}>{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        ) : packages.length === 0 ? (
          <div className="rounded-xl bg-white border shadow-sm p-10 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-2xl font-bold mb-2">Belum ada paket wisata yang tersedia</h3>
            <p className="text-gray-600">Kembali lagi nanti untuk melihat penawaran terbaru!</p>
          </div>
        ) : (
          <div className={grid3}>
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.paketId}
                package={pkg}
                hideBookingButton
                onBookNow={(id) => router.push(`/paket-wisata/${id}`)}
              />
            ))}
          </div>
        )}

        {/* ========== Fasilitas ========== */}
        <div className="mt-16 md:mt-20">
          <div className="mb-6">
            <p className="text-xs tracking-wider uppercase text-primary/80 font-semibold">Tambahan Perjalanan</p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Fasilitas Tersedia</h3>
          </div>

          {errorFasilitas && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errorFasilitas}</div>
          )}

          {loadingFasilitas ? (
            <div className={grid3}>{Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)}</div>
          ) : fasilitasList.length === 0 ? (
            <p className="text-gray-600">Belum ada fasilitas yang tersedia.</p>
          ) : (
            <ul className={grid3}>
              {fasilitasList.map((f) => (
                <li key={f.fasilitasId} className="group relative p-6 bg-white rounded-xl border shadow-sm hover:shadow-md transition">
                  <h4 className="text-lg font-semibold tracking-tight text-gray-900">{f.namaFasilitas}</h4>
                  {f.deskripsi && <p className="text-pretty text-gray-600 mt-2">{f.deskripsi}</p>}
                  {typeof f.harga === "number" && (
                    <p className="mt-4 font-bold text-primary">Rp {f.harga.toLocaleString("id-ID")}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ========== Supir ========== */}
        <div className="mt-16 md:mt-20">
          <p className="text-xs tracking-wider uppercase text-primary/80 font-semibold">Tim Lapangan</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6">Daftar Supir</h3>

          {errorSupir && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errorSupir}</div>
          )}

          {loadingSupir ? (
            <div className={grid3}>{Array.from({ length: 6 }).map((_, i) => <SkeletonTile key={i} />)}</div>
          ) : supirs.length === 0 ? (
            <p className="text-gray-600">Belum ada data supir.</p>
          ) : (
            <ul className={grid3}>
              {supirs.map((s) => (
                <li key={s.supirId} className="list-none">
                  <SupirCard supir={s} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ========== Armada ========== */}
        <div className="mt-16 md:mt-20">
          <p className="text-xs tracking-wider uppercase text-primary/80 font-semibold">Transportasi</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-6">Armada Kami</h3>

          {errorArmada && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{errorArmada}</div>
          )}

          {loadingArmada ? (
            <div className={grid3}>{Array.from({ length: 6 }).map((_, i) => <SkeletonArmadaCard key={i} />)}</div>
          ) : armadas.length === 0 ? (
            <p className="text-gray-600">Belum ada data armada.</p>
          ) : (
            <div className={grid3}>
              {armadas.map((a) => (
                <ArmadaCard key={a.armadaId} armada={a} actionText="Lihat Detail" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularPackages;
