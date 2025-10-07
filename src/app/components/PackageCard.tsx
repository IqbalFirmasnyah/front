import React, { memo, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";

// Jika helper ada di project-mu, gunakan ini:
import { convertTravelImageUrl } from "@/lib/helper/image_url";

/** Jika belum punya helper-nya, bisa aktifkan fallback di bawah */
// const convertTravelImageUrl = (fileName?: string) =>
//   fileName ? `${process.env.NEXT_PUBLIC_API_URL}/public/travel-images/${fileName}` : undefined;

export interface TourPackage {
  paketId: number;
  namaPaket: string;
  namaTempat: string;
  lokasi: string;
  deskripsi: string;
  itinerary: string;
  jarakKm: number;
  durasiHari: number;
  pilihTanggal: string; // ISO
  harga: number;
  images?: string[];
  fotoPaket?: string;
  kategori: string;
  statusPaket: string;
  tanggalMulaiWisata?: string;
  tanggalSelesaiWisata?: string;
}

interface PackageCardProps {
  package: TourPackage;
  onBookNow?: (packageId: number) => void;
  hideBookingButton?: boolean;
  className?: string;
}

/* ====== Helpers ====== */

const PLACEHOLDER =
  "https://via.placeholder.com/800x450.png?text=No+Image+Available";

const classNames = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

const formatDateId = (iso?: string) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

const getStatusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (s === "aktif") return "bg-green-600 text-white";
  if (s === "non_aktif" || s === "non-aktif") return "bg-gray-500 text-white";
  return "bg-slate-600 text-white";
};

/* ====== Component ====== */

const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onBookNow,
  hideBookingButton,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  // Hitung URL gambar yang dipakai
  const imgSrc = useMemo(() => {
    const candidate = pkg.images?.[0] || pkg.fotoPaket || "";
    const fromHelper = candidate ? convertTravelImageUrl(candidate) : undefined;
    return fromHelper && !imgError ? fromHelper : PLACEHOLDER;
  }, [pkg.images, pkg.fotoPaket, imgError]);

  // Harga
  const priceFormatted = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(pkg.harga),
    [pkg.harga]
  );

  // Tanggal mulai (pakai pilihTanggal sebagai fallback)
  const startDateText = useMemo(
    () => formatDateId(pkg.pilihTanggal),
    [pkg.pilihTanggal]
  );

  return (
    <Card
      className={classNames(
        "group overflow-hidden border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2",
        className
      )}
    >
      <CardHeader className="p-0">
        <div className="relative">
          {/* Pakai <img> agar tidak perlu config domain Next/Image */}
          <img
            src={imgSrc}
            alt={`Gambar paket: ${pkg.namaPaket}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full aspect-[16/9] object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />

          {/* Overlay & Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/80 text-white capitalize">
              {pkg.kategori || "paket"}
            </Badge>
            <Badge
              className={classNames(
                getStatusBadgeClass(pkg.statusPaket),
                "capitalize"
              )}
            >
              {pkg.statusPaket || "status"}
            </Badge>
          </div>

          {/* Title & lokasi */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-semibold leading-tight line-clamp-2 drop-shadow">
              {pkg.namaPaket}
            </h3>
            <div className="mt-1 flex items-center text-sm opacity-90">
              <MapPin className="h-4 w-4 mr-1" /> {pkg.lokasi || "-"}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {pkg.deskripsi || "-"}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {pkg.durasiHari ?? "-"} hari
          </div>

          {/* 👉 Right aligned date row */}
          <div className="flex items-center justify-end text-muted-foreground text-right">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{startDateText}</span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div />
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Mulai dari</div>
            <div className="text-2xl font-bold text-primary">
              {priceFormatted}
            </div>
          </div>
        </div>
      </CardContent>

      {!hideBookingButton && (
        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full"
            variant="ocean"
            title={`Booking paket ${pkg.namaPaket}`}
            aria-label={`Booking paket ${pkg.namaPaket}`}
            onClick={() => onBookNow?.(pkg.paketId)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Sekarang
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default memo(PackageCard);
