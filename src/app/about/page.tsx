"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Plane,
  Home,
  Phone,
  Clock,
  CheckCircle,
  Users,
  Star,
  Bus,
  Shield,
  Briefcase,
  Mail,
  Zap,
} from "lucide-react";
// Asumsi import komponen UI dari lokasi yang benar
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { cn } from "@/lib/utils";
import Header from "../components/Header";


const aboutData = [
  {
    icon: Star,
    title: "Visi",
    description: "Menjadi penyedia layanan transportasi dan travel terdepan di Indonesia yang dikenal karena kualitas, keamanan, dan inovasi.",
  },
  {
    icon: Bus,
    title: "Misi",
    description: "Menyediakan armada terbaik, layanan pelanggan prima, serta menciptakan pengalaman perjalanan yang tak terlupakan bagi setiap pelanggan.",
  },
  {
    icon: Shield,
    title: "Nilai Kami",
    description: "Integritas, Keamanan, Profesionalisme, dan Kepuasan Pelanggan adalah inti dari setiap layanan yang kami berikan.",
  },
];

// Data Keunggulan
const advantages = [
    { icon: CheckCircle, title: "Armada Modern", description: "Unit kendaraan terbaru dan terawat, menjamin kenyamanan maksimal." },
    { icon: Briefcase, title: "Sopir Profesional", description: "Tenaga ahli yang berpengalaman, ramah, dan mengutamakan keselamatan." },
    { icon: MapPin, title: "Rute Fleksibel", description: "Layanan custom rute dan drop-off sesuai kebutuhan spesifik Anda." },
    { icon: Clock, title: "Layanan 24/7", description: "Siap melayani kebutuhan perjalanan Anda kapan pun dan di mana pun." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="about" />

      <main className="pt-24">
        {/* 1. Hero Banner */}
        <section
          className="relative bg-cover bg-center py-28 text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1544620387-a2f074d32a49?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')", // Gambar bus atau travel
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative container mx-auto px-6 text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Tentang Kami: Yonstrans 🌐
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Mitra terpercaya Anda dalam setiap perjalanan. Kami hadir untuk
              memberikan **solusi transportasi terbaik** dengan fokus pada **kenyamanan** dan **keamanan**.
            </motion.p>
          </div>
        </section>

        {/* 2. About Yonstrans Section (Visi, Misi, Nilai) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-10 text-gray-900">
              Mengapa Yonstrans Ada
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {aboutData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition duration-300 border-t-4 border-black">
                    <CardHeader className="p-0 mb-4 flex flex-col items-center">
                      <item.icon className="h-10 w-10 text-black mb-3" />
                      <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-gray-600 text-center">
                      {item.description}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Why Choose Us / Keunggulan */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
              Keunggulan Layanan Kami
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((adv, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full border-2 border-gray-100 hover:border-black transition">
                    <adv.icon className="h-8 w-8 text-black mb-3" />
                    <CardTitle className="text-lg font-semibold mb-2">{adv.title}</CardTitle>
                    <p className="text-sm text-gray-600">{adv.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Team Section (Sederhana) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Tim Inti Kami
            </h2>
            <p className="max-w-xl mx-auto text-gray-600 mb-8">
              Dukungan dari tim profesional dan berdedikasi adalah kunci
              keberhasilan setiap perjalanan Anda.
            </p>
            <Users className="h-12 w-12 text-black mx-auto mb-4" />
          </div>
        </section>
        
        {/* 5. Contact CTA */}
        <section className="bg-black py-12">
            <div className="container mx-auto px-6 text-center text-white">
                <h3 className="text-3xl font-bold mb-3">Siap Merencanakan Perjalanan Anda?</h3>
                <p className="text-white/80 mb-6 max-w-2xl mx-auto">Hubungi kami hari ini untuk konsultasi gratis atau pesan layanan custom rute Anda sekarang.</p>
                <div className="flex justify-center gap-4">
                    <Button 
                        onClick={() => alert("Redirect to Custom Tour Page")}
                        className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-6"
                    >
                        <Zap className="h-5 w-5 mr-2" /> Custom Tour Sekarang
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={() => alert("Redirect to Contact Page")}
                        className="border-white text-black hover:bg-black/10 font-semibold px-8 py-6"
                    >
                        <Phone className="h-5 w-5 mr-2" /> Hubungi Kami
                    </Button>
                </div>
            </div>
        </section>
      </main>

      {/* Footer (Menggunakan footer dari Custom Rute Page yang diubah ke abu-abu terang) */}
      <footer className="bg-gray-100 text-gray-800 py-12 mt-0">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bus size={20} /> Yonstrans
                </CardTitle>
              </CardHeader>
              <p className="text-gray-600">
                Mewujudkan perjalanan impian Anda dengan layanan terpercaya.
              </p>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">Layanan</CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {[
                  { text: "Paket Wisata Domestik", icon: <Plane size={16} /> },
                  { text: "Layanan Dropoff", icon: <Bus size={16} /> },
                  { text: "Rute Kustom", icon: <MapPin size={16} /> },
                  { text: "Bus Pariwisata", icon: <Bus size={16} /> },
                ].map((layanan) => (
                  <motion.li
                    key={layanan.text}
                    className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition"
                    whileHover={{ x: 5 }}
                  >
                    {layanan.icon} {layanan.text}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">
                  Informasi
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                {["Home", "About Us", "Custom Tour", "Contact"].map((dest) => (
                  <motion.li
                    key={dest}
                    className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black transition"
                    whileHover={{ x: 5 }}
                  >
                    <Home size={16} /> {dest}
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card className="bg-transparent border-none shadow-none text-gray-800">
              <CardHeader>
                <CardTitle className="font-semibold">Kontak</CardTitle>
              </CardHeader>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Phone size={16} /> +62 21 1234 5678
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} /> info@yonstrans.com
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} /> Jakarta, Indonesia
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={16} /> 24/7 Support
                </li>
              </ul>
            </Card>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} Yonstrans Travel & Transport. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}