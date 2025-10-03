// components/PackageCard.tsx
import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";

// ASUMSI: Fungsi ini ada di @/lib/helper/image_url
// Jika Anda belum membuat file ini, Anda harus membuatnya atau memindahkan fungsi ini.
import { convertTravelImageUrl } from "@/lib/helper/image_url"; 

// Catatan: Jika Anda tidak bisa mengimpornya, definisikan di sini:
/*
export const convertTravelImageUrl = (image: string) => {
    return `http://localhost:3001/public/travel-images/${image}`;
};
*/


export interface TourPackage {
  paketId: number;
  namaPaket: string;
  namaTempat: string;
  lokasi: string;
  deskripsi: string;
  itinerary: string;
  jarakKm: number;
  durasiHari: number;
  pilihTanggal: string; // ISO date string
  harga: number;
  
  // Properti yang menyimpan NAMA FILE gambar
  images: string[];
  fotoPaket: string; 
  
  kategori: string;
  statusPaket: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
}

interface PackageCardProps {
  package: TourPackage;
  onBookNow?: (packageId: number) => void;
  hideBookingButton?: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onBookNow, hideBookingButton }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Tentukan sumber gambar. Gunakan 'fotoPaket' karena itu yang Anda tentukan di DTO backend.
  // Ganti '/placeholder-image.jpg' dengan URL placeholder eksternal atau pastikan file ada di folder public Next.js Anda.
  // const imageUrl = pkg.image 
  //   ? convertTravelImageUrl
  //   : 'https://via.placeholder.com/600x400?text=No+Image+Available'; 

  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={convertTravelImageUrl(pkg.images[0])} 
            alt={pkg.namaPaket}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <Badge className="absolute top-4 left-4 bg-accent text-white">
            {pkg.kategori}
          </Badge>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold mb-1">{pkg.namaPaket}</h3>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1" /> {pkg.lokasi}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {pkg.deskripsi}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" /> {pkg.durasiHari} hari
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(pkg.pilihTanggal).toLocaleDateString("id-ID")}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-right ml-auto">
              <div className="text-sm text-muted-foreground">Mulai dari</div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(pkg.harga)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {!hideBookingButton && (
        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full"
            variant="ocean"
            onClick={() => onBookNow?.(pkg.paketId)}
          >
            <Calendar className="h-4 w-4 mr-2" /> Book Sekarang
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PackageCard;