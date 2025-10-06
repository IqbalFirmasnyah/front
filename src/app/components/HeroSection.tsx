"use client";

import React from "react";
import { Button } from "./ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Globe2,
  Headphones,
  Plane,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import heroImage from "../assets/hero-travel.jpg";


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Background image (taruh file di: public/images/hero-travel.jpg) */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Pemandangan destinasi tropis Indonesia"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        {/* Linear overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        {/* Radial overlays tanpa Tailwind plugin */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 w-[60rem] h-[60rem] opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(59,130,246,0.3), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 w-[60rem] h-[60rem] opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(56,189,248,0.25), transparent 60%)",
          }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Garansi layanan & harga transparan
            </span>
          </motion.div>

          {/* Headline & sub */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl leading-tight font-extrabold text-white drop-shadow md:text-6xl lg:text-7xl">
              Jelajahi Keindahan
              <span className="block bg-gradient-to-r from-accent to-sunset-end bg-clip-text text-transparent">
                Indonesia
              </span>
            </h1>
            <p className="mt-4 text-base md:text-xl text-white/85">
              Temukan destinasi impian Anda bersama kami—paket wisata terlengkap,
              itinerary fleksibel, dan layanan yang selalu siap membantu.
            </p>
          </motion.div>

          {/* CTA group */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-8 inline-flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur md:flex-row md:items-center md:p-5"
          >
            <div className="flex-1 text-white/90">
              <p className="text-sm md:text-base">
                Siap berangkat? Pilih tanggal atau jelajahi destinasi populer.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }}>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-base md:text-lg px-7 py-6"
                  onClick={() => (window.location.href = "/paket-wisata")}
                  aria-label="Booking Sekarang"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Booking Sekarang
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base md:text-lg px-7 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  onClick={() => (window.location.href = "/paket-wisata")}
                  aria-label="Lihat Destinasi"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Lihat Destinasi
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats tiles */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: Globe2, value: "500+", label: "Destinasi" },
              { icon: Users, value: "10K+", label: "Pelanggan" },
              { icon: Star, value: "4.8", label: "Rating", star: true },
              { icon: Headphones, value: "24/7", label: "Support" },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur transition hover:bg-white/15"
              >
                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10 blur-2xl transition group-hover:opacity-70" />
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15">
                    {item.star ? (
                      <div className="flex items-center">
                        <span className="text-xl font-extrabold ml-1 mr-3">4.8</span>
                        <Star className="h-5 w-5 fill-accent text-accent" />
                      </div>
                    ) : (
                      <item.icon className="h-6 w-6" />
                    )}
                  </div>
                  {!item.star && (
                    <div>
                      <div className="text-2xl font-bold leading-none">{item.value}</div>
                      <div className="text-white/80 text-sm">{item.label}</div>
                    </div>
                  )}
                  {item.star && (
                    <div>
                      <div className="text-white/80 text-sm ml-6">{item.label}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating plane */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 0.35 }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
        className="pointer-events-none absolute right-6 top-16 hidden text-white sm:block md:right-16"
      >
        <Plane size={88} className="-rotate-12 drop-shadow-lg" />
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex h-12 w-7 items-start justify-center rounded-full border-2 border-white/60">
          <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
