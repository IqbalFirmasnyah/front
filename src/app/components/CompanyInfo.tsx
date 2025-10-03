import React from 'react';
import { Card, CardContent } from './ui/card';
import { Shield, Award, Clock, Users } from 'lucide-react';

const CompanyInfo: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Terpercaya & Aman',
      description: 'Dengan lisensi resmi dan asuransi perjalanan untuk keamanan Anda'
    },
    {
      icon: Award,
      title: 'Berpengalaman',
      description: 'Lebih dari 10 tahun melayani wisatawan Indonesia dan mancanegara'
    },
    {
      icon: Clock,
      title: 'Support 24/7',
      description: 'Tim customer service siap membantu Anda kapan saja'
    },
    {
      icon: Users,
      title: 'Guide Profesional',
      description: 'Tour guide berpengalaman dan berlisensi resmi'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Mengapa Memilih TravelKu?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kami berkomitmen memberikan pengalaman perjalanan terbaik dengan layanan berkualitas tinggi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-soft transition-all duration-300 border-0 shadow-card">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-card">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Tentang TravelKu</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  TravelKu adalah agen perjalanan terpercaya yang telah melayani ribuan wisatawan 
                  sejak tahun 2014. Kami mengkhususkan diri dalam paket wisata domestik dan 
                  internasional dengan fokus pada kualitas layanan dan kepuasan pelanggan.
                </p>
                <p>
                  Dengan tim yang berpengalaman dan jaringan mitra di seluruh Indonesia, 
                  kami siap mewujudkan perjalanan impian Anda dengan harga yang kompetitif 
                  dan pelayanan yang memuaskan.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <div className="text-2xl font-bold text-primary">10+</div>
                    <div className="text-sm">Tahun Pengalaman</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm">Mitra Hotel</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-sm">Destinasi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-sm">Pelanggan Puas</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop"
                alt="TravelKu Team"
                className="rounded-xl shadow-soft w-full"
              />
              <div className="absolute -bottom-4 -left-4 bg-gradient-tropical p-4 rounded-lg text-white">
                <div className="text-2xl font-bold">4.8/5</div>
                <div className="text-sm">Rating Pelanggan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyInfo;