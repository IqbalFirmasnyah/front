"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Phone, Mail, MapPin, Clock, Plane, Globe2, Home } from "lucide-react";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import PopularPackages from "./components/PopularPackages";
import CompanyInfo from "./components/CompanyInfo";
import DebugDiagnostics from "@/components/DebugDiagnostics";
import Footer from "./components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header pakai komponen custom */}
      <Header currentPage="home" />
      <main className="flex-1">
        <HeroSection />
        <section className=" container mx-auto px-6">
          <PopularPackages />
        </section>
        <DebugDiagnostics />
        <section className="py-12 container mx-auto px-6">
          <CompanyInfo />
        </section>
          <Footer />
      </main>
    </div>
  );
};

export default Index;



