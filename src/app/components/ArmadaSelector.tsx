"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Ticket, User, CalendarCheck } from "lucide-react";
import ArmadaImage from "../assets/mobil.jpeg";

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

interface Props {
  selectedArmadaId: number | null;
  onSelect: (armadaId: number) => void;
  armadaOptions: Armada[];
  loading?: boolean;
}

export default function ArmadaSelector({ selectedArmadaId, onSelect, armadaOptions, loading }: Props) {
  if (loading) return <p>Memuat armada...</p>;
  if (armadaOptions.length === 0) return <p>Tidak ada armada tersedia.</p>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg mb-2">Pilih Armada</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {armadaOptions.map((armada) => (
          <Card
            key={armada.armadaId}
            className={`cursor-pointer transition-all ${
              selectedArmadaId === armada.armadaId
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelect(armada.armadaId)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
              <div className="w-full h-32 overflow-hidden rounded-lg">
                <Image src={ArmadaImage} alt={armada.merkMobil} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {armada.jenisMobil} - {armada.merkMobil}
                </CardTitle>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span>Plat: {armada.platNomor}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Kapasitas: {armada.kapasitas} orang</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    <span>Tahun: {armada.tahunKendaraan}</span>
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`capitalize mt-2 ${
                  armada.statusArmada === "tersedia"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {armada.statusArmada}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
