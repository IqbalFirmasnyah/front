// app/reports/bookings/page.tsx
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Toaster, toast } from "sonner";
import {
  FileDown,
  BarChart2,
  CalendarRange,
  Filter,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

type ReportRow = {
  kode: string;
  tanggalBooking: string | Date | null;
  produk: string;
  lokasiAtauTujuan: string;
  tMulai: string | Date | null;
  tSelesai: string | Date | null;
  durasi: number;
  peserta: number;
  supir: string;
  armada: string;
  status: string;
  estimasi: number;
  customer: string;
  email: string;
};

type ReportData = {
  summary: {
    totalBooking: number;
    totalEstimasi: number;
    byStatus: Record<string, number>;
    byProduk: Record<string, number>;
    generatedAt: string;
    period: { from: string | null; to: string | null };
  };
  rows: ReportRow[];
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n || 0)));
}
function fmtDate(d?: string | Date | null) {
  if (!d) return "-";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "-";
  const dd = x.getDate().toString().padStart(2, "0");
  const mm = (x.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = x.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function statusTone(s: string) {
  const key = (s || "").toLowerCase();
  if (key.includes("confirm")) return "bg-green-100 text-green-800";
  if (key.includes("pending")) return "bg-amber-100 text-amber-800";
  if (key.includes("waiting")) return "bg-blue-100 text-blue-800";
  if (key.includes("cancel") || key.includes("expired"))
    return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
}

// Sesuaikan daftar ini dgn FE; backend akan menormalisasi
const BOOKING_STATUS = [
  { value: "", label: "all status" },
  { value: "waiting", label: "waiting approve admin" }, // FE token 'waiting'
  { value: "pending_payment", label: "pending payment" },
  { value: "confirmed", label: "confirmed" },
  { value: "expired", label: "expired" },
  { value: "cancelled", label: "cancelled" },
];

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BookingsReportContent />
    </Suspense>
  );
}

function BookingsReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [from, setFrom] = useState<string>(searchParams.get("from") || "");
  const [to, setTo] = useState<string>(searchParams.get("to") || "");
  const [status, setStatus] = useState<string>(
    searchParams.get("status") || ""
  );
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const buildQS = useCallback(() => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (status) qs.set("status", status);
    return qs.toString();
  }, [from, to, status]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/reports/bookings?${buildQS()}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Gagal memuat report.");

      setData({
        summary: {
          ...json.data.summary,
          generatedAt: json.data.summary.generatedAt,
          period: {
            from: json.data.summary.period.from,
            to: json.data.summary.period.to,
          },
        },
        rows: json.data.rows as ReportRow[],
      });
      toast.success("Report berhasil dimuat");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal memuat report";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [buildQS, router]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilter = async () => {
    const qs = buildQS();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    await load();
  };

  const resetFilter = async () => {
    setFrom("");
    setTo("");
    setStatus("");
    router.replace(pathname, { scroll: false });
    await load();
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/reports/bookings.pdf?${buildQS()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Gagal mengunduh PDF");
      }
      const blob = await res.blob();
      if (blob.type && !blob.type.includes("pdf")) {
        const text = await blob.text().catch(() => "");
        throw new Error(text || "Response bukan PDF.");
      }
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      const range = `${from || "ALL"}_${to || "ALL"}${
        status ? `_${status}` : ""
      }`;
      a.download = `laporan-booking_${range}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("PDF berhasil diunduh");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Gagal mengunduh PDF";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const statusBadges = useMemo(() => {
    if (!data) return null;
    const entries = Object.entries(data.summary.byStatus);
    if (entries.length === 0)
      return (
        <span className="text-sm text-muted-foreground">Tidak ada data</span>
      );
    return entries.map(([k, v]) => (
      <span
        key={k}
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(
          k
        )}`}
      >
        {k.replace(/_/g, " ")}: {v}
      </span>
    ));
  }, [data]);

  const produkBadges = useMemo(() => {
    if (!data) return null;
    const entries = Object.entries(data.summary.byProduk);
    if (entries.length === 0)
      return (
        <span className="text-sm text-muted-foreground">Tidak ada data</span>
      );
    return entries.map(([k, v]) => (
      <Badge key={k} variant="outline" className="capitalize">
        {k}: {v}
      </Badge>
    ));
  }, [data]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Laporan Booking</h1>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="flex-1 min-w-[160px]">
                  <Input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    aria-label="Dari tanggal"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <Input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    aria-label="Sampai tanggal"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm capitalize"
                    aria-label="Status"
                  >
                    {BOOKING_STATUS.map((o) => (
                      <option key={o.value || "ALL"} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <Button
                    onClick={applyFilter}
                    variant="secondary"
                    disabled={loading}
                    className="whitespace-nowrap"
                  >
                    <Filter className="h-4 w-4 mr-2" /> Terapkan
                  </Button>
                  <Button
                    onClick={resetFilter}
                    variant="ghost"
                    className="whitespace-nowrap"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleDownloadPdf}
                    className="text-black whitespace-nowrap"
                    variant="ocean"
                    disabled={downloading || loading}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                        Mengunduh...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4 mr-2" /> Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Total Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {loading ? "..." : data?.summary.totalBooking ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarRange className="h-4 w-4" /> Periode
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {loading
                  ? "..."
                  : `${fmtDate(data?.summary.period.from)} — ${fmtDate(
                      data?.summary.period.to
                    )}`}
                <div className="mt-1 text-xs text-muted-foreground">
                  Dibuat: {loading ? "..." : fmtDate(data?.summary.generatedAt)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Estimasi Omzet</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {loading ? "..." : formatIDR(data?.summary.totalEstimasi || 0)}
              </CardContent>
            </Card>
          </div>

          {/* Distributions */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 min-h-[40px]">
                {loading ? (
                  <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                ) : (
                  statusBadges
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi Produk</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 min-h-[40px]">
                {loading ? (
                  <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                ) : (
                  produkBadges
                )}
              </CardContent>
            </Card>
          </div>

          {/* Table (desktop) */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" /> Detail Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Tgl/Kode</th>
                    <th className="text-left py-2 pr-4">Produk/Lokasi</th>
                    <th className="text-left py-2 pr-4">Jadwal</th>
                    <th className="text-left py-2 pr-4">Peserta</th>
                    <th className="text-left py-2 pr-4">Supir/Armada</th>
                    <th className="text-left py-2 pr-4">Customer</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2">Estimasi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  )}
                  {!loading && data?.rows?.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Tidak ada data
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    data?.rows?.map((r, i) => (
                      <tr key={r.kode + i} className="border-b">
                        <td className="py-2 pr-4">{i + 1}</td>
                        <td className="py-2 pr-4">
                          {fmtDate(r.tanggalBooking)}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {r.kode}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="font-semibold">{r.produk}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.lokasiAtauTujuan}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          {fmtDate(r.tMulai)} – {fmtDate(r.tSelesai)}
                          <br />
                          <span className="text-xs">{r.durasi} hari</span>
                        </td>
                        <td className="py-2 pr-4">{r.peserta}</td>
                        <td className="py-2 pr-4">
                          {r.supir}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {r.armada}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {r.customer}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {r.email}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(
                              r.status
                            )}`}
                          >
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          {formatIDR(r.estimasi)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <Separator className="my-4" />
              {!loading && data && (
                <div className="text-right text-sm">
                  <span className="mr-2 font-semibold">Total:</span>
                  <span className="font-bold">
                    {formatIDR(data.summary.totalEstimasi)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile list */}
          <div className="md:hidden space-y-4">
            {loading && (
              <Card>
                <CardContent className="p-4">
                  <div className="h-5 w-40 bg-muted rounded animate-pulse mb-3" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            )}
            {!loading && data?.rows?.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Tidak ada data untuk periode ini.
                </CardContent>
              </Card>
            )}
            {!loading &&
              data?.rows?.map((r, i) => (
                <Card key={r.kode + i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          {fmtDate(r.tanggalBooking)}
                        </div>
                        <div className="text-sm font-semibold">{r.kode}</div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(
                          r.status
                        )}`}
                      >
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">{r.produk}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {r.lokasiAtauTujuan}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {fmtDate(r.tMulai)} — {fmtDate(r.tSelesai)} · {r.durasi}{" "}
                      hari
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {r.peserta}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{r.supir}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.armada}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <div className="font-medium">{r.customer}</div>
                        <div className="text-muted-foreground">{r.email}</div>
                      </div>
                      <div className="text-right font-bold">
                        {formatIDR(r.estimasi)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
