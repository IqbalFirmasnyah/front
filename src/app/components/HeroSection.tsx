"use client";

import React from "react";
import { Button } from "./ui/button";
import { MapPin, Calendar, Users, Star, Globe2, Headphones, Plane } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroImage from "../assets/hero-travel.jpg";

const HeroSection: React.FC = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Beautiful tropical destination"
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-black/40"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Jelajahi Keindahan
              <span className="block bg-gradient-to-r from-accent to-sunset-end bg-clip-text text-transparent">
                Indonesia
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Temukan destinasi impian Anda bersama kami. Paket wisata terlengkap
              dengan harga terbaik dan pelayanan terpercaya.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="hero"
                size="lg"
                className="text-lg px-8 py-6"
                onClick={() => (window.location.href = "/packages")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Booking Sekarang
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => (window.location.href = "/packages")}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Lihat Destinasi
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
          >
            <div className="text-center space-y-2">
              <Globe2 className="mx-auto h-8 w-8 text-accent" />
              <div className="text-3xl font-bold">500+</div>
              <div className="text-white/80">Destinasi</div>
            </div>
            <div className="text-center space-y-2">
              <Users className="mx-auto h-8 w-8 text-accent" />
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-white/80">Pelanggan</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold">4.8</span>
                <Star className="ml-2 h-7 w-7 fill-accent text-accent" />
              </div>
              <div className="text-white/80">Rating</div>
            </div>
            <div className="text-center space-y-2">
              <Headphones className="mx-auto h-8 w-8 text-accent" />
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-white/80">Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Decorative Icon */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-20 right-16 text-white"
      >
        <Plane size={80} />
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
