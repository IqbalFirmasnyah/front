"use client";

import * as React from "react";
import { CreditCard, CalendarDays, Car, User, RefreshCcw, Wallet, BadgeDollarSign, History } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import RescheduleHistoryModal from "@/app/components/RescheduleHistoryModal";

type RescheduleBrief = {
  rescheduleId: number;
  bookingId: number;
  tanggalLama: string;
  tanggalBaru: string;
  status: "pending" | "approved" | "rejected" | string;
};

type Booking = {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
  statusBooking: string;
  jumlahPeserta: number;
  estimasiHarga: string | number;
  paket?: { namaPaket: string; lokasi: string };
  paketLuarKota?: { namaPaket: string; tujuanUtama: string };
  fasilitas?: { namaFasilitas: string; jenisFasilitas: string };
  supir?: { nama: string; nomorHp: string };
  armada?: { jenisMobil: string; platNomor: string };
  pembayaran?: {
    pembayaranId: number;
    jumlahPembayaran: string;
    statusPembayaran: string;
    tanggalPembayaran: string;
  };
  refundStatus?: string | null;
  statusRefund?: string | null;
  refundFinalAmount?: number | string | null;
  refund?: {
    refundId: number;
    statusRefund: string;
    jumlahRefundFinal: number | string | null;
  } | null;

  // ⬇️ ditambahkan
  latestReschedule?: RescheduleBrief | null;
};

interface BookingCardProps {
  booking: Booking;
  onPayment: (bookingId: number) => void;
  onRefund: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  processingPaymentId: number | null;
  paymentLoading: boolean;
}

const formatMoney = (n: string | number) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(num)) return n as any;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const badgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("confirm")) return "bg-green-100 text-green-700 ring-green-200";
  if (s.includes("pending")) return "bg-yellow-100 text-yellow-800 ring-yellow-200";
  if (s.includes("cancel") || s.includes("expire")) return "bg-red-100 text-red-700 ring-red-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
};

const rescheduleBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved") return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s === "pending")  return "bg-blue-100 text-blue-700 ring-blue-200";
  if (s === "rejected") return "bg-rose-100 text-rose-700 ring-rose-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
};

const RefundBadge: React.FC<{ status?: string | null }> = ({ status }) => {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls =
    s === "approved"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : s === "processing"
      ? "bg-blue-100 text-blue-700 ring-blue-200"
      : s === "completed"
      ? "bg-green-100 text-green-700 ring-green-200"
      : s === "rejected"
      ? "bg-rose-100 text-rose-700 ring-rose-200"
      : "bg-amber-100 text-amber-700 ring-amber-200";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize", cls)}>
      <BadgeDollarSign className="h-3.5 w-3.5" />
      {status.replace(/_/g, " ")}
    </span>
  );
};

const titleFromBooking = (b: Booking) => {
  if (b.paket) return `${b.paket.namaPaket} • ${b.paket.lokasi}`;
  if (b.paketLuarKota) return `${b.paketLuarKota.namaPaket} • ${b.paketLuarKota.tujuanUtama}`;
  if (b.fasilitas) return `${b.fasilitas.namaFasilitas} • ${b.fasilitas.jenisFasilitas}`;
  return `Booking #${b.bookingId}`;
};

export default function BookingCard({
  booking,
  onPayment,
  onRefund,
  onReschedule,
  processingPaymentId,
  paymentLoading,
}: BookingCardProps) {
  const isPaying = processingPaymentId === booking.bookingId && paymentLoading;

  const pembayaranSelesai =
    booking.pembayaran?.statusPembayaran &&
    ["settlement", "capture", "success", "paid", "lunas"].some((k) =>
      booking.pembayaran!.statusPembayaran.toLowerCase().includes(k)
    );

  const pembayaranPending =
    booking.pembayaran?.statusPembayaran &&
    booking.pembayaran!.statusPembayaran.toLowerCase().includes("pending");

  const isConfirmed = booking.statusBooking.toLowerCase().includes("confirm");
  const showPayButton = !pembayaranSelesai && !isConfirmed;

  const refundStatus = booking.refund?.statusRefund ?? booking.refundStatus ?? booking.statusRefund ?? null;
  const refundFinal = booking.refund?.jumlahRefundFinal ?? booking.refundFinalAmount ?? null;

  // ⬇️ state modal riwayat
  const [historyOpen, setHistoryOpen] = React.useState(false);

  return (
    <>
      <Card className="overflow-hidden border border-zinc-200 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">{titleFromBooking(booking)}</h3>
            <div className="flex items-center gap-2">
              {refundStatus ? <RefundBadge status={refundStatus} /> : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize",
                  badgeClass(booking.statusBooking)
                )}
              >
                {booking.statusBooking.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
              <span>
                {new Date(booking.tanggalMulaiWisata).toLocaleDateString("id-ID")} –{" "}
                {new Date(booking.tanggalSelesaiWisata).toLocaleDateString("id-ID")}
              </span>
            </div>
            {booking.armada?.jenisMobil && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-zinc-500" />
                <span>
                  {booking.armada.jenisMobil}
                  {booking.armada.platNomor ? ` • ${booking.armada.platNomor}` : ""}
                </span>
              </div>
            )}
            {booking.supir?.nama && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-500" />
                <span>Supir: {booking.supir.nama}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-zinc-500" />
              <span>Total: <strong>{formatMoney(booking.estimasiHarga)}</strong></span>
            </div>

            {/* == Info reschedule terbaru (opsional) == */}
            {booking.latestReschedule && (
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3 mt-1">
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize",
                  rescheduleBadgeClass(booking.latestReschedule.status)
                )}>
                  Reschedule {booking.latestReschedule.status.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-zinc-600">
                  {new Date(booking.latestReschedule.tanggalLama).toLocaleDateString("id-ID")}
                  {" → "}
                  {new Date(booking.latestReschedule.tanggalBaru).toLocaleDateString("id-ID")}
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-100 my-2" />

          <div className="flex flex-wrap items-center gap-2">
            {showPayButton && (
              <Button
                onClick={() => onPayment(booking.bookingId)}
                disabled={isPaying || isConfirmed}
                className="inline-flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {isPaying ? "Memproses..." : pembayaranPending ? "Lanjutkan Pembayaran" : "Bayar Sekarang"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onReschedule(booking)}
              className="inline-flex items-center gap-2"
              disabled={booking.latestReschedule?.status === "pending"}
              title={booking.latestReschedule?.status === "pending"
                ? "Menunggu keputusan admin untuk pengajuan sebelumnya"
                : undefined}
            >
              <RefreshCcw className="h-4 w-4" />
              {booking.latestReschedule?.status === "pending" ? "Reschedule (Pending)" : "Reschedule"}
            </Button>

            {/* Tombol buka Modal Riwayat */}
            <Button
              variant="ghost"
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Riwayat Reschedule
            </Button>

            {booking.pembayaran?.pembayaranId && (
              <Button variant="ghost" onClick={() => onRefund(booking)} className="inline-flex items-center gap-2">
                Refund
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Riwayat */}
      <RescheduleHistoryModal
        bookingId={booking.bookingId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
