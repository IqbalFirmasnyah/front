import React, { memo, useMemo, useState, KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Car, Users, Calendar, Hash } from "lucide-react";

/* =========================
   Types
========================= */
export interface Armada {
  armadaId: number;
  jenisMobil: string;
  merkMobil: string;
  platNomor: string;
  kapasitas: number;
  tahunKendaraan: number;
  statusArmada: string;
  fotoArmada?: string;
}

/* =========================
   Helpers
========================= */
// Jika punya helper project:
// import { convertCarImageUrl } from "@/lib/helper/image_url";
const convertCarImageUrl = (fileName?: string) =>
  fileName ? `http://localhost:3001/public/car-images/${fileName}` : undefined;

const PLACEHOLDER =
  "https://via.placeholder.com/800x450.png?text=No+Image+Available";

const cx = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

const safeText = (v?: string | number, fallback = "-") =>
  v === null || v === undefined || v === "" ? fallback : String(v);

const getStatusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase();
  if (["aktif", "available", "tersedia"].includes(s))
    return "bg-green-600 text-white";
  if (["maintenance", "perbaikan"].includes(s))
    return "bg-amber-600 text-white";
  if (["non_aktif", "non-aktif", "tidak aktif", "unavailable"].includes(s))
    return "bg-gray-500 text-white";
  return "bg-slate-600 text-white";
};

/* =========================
   Props
========================= */
interface ArmadaCardProps {
  armada: Armada;
  onSelect?: (armadaId: number) => void; // untuk Detail/Sewa
  actionText?: string; // default "Lihat Detail"
  hideAction?: boolean;
  className?: string;
  clickable?: boolean; // jika true, klik kartu juga memanggil onSelect
}

/* =========================
   Component
========================= */
const ArmadaCard: React.FC<ArmadaCardProps> = ({
  armada,
  onSelect,
  actionText = "Lihat Detail",
  hideAction,
  className = "",
  clickable = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const imgSrc = useMemo(() => {
    const fromHelper = armada.fotoArmada
      ? convertCarImageUrl(armada.fotoArmada)
      : undefined;
    return fromHelper && !imgError ? fromHelper : PLACEHOLDER;
  }, [armada.fotoArmada, imgError]);

  const title = `${safeText(armada.merkMobil)} ${safeText(armada.jenisMobil)}`;

  const handleSelect = () => onSelect?.(armada.armadaId);

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
      aria-label={`Armada ${title}`}
      onClick={clickable ? handleSelect : undefined}
      onKeyDown={onKey}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={imgSrc}
            alt={`Armada: ${title}`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

          {/* Badges: left -> jenis, right -> status */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-black/80 text-white">
              <Car className="w-3.5 h-3.5 mr-1" />
              Armada
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className={cx("capitalize", getStatusBadgeClass(armada.statusArmada))}>
              {safeText(armada.statusArmada)}
            </Badge>
          </div>

          {/* Title & plate */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg sm:text-xl font-semibold leading-tight line-clamp-2 drop-shadow">
              {title}
            </h3>
            <div className="mt-1 inline-flex items-center text-sm opacity-95 bg-black/30 px-2 py-1 rounded">
              <span className="tracking-wider">{safeText(armada.platNomor)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">
              Kapasitas: <strong className="text-foreground">{safeText(armada.kapasitas)}</strong>
            </span>
          </div>
          <div className="flex items-center justify-end text-right">
            <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">
              Tahun: <strong className="text-foreground">{safeText(armada.tahunKendaraan)}</strong>
            </span>
          </div>
        </div>
      </CardContent>

      {!hideAction && (
        <CardFooter className="p-4 sm:p-5 pt-0">
          <Button
            className="w-full"
            variant="ocean"
            title={`${actionText} - ${title}`}
            aria-label={`${actionText} - ${title}`}
            onClick={(e) => {
              e.stopPropagation(); // supaya klik tombol tidak menjalankan klik card
              handleSelect();
            }}
          >
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default memo(ArmadaCard);

/* =========================
   Skeleton (Loading)
========================= */
export const SkeletonArmadaCard: React.FC = () => (
  <div
    className="rounded-xl overflow-hidden border bg-white shadow-sm animate-pulse"
    role="status"
    aria-label="Loading armada card"
  >
    <div className="h-44 sm:h-52 bg-gray-200" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-4 w-2/3 bg-gray-200 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  </div>
);
