"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Plane,
  Globe2,
  Home,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const services = [
    { text: "Paket Wisata Lokal", icon: <Plane size={16} /> },
    { text: "Paket Wisata Luar Kota", icon: <Globe2 size={16} /> },
    { text: "Hotel & Akomodasi", icon: <Home size={16} /> },
    { text: "Transportasi", icon: <MapPin size={16} /> },
  ];

  const destinations = ["Bali", "Yogyakarta", "Malang", "Bandung"];

  const socials = [
    { name: "Instagram", icon: <Instagram size={18} />, href: "#" },
    { name: "Twitter", icon: <Twitter size={18} />, href: "#" },
    { name: "LinkedIn", icon: <Linkedin size={18} />, href: "#" },
    { name: "YouTube", icon: <Youtube size={18} />, href: "#" },
  ];

  return (
    <footer className="relative bg-primary text-primary-foreground mt-16">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl opacity-60" />

      {/* Newsletter */}


      {/* Main */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand / Company */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="text-xl flex items-center gap-2 text-white">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
                  <Plane size={18} />
                </span>
                Yon'sTrans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-primary-foreground/80">
              Kami mewujudkan perjalanan impian Anda dengan layanan terpercaya,
              rute fleksibel, dan pengalaman yang tak terlupakan.
              <div className="mt-4 flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="font-semibold text-white">Layanan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2">
                {services.map((item) => (
                  <motion.li
                    key={item.text}
                    className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                    whileHover={{ x: 6 }}
                  >
                    {item.icon} {item.text}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Destinations */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="font-semibold text-white">Destinasi Populer</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2">
                {destinations.map((dest) => (
                  <motion.li
                    key={dest}
                    className="flex items-center gap-2 cursor-pointer text-primary-foreground/80 hover:text-white transition"
                    whileHover={{ x: 6 }}
                  >
                    <MapPin size={16} /> {dest}
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="font-semibold text-white">Kontak</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="space-y-2 text-primary-foreground/80">
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
            </CardContent>
          </Card>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-primary-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/80">
          <p className="text-center md:text-left">
            &copy; {year} Yon'sTrans Indonesia. All rights reserved.
          </p>
          <nav className="flex items-center gap-5">
            <a href="#" className="hover:underline">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:underline">
              Syarat & Ketentuan
            </a>
            <a href="#" className="hover:underline">
              Sitemap
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
