"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Phone, Mail, MapPin, Clock, Plane, Globe2, Home } from "lucide-react";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import PopularPackages from "./components/PopularPackages";
import CompanyInfo from "./components/CompanyInfo";
import DebugDiagnostics from "@/components/DebugDiagnostics";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header pakai komponen custom */}
      <Header currentPage="home" />

      {/* Main */}
      <main className="flex-1">
        <HeroSection />

        <section className="py-12 container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Paket Populer</h2>
          <PopularPackages />
        </section>
        <DebugDiagnostics />

        <section className="py-12 container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Tentang Kami</h2>
          <CompanyInfo />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plane size={20} /> TravelKu
                </CardTitle>
              </CardHeader>
              <CardContent className="text-primary-foreground/80">
                Mewujudkan perjalanan impian Anda dengan layanan terpercaya
                dan pengalaman tak terlupakan.
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Layanan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { text: "Paket Wisata Domestik", icon: <Plane size={16} /> },
                    { text: "Paket Wisata Internasional", icon: <Globe2 size={16} /> },
                    { text: "Hotel & Akomodasi", icon: <Home size={16} /> },
                    { text: "Transportasi", icon: <MapPin size={16} /> },
                  ].map((layanan) => (
                    <motion.li
                      key={layanan.text}
                      className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                      whileHover={{ x: 5 }}
                    >
                      {layanan.icon} {layanan.text}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Popular Destinations */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Destinasi Populer</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Bali", "Yogyakarta", "Raja Ampat", "Lombok"].map((dest) => (
                    <motion.li
                      key={dest}
                      className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                      whileHover={{ x: 5 }}
                    >
                      <MapPin size={16} /> {dest}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle className="font-semibold">Kontak</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-primary-foreground/80">
                  <li className="flex items-center gap-2">
                    <Phone size={16} /> +62 21 1234 5678
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={16} /> info@travelku.com
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin size={16} /> Jakarta, Indonesia
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock size={16} /> 24/7 Support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Copyright */}
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2024 TravelKu Indonesia. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;


// src/app/debug/page.tsx
// import DebugDiagnostics from "@/components/DebugDiagnostics";

// export default function DebugPage() {
//   return (
//     <>
//       <h1>Debug</h1>
//       <DebugDiagnostics />
//     </>
//   );
// }

