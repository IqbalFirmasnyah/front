"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function RefundRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get("bookingId");
  const pembayaranId = searchParams.get("pembayaranId");

  const [alasanRefund, setAlasanRefund] = useState("");
  const [jumlahRefund, setJumlahRefund] = useState("");
  const [metodeRefund, setMetodeRefund] = useState("transfer_bank");
  const [rekeningTujuan, setRekeningTujuan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(
        `http://localhost:3001/refunds/booking/${bookingId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pembayaranId: pembayaranId ? parseInt(pembayaranId) : undefined,
            alasanRefund,
            jumlahRefund: parseFloat(jumlahRefund),
            metodeRefund,
            rekeningTujuan,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal mengajukan refund.");
      }

      alert("Pengajuan refund berhasil diajukan!");
      router.push("/my-bookings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold mb-6">Ajukan Refund</h1>

            {error && (
              <div className="mb-4 flex items-center bg-red-50 border border-red-200 rounded p-3 text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Alasan Refund</label>
                <textarea
                  value={alasanRefund}
                  onChange={(e) => setAlasanRefund(e.target.value)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Jumlah Refund</label>
                <input
                  type="number"
                  value={jumlahRefund}
                  onChange={(e) => setJumlahRefund(e.target.value)}
                  className="w-full border rounded p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Metode Refund</label>
                <select
                  value={metodeRefund}
                  onChange={(e) => setMetodeRefund(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="transfer_bank">Transfer Bank</option>
                  <option value="e-wallet">E-Wallet</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {metodeRefund !== "cash" && (
                <div>
                  <label className="block font-medium mb-1">
                    Rekening / E-Wallet Tujuan
                  </label>
                  <input
                    type="text"
                    value={rekeningTujuan}
                    onChange={(e) => setRekeningTujuan(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              )}

              <Button
                className="text-black"
                type="submit"
                variant="ocean"
                disabled={loading}
              >
                {loading ? "Mengajukan..." : "Ajukan Refund"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
