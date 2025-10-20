"use client";

import * as React from "react";
import { X, History, CalendarDays, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RescheduleItem = {
  rescheduleId: number;
  bookingId: number;
  tanggalLama: string; // ISO
  tanggalBaru: string; // ISO
  status: "pending" | "approved" | "rejected" | string;
  alasan?: string | null;
  createdAt?: string | null;
};

interface RescheduleHistoryModalProps {
  bookingId: number;
  open: boolean;
  onClose: () => void;
}

const statusPill = (status: string) => {
  const s = status.toLowerCase();
  if (s === "approved")
    return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  if (s === "pending") return "bg-blue-100 text-blue-700 ring-blue-200";
  if (s === "rejected") return "bg-rose-100 text-rose-700 ring-rose-200";
  return "bg-zinc-100 text-zinc-700 ring-zinc-200";
};

export default function RescheduleHistoryModal({
  bookingId,
  open,
  onClose,
}: RescheduleHistoryModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<RescheduleItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHistory = async () => {
    if (!open) return;
    setLoading(true);
    setError(null);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Unauthorized");
      const base = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${base}/reschedule/by-booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || res.statusText);

      const list: RescheduleItem[] = (json.data || []).map((r: any) => ({
        rescheduleId: r.rescheduleId,
        bookingId: r.bookingId,
        tanggalLama: r.tanggalLama,
        tanggalBaru: r.tanggalBaru,
        status: r.status,
        alasan: r.alasan ?? null,
        createdAt: r.createdAt ?? null,
      }));
      setItems(list);
    } catch (e: any) {
      setError(e.message || "Gagal memuat riwayat reschedule.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="relative z-[61] w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-zinc-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-700" />
            <h3 className="text-base font-semibold text-zinc-900">
              Riwayat Reschedule
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 transition"
            aria-label="Tutup"
            title="Tutup"
          >
            <X className="h-5 w-5 text-zinc-600" />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="text-sm text-zinc-600">Memuat riwayat...</div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 text-sm text-rose-600">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-sm text-zinc-600">
              Belum ada riwayat reschedule.
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.rescheduleId}
                  className="rounded-xl border border-zinc-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset capitalize",
                        statusPill(it.status)
                      )}
                    >
                      {it.status.replace(/_/g, " ")}
                    </span>
                    {it.createdAt ? (
                      <span className="text-xs text-zinc-500">
                        Dibuat: {new Date(it.createdAt).toLocaleString("id-ID")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-700">
                    <CalendarDays className="h-4 w-4 text-zinc-500" />
                    <span>
                      {new Date(it.tanggalLama).toLocaleDateString("id-ID")}{" "}
                      {" → "}
                      {new Date(it.tanggalBaru).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  {it.alasan ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      Alasan: {it.alasan}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
