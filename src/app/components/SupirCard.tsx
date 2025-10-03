"use client";

import { Star, Phone, MapPin, BadgeInfo, Clock, UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import SupirImage from '../assets/icon.png';
import Image from 'next/image';

type Supir = {
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

type SupirCardProps = {
  supir: Supir;
};

export default function SupirCard({ supir }: SupirCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex flex-col items-center text-center">
        {/* Foto Supir - Ditempatkan di bagian atas */}
        <div className="mb-4">
          <Image
            src={SupirImage}
            alt={`Foto Supir ${supir.nama}`}
            className="w-32 h-32 object-cover rounded-full"
          />
        </div>

        {/* Detail Supir - Ditempatkan di bawah foto */}
        <div className="flex-grow space-y-2">
          <CardTitle className="text-xl font-bold">{supir.nama}</CardTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{supir.alamat}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{supir.nomorHp}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>No. SIM: {supir.nomorSim}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Pengalaman: {supir.pengalamanTahun} tahun</span>
            </div>
          </div>
        </div>

        {/* Rating and Status Badges */}
        <div className="flex flex-col items-center mt-4 gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-semibold">
              {supir.ratingRata ? supir.ratingRata.toFixed(1) : "—"}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`capitalize ${
              supir.statusSupir === "tersedia"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {supir.statusSupir}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}