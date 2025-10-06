import React, { memo } from "react";
import { Card, CardContent } from "./ui/card";
import { Shield, Award, Clock, Users } from "lucide-react";

type Feature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Shield,
    title: "Terpercaya & Aman",
    description: "Lisensi resmi & asuransi perjalanan untuk keamanan Anda.",
  },
  {
    icon: Award,
    title: "Berpengalaman",
    description: "10+ tahun melayani wisatawan Indonesia & mancanegara.",
  },
  {
    icon: Clock,
    title: "Support 24/7",
    description: "Tim customer service siap membantu kapan pun.",
  },
  {
    icon: Users,
    title: "Guide Profesional",
    description: "Tour guide berpengalaman & berlisensi resmi.",
  },
];

const CompanyInfo: React.FC = () => {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container mx-auto px-4">
        {/* Heading */}
        <header className="text-center mb-12 md:mb-16">
          <p className="text-xs md:text-sm uppercase tracking-wider font-semibold text-primary/80">
            Mengapa Memilih Kami
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 text-balance">
            Mengapa Memilih <span className="text-primary">Yon'sTrans</span>?
          </h2>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Kami berkomitmen menghadirkan pengalaman perjalanan terbaik dengan kualitas
            layanan yang konsisten dan dapat diandalkan.
          </p>
        </header>

        {/* Features */}
        <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-14 md:mb-20">
          {features.map((feature, i) => (
            <Card
              key={feature.title + i}
              className="h-full border-0 shadow-card hover:shadow-lg hover:-translate-y-1 transition duration-300 bg-white/90 backdrop-blur"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-md">
                  <feature.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-card border overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Text */}
            <div className="p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                Tentang <span className="text-primary">Yon'sTrans</span>
              </h3>

              <div className="mt-4 space-y-4 text-muted-foreground text-pretty">
                <p>
                  TravelKu adalah agen perjalanan terpercaya yang telah melayani
                  ribuan wisatawan sejak 2014. Kami mengkhususkan diri dalam paket
                  wisata domestik dan internasional, berfokus pada kualitas layanan
                  dan kepuasan pelanggan.
                </p>
                <p>
                  Dengan tim berpengalaman dan jaringan mitra di seluruh Indonesia,
                  kami siap mewujudkan perjalanan impian Anda dengan harga kompetitif
                  dan pelayanan profesional.
                </p>
              </div>

              {/* Metrics */}
              <dl className="mt-8 grid grid-cols-2 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 rounded-xl bg-gray-50 p-4">
                <div className="py-3 md:py-0 md:px-6">
                  <dt className="text-xs md:text-sm text-muted-foreground">Tahun Pengalaman</dt>
                  <dd className="text-xl md:text-2xl font-bold text-primary mt-1">10+</dd>
                </div>
                <div className="py-3 md:py-0 md:px-6">
                  <dt className="text-xs md:text-sm text-muted-foreground">Mitra Hotel</dt>
                  <dd className="text-xl md:text-2xl font-bold text-primary mt-1">50+</dd>
                </div>
                <div className="py-3 md:py-0 md:px-6 col-span-2 md:col-span-1">
                  <dt className="text-xs md:text-sm text-muted-foreground">Destinasi</dt>
                  <dd className="text-xl md:text-2xl font-bold text-primary mt-1">100+</dd>
                </div>
                <div className="py-3 md:py-0 md:px-6 col-span-2 md:col-span-1">
                  <dt className="text-xs md:text-sm text-muted-foreground">Pelanggan Puas</dt>
                  <dd className="text-xl md:text-2xl font-bold text-primary mt-1">10K+</dd>
                </div>
              </dl>
            </div>

            {/* Right: Image collage */}
            <div className="relative p-8 md:p-12">
              <div className="relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] rounded-xl overflow-hidden shadow-card">
                <img
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop&auto=format&dpr=2"
                  alt="Tim TravelKu yang siap melayani"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
    

              {/* Small overlay image (collage effect) */}
              <div className="hidden sm:block absolute -top-4 right-8 md:right-12">
                <div className="w-36 h-24 md:w-44 md:h-28 rounded-lg overflow-hidden shadow-lg ring-4 ring-white/70">
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=600&fit=crop&auto=format"
                    alt="Momen perjalanan bersama klien"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default memo(CompanyInfo);
