"use client";

import React, { memo, useMemo, useState, KeyboardEvent } from "react";
import { Star, Phone, MapPin, Clock, UserCheck, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import SupirPlaceholder from "../assets/icon.png";

/* =========================
   Types
========================= */
export type Supir = {
  supirId: number;
  nama: string;
  alamat: string;
  nomorHp: string;
  nomorSim: string;
  fotoSupir: string | null;
  pengalamanTahun: number;
  ratingRata: number | null;
  statusSupir: string; // ex: "tersedia" | "off" | "cuti"
};

/* =========================
   Helpers
========================= */
// Jika punya helper sendiri, gunakan:
// import { convertDriverImageUrl } from "@/lib/helper/image_url";
const convertDriverImageUrl = (fileName?: string | null) =>
  fileName ? `http://localhost:3001/public/driver-images/${fileName}` : undefined;

const cx = (...x: Array<string | false | null | undefined>) => x.filter(Boolean).join(" ");

const safeText = (v?: string | number | null, fallback = "—") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const getStatusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (["tersedia", "available", "aktif"].includes(s)) return "bg-green-600 text-white";
  if (["off", "cuti"].includes(s)) return "bg-amber-600 text-white";
  return "bg-gray-500 text-white";
};

/* =========================
   Props
========================= */
type SupirCardProps = {
  supir: Supir;
  onSelect?: (supirId: number) => void;
  actionText?: string;
  hideAction?: boolean;
  className?: string;
  clickable?: boolean; // jika true: klik kartu memanggil onSelect
};

/* =========================
   Component
========================= */
const SupirCard: React.FC<SupirCardProps> = ({
  supir,
  onSelect,
  actionText = "Lihat Detail",
  hideAction,
  className = "",
  clickable = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // URL foto dari backend (jika ada)
  const fotoUrl = useMemo(() => convertDriverImageUrl(supir.fotoSupir), [supir.fotoSupir]);

  const handleSelect = () => onSelect?.(supir.supirId);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card
      className={cx(
        "group overflow-hidden border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2 focus-within:ring-2 focus-within:ring-primary/30",
        clickable && "cursor-pointer",
        className
      )}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : -1}
      aria-label={`Supir ${safeText(supir.nama, "Tanpa Nama")}`}
      onClick={clickable ? handleSelect : undefined}
      onKeyDown={onKey}
    >
      {/* Header dengan foto & overlay */}
      <CardHeader className="p-0">
        <div className="relative">
          {/* Jika ada foto dari backend & tidak error, pakai <img>. Jika error/tidak ada, pakai placeholder Next/Image */}
          {fotoUrl && !imgError ? (
            <img
              src={fotoUrl}
              alt={`Foto Supir: ${safeText(supir.nama, "Tanpa Nama")}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src={SupirPlaceholder}
              alt={`Foto Supir: ${safeText(supir.nama, "Tanpa Nama")}`}
              className="w-full h-auto aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={false}
            />
          )}

          {/* Overlay gradasi */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

          {/* Badge status di kanan atas */}
          <div className="absolute top-4 right-4">
            <Badge className={cx("capitalize", getStatusBadgeClass(supir.statusSupir))}>
              {safeText(supir.statusSupir)}
            </Badge>
          </div>

          {/* Badge kecil di kiri atas (opsional branding/identitas) */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/80 text-white">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Supir
            </Badge>
          </div>

          {/* Nama & alamat singkat di bawah */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <CardTitle className="text-lg sm:text-xl font-semibold leading-tight line-clamp-2 drop-shadow">
              {safeText(supir.nama, "Tanpa Nama")}
            </CardTitle>
            <div className="mt-1 flex items-center text-sm opacity-95">
              <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
              <span className="truncate">{safeText(supir.alamat, "Alamat tidak tersedia")}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Konten detail singkat */}
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">{safeText(supir.nomorHp)}</span>
          </div>
          <div className="flex items-center sm:justify-end sm:text-right">
            <UserCheck className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">SIM: {safeText(supir.nomorSim)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">Pengalaman: {safeText(supir.pengalamanTahun)} tahun</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(SupirCard);

/* =========================
   Skeleton (Loading)
========================= */
export const SkeletonSupirCard: React.FC = () => (
  <div
    className="rounded-xl overflow-hidden border bg-white shadow-sm animate-pulse"
    role="status"
    aria-label="Loading driver card"
  >
    <div className="h-44 sm:h-52 bg-gray-200" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  </div>
);
