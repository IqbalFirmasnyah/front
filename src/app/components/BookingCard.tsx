'use client';

import {
  CreditCard,
  Loader2,
  RefreshCw,
  XCircle,
  Calendar,
  MapPin,
  Users,
  Car,
  User,
  Clock,
  CalendarClock,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { useMemo } from "react";
import { JSX } from "react/jsx-runtime";

interface Reschedule {
  status: string;
  rescheduleId: number;
  tanggalBaru: string;
  alasan?: string;
  createdAt: string;
}

interface Booking {
  bookingId: number;
  kodeBooking: string;
  tanggalMulaiWisata: string;
  tanggalSelesaiWisata: string;
  statusBooking: string;
  jumlahPeserta: number;
  estimasiHarga: string | number; // backend bisa kirim string/number
  catatanKhusus?: string;
  reschedules?: Reschedule[];
  paket?: { namaPaket: string; lokasi: string; fotoPaket: string };
  paketLuarKota?: { namaPaket: string; tujuanUtama: string };
  fasilitas?: {
    namaFasilitas: string;
    jenisFasilitas: string;
    dropoff?: { namaTujuan: string; alamatTujuan: string };
    customRute?: { tujuanList: string[]; catatanKhusus?: string };
    paketLuarKota?: { namaPaket: string; tujuanUtama: string };
  };
  supir?: { nama: string; nomorHp: string };
  armada?: { jenisMobil: string; platNomor: string };
  payment?: {
    pembayaranId: number;
    jumlahPembayaran: string;
    statusPembayaran: string;
    tanggalPembayaran: string;
  };
}

interface BookingCardProps {
  booking: Booking;
  onPayment: (bookingId: number) => void;
  onRefund: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel?: (bookingId: number) => void;
  processingPaymentId: number | null;
  paymentLoading?: boolean;
}

/** "Rp 1.250.000" / "1.250.000" / "1250000" -> 1250000 */
function parseIDRToNumber(val: string | number): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  const digits = (val || "").toString().replace(/[^\d]/g, "");
  const n = Number(digits);
  return isNaN(n) ? 0 : n;
}
function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPayment,
  onRefund,
  onReschedule,
  onCancel,
  processingPaymentId,
}) => {
  const isProcessing = processingPaymentId === booking.bookingId;
  const estimasiHargaNumber = useMemo(
    () => parseIDRToNumber(booking.estimasiHarga),
    [booking.estimasiHarga]
  );

  // Ambil reschedule terbaru TANPA mutasi props
  const latestReschedule = useMemo(() => {
    if (!booking.reschedules?.length) return undefined;
    return [...booking.reschedules].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [booking.reschedules]);

  const isReschedulePending = latestReschedule?.status === "pending";
  const hasApprovedReschedule = latestReschedule?.status === "approved";
  const hasRejectedReschedule = latestReschedule?.status === "rejected";

  const getStatusColor = (status: string) => {
    if (isReschedulePending) return "bg-purple-600";
    if (hasApprovedReschedule) return "bg-green-600";
    switch (status) {
      case "cancelled":
        return "bg-red-500";
      case "confirmed":
        return "bg-blue-500";
      case "payment_verified":
        return "bg-blue-600";
      case "pending_payment":
        return "bg-yellow-500";
      case "expired":
        return "bg-gray-500";
      case "refund_requested":
        return "bg-purple-600";
      case "refunded":
        return "bg-orange-600";
      case "payment_CONFIRMED":
        return "bg-emerald-600";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    if (isReschedulePending) return "Menunggu Persetujuan Reschedule";
    if (hasApprovedReschedule) return "Reschedule Disetujui";
    return status.replace(/_/g, " ");
  };

  const canPay = (status: string) => ["confirmed", "pending_payment"].includes(status);
  const canRefund = (status: string) => status === "confirmed";
  const canReschedule = (status: string) =>
    status === "confirmed" && !isReschedulePending && !hasApprovedReschedule;
  const canCancel = (status: string) => ["pending_payment", "confirmed"].includes(status);

  // Safe date formatting helpers
  const fmtDateTime = (dateString?: string) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "Tanggal tidak valid" : format(d, "dd/MM/yyyy HH:mm");
  };
  const fmtDate = (dateString?: string) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "Tanggal tidak valid" : format(d, "dd/MM/yyyy");
  };

  const RescheduleStatusSection = () => {
    if (!latestReschedule) return null;

    const { status, tanggalBaru, alasan, createdAt, rescheduleId } = latestReschedule;

    let icon: JSX.Element;
    let badgeClass: string;
    let badgeText: string;
    let infoTitle: string;
    let infoMsg: string;
    let boxClass: string;

    switch (status) {
      case "pending":
        icon = <AlertCircle className="h-4 w-4 text-yellow-600" />;
        badgeClass = "bg-yellow-50 text-yellow-800 border-yellow-200";
        badgeText = "Menunggu Persetujuan";
        infoTitle = "Menunggu Persetujuan Reschedule";
        infoMsg = "Permintaan reschedule Anda sedang diproses. Kami akan segera menginformasikan status terbaru.";
        boxClass = "bg-yellow-50 border border-yellow-200";
        break;
      case "approved":
        icon = <CheckCircle className="h-4 w-4 text-green-600" />;
        badgeClass = "bg-green-50 text-green-800 border-green-200";
        badgeText = "Disetujui";
        infoTitle = "Reschedule Disetujui!";
        infoMsg = `Tanggal perjalanan Anda telah diubah ke ${fmtDate(tanggalBaru)}. Silakan periksa detail lengkap.`;
        boxClass = "bg-green-50 border border-green-200";
        break;
      case "rejected":
        icon = <XCircle className="h-4 w-4 text-red-600" />;
        badgeClass = "bg-red-50 text-red-800 border-red-200";
        badgeText = "Ditolak";
        infoTitle = "Reschedule Ditolak";
        infoMsg = "Permintaan reschedule Anda tidak dapat disetujui. Anda dapat mengajukan reschedule baru atau hubungi customer service.";
        boxClass = "bg-red-50 border border-red-200";
        break;
      default:
        return null;
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-800 flex items-center">
          <CalendarClock className="h-4 w-4 mr-2" />
          Status Reschedule
        </h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {icon}
              <Badge variant="outline" className={badgeClass}>
                {badgeText}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">#{rescheduleId}</div>
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal baru:</span>
              <span className="font-medium">{fmtDate(tanggalBaru)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diajukan:</span>
              <span>{fmtDateTime(createdAt)}</span>
            </div>
            {alasan && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600 text-xs">Alasan:</span>
                <p className="text-sm text-gray-800 bg-white p-2 rounded border mt-1">{alasan}</p>
              </div>
            )}
          </div>

          <div className={`${boxClass} rounded-md p-3 mt-2`}>
            <div className="flex items-start">
              <Info
                className={`h-4 w-4 ${
                  status === "approved" ? "text-green-600" : status === "pending" ? "text-yellow-600" : "text-red-600"
                } mt-0.5 mr-2 flex-shrink-0`}
              />
              <div className="text-sm">
                <p
                  className={`font-medium ${
                    status === "approved" ? "text-green-800" : status === "pending" ? "text-yellow-800" : "text-red-800"
                  }`}
                >
                  {infoTitle}
                </p>
                <p
                  className={`mt-1 ${
                    status === "approved" ? "text-green-700" : status === "pending" ? "text-yellow-700" : "text-red-700"
                  }`}
                >
                  {infoMsg}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tripName =
    booking.paket?.namaPaket ||
    booking.paketLuarKota?.namaPaket ||
    booking.fasilitas?.namaFasilitas ||
    "Detail Perjalanan";

  const locationDetails =
    booking.paket?.lokasi ||
    booking.paketLuarKota?.tujuanUtama ||
    booking.fasilitas?.dropoff?.namaTujuan ||
    (booking.fasilitas?.jenisFasilitas === "custom" ? "Rute Custom" : undefined);

  const formattedStartDate = fmtDate(booking.tanggalMulaiWisata);
  const formattedEndDate = fmtDate(booking.tanggalSelesaiWisata);

  return (
    <Card className="overflow-hidden border shadow-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">{tripName}</CardTitle>
            {locationDetails && (
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {locationDetails}
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(booking.statusBooking)} capitalize`}>
            {getStatusText(booking.statusBooking)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-3 text-primary" />
            <div>
              <div className="font-medium">Tanggal Perjalanan</div>
              <div className="text-sm text-muted-foreground">
                {hasApprovedReschedule && latestReschedule?.tanggalBaru ? (
                  <>
                    <span className="line-through text-gray-400">{formattedStartDate}</span>
                    <br />
                    <span className="text-green-600 font-semibold">
                      {fmtDate(latestReschedule.tanggalBaru)} (Baru)
                    </span>
                  </>
                ) : (
                  `${formattedStartDate} - ${formattedEndDate}`
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Users className="h-5 w-5 mr-3 text-primary" />
            <div>
              <div className="font-medium">Peserta</div>
              <div className="text-sm text-muted-foreground">{booking.jumlahPeserta} orang</div>
            </div>
          </div>

          {booking.supir && (
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Supir</div>
                <div className="text-sm text-muted-foreground">{booking.supir.nama}</div>
              </div>
            </div>
          )}

          {booking.armada && (
            <div className="flex items-center">
              <Car className="h-5 w-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">Armada</div>
                <div className="text-sm text-muted-foreground">{booking.armada.jenisMobil}</div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <RescheduleStatusSection />

        <Separator />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="text-sm text-muted-foreground">Total Pembayaran</div>
            <div className="text-2xl font-bold text-primary">{formatIDR(estimasiHargaNumber)}</div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            {canPay(booking.statusBooking) && (
              <Button
                onClick={() => onPayment(booking.bookingId)}
                variant="ocean"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2 text-black" />
                    Bayar Sekarang
                  </>
                )}
              </Button>
            )}

            {canReschedule(booking.statusBooking) && (
              <Button variant="outline" onClick={() => onReschedule(booking)}>
                <CalendarClock className="h-4 w-4 mr-2" />
                {hasRejectedReschedule ? "Reschedule Lagi" : "Reschedule"}
              </Button>
            )}

            {canRefund(booking.statusBooking) && (
              <Button onClick={() => onRefund(booking)} variant="destructive">
                <RefreshCw className="h-4 w-4 mr-2" />
                Ajukan Refund
              </Button>
            )}

            {canCancel(booking.statusBooking) && onCancel && (
              <Button onClick={() => onCancel(booking.bookingId)} variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Batalkan
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Kode Booking: {booking.kodeBooking}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
