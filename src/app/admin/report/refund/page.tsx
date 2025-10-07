"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Header from '@/app/components/Header';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { Toaster, toast } from 'sonner';
import { FileDown, BarChart2, Calendar, Filter } from 'lucide-react';

const API_BASE = '${process.env.NEXT_PUBLIC_API_URL}';

type RefundRow = {
  kodeRefund: string;
  tanggalPengajuan: string | Date | null;
  kodeBooking: string | null;
  produk: string;
  customer: string;
  email: string;
  status: string;
  metode: string;
  potonganAdmin: number;
  bruto: number;
  final: number;
  tanggalDisetujui?: string | Date | null;
  tanggalSelesai?: string | Date | null;
};

type RefundData = {
  summary: {
    totalPengajuan: number;
    totalFinal: number;
    byStatus: Record<string, number>;
    byMetode: Record<string, number>;
    generatedAt: string;
    period: { from: string | null; to: string | null };
  };
  rows: RefundRow[];
};

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(Math.max(0, Math.round(n || 0)));
}
function fmtDate(d?: string | Date | null) {
  if (!d) return '-';
  const x = new Date(d);
  if (isNaN(x.getTime())) return '-';
  const dd = x.getDate().toString().padStart(2,'0');
  const mm = (x.getMonth()+1).toString().padStart(2,'0');
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const STATUS = ['', 'pending', 'approved', 'processing', 'completed', 'rejected'];

/** Page component hanya membungkus child dengan Suspense */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RefundsReportContent />
    </Suspense>
  );
}

/** Child component yang memakai useSearchParams */
function RefundsReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState<string>(searchParams.get('from') || '');
  const [to, setTo] = useState<string>(searchParams.get('to') || '');
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [data, setData] = useState<RefundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const buildQS = useCallback(() => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    if (status) qs.set('status', status);
    return qs.toString();
  }, [from, to, status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/reports/refunds?${buildQS()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Gagal memuat report refund.');

      setData({
        summary: {
          ...json.data.summary,
          generatedAt: json.data.summary.generatedAt,
          period: {
            from: json.data.summary.period.from,
            to: json.data.summary.period.to,
          },
        },
        rows: json.data.rows as RefundRow[],
      });
      toast.success('Report refund berhasil dimuat');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Gagal memuat report refund';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [buildQS, router]);

  useEffect(() => {
    // panggil saat mount dan setiap filter berubah
    load();
  }, [load]);

  const applyFilter = async () => {
    const qs = buildQS();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    await load();
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/reports/refunds.pdf?${buildQS()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Gagal mengunduh PDF');
      }

      const blob = await res.blob();
      if (blob.type && !blob.type.includes('pdf')) {
        const text = await blob.text().catch(() => '');
        throw new Error(text || 'Response bukan PDF.');
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const range = `${from || 'ALL'}_${to || 'ALL'}${status ? `_${status}` : ''}`;
      a.href = url;
      a.download = `laporan-refund_${range}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('PDF refund berhasil diunduh');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Gagal mengunduh PDF';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const statusBadges = useMemo(() => {
    if (!data) return null;
    return Object.entries(data.summary.byStatus).map(([k, v]) => (
      <Badge key={k} variant="secondary" className="capitalize">
        {k.replace(/_/g, ' ')}: {v}
      </Badge>
    ));
  }, [data]);

  const metodeBadges = useMemo(() => {
    if (!data) return null;
    return Object.entries(data.summary.byMetode).map(([k, v]) => (
      <Badge key={k} variant="outline" className="capitalize">
        {k}: {v}
      </Badge>
    ));
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header + Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Laporan Refund</h1>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="w-full md:w-auto" />
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="w-full md:w-auto" />
              <select
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm w-full md:w-auto"
              >
                {STATUS.map(s => <option key={s || 'ALL'} value={s}>{s ? s : 'all status'}</option>)}
              </select>
              <Button onClick={applyFilter} variant="secondary">
                <Filter className="h-4 w-4 mr-2" /> Terapkan
              </Button>
              <Button onClick={handleDownloadPdf} className="text-black" variant="ocean" disabled={downloading}>
                <FileDown className="h-4 w-4 mr-2" />
                {downloading ? 'Mengunduh...' : 'Download PDF'}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Total Pengajuan</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">
                {loading ? '...' : data?.summary.totalPengajuan ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Total Refund Final</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold">
                {loading ? '...' : formatIDR(data?.summary.totalFinal || 0)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Dibuat</CardTitle></CardHeader>
              <CardContent className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {loading ? '...' : fmtDate(data?.summary.generatedAt || new Date())}
              </CardContent>
            </Card>
          </div>

          {/* Distribusi */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Distribusi Status</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {loading ? '...' : (statusBadges || <span className="text-sm text-muted-foreground">Tidak ada data</span>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Distribusi Metode</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {loading ? '...' : (metodeBadges || <span className="text-sm text-muted-foreground">Tidak ada data</span>)}
              </CardContent>
            </Card>
          </div>

          {/* Tabel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" /> Detail Refund
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Tgl/Kode Refund</th>
                    <th className="text-left py-2 pr-4">Kode Booking/Produk</th>
                    <th className="text-left py-2 pr-4">Customer</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Metode</th>
                    <th className="text-right py-2 pr-2">Bruto</th>
                    <th className="text-right py-2 pr-2">Potongan</th>
                    <th className="text-right py-2">Final</th>
                    <th className="text-left py-2 pl-2">Approval/Selesai</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={10} className="py-6 text-center text-muted-foreground">Memuat data...</td></tr>
                  )}
                  {!loading && data?.rows?.length === 0 && (
                    <tr><td colSpan={10} className="py-6 text-center text-muted-foreground">Tidak ada data</td></tr>
                  )}
                  {!loading && data?.rows?.map((r, i) => (
                    <tr key={r.kodeRefund} className="border-b">
                      <td className="py-2 pr-4">{i + 1}</td>
                      <td className="py-2 pr-4">
                        {fmtDate(r.tanggalPengajuan)}<br/>
                        <span className="text-xs text-muted-foreground">{r.kodeRefund}</span>
                      </td>
                      <td className="py-2 pr-4">
                        {r.kodeBooking ?? '-'}<br/>
                        <span className="text-xs text-muted-foreground">{r.produk}</span>
                      </td>
                      <td className="py-2 pr-4">
                        {r.customer}<br/>
                        <span className="text-xs text-muted-foreground">{r.email}</span>
                      </td>
                      <td className="py-2 pr-4 capitalize">{r.status.replace(/_/g, ' ')}</td>
                      <td className="py-2 pr-4">{r.metode}</td>
                      <td className="py-2 pr-2 text-right">{formatIDR(r.bruto)}</td>
                      <td className="py-2 pr-2 text-right">- {formatIDR(r.potonganAdmin)}</td>
                      <td className="py-2 text-right font-bold">{formatIDR(r.final)}</td>
                      <td className="py-2 pl-2">
                        {r.tanggalDisetujui ? `Disetujui: ${fmtDate(r.tanggalDisetujui)}` : '-'}
                        <br />
                        {r.tanggalSelesai ? <span className="text-xs text-muted-foreground">Selesai: {fmtDate(r.tanggalSelesai)}</span> : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Separator className="my-4" />
              {!loading && data && (
                <div className="text-right text-sm">
                  <span className="mr-2 font-semibold">Total Final:</span>
                  <span className="font-bold">{formatIDR(data.summary.totalFinal)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
