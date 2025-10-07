// app/admin/refund/components/RefundsTable.tsx
"use client";

import React from "react";
import {
  CheckCircle,
  XCircle,
  Hash,
  UserRound,
  Wallet,
} from "lucide-react";

interface Refund {
  refundId: number;
  bookingId: number;
  userId: number;
  jumlahRefund: number | string;
  statusRefund: string;
  userName?: string; // <= opsional, kalau backend sudah kasih nama
}

interface RefundsTableProps {
  refunds: Refund[];
  onAction: (refundId: number, action: "approve" | "reject") => void;
  /** opsional: peta userId -> nama user, jika Refund tidak punya userName */
  usersMap?: Record<number, string>;
}

const toNumber = (v: unknown) =>
  typeof v === "number"
    ? v
    : Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  if (s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        Pending
      </span>
    );
  }
  if (s === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
        Approved
      </span>
    );
  }
  if (s === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
      {status}
    </span>
  );
};

const RefundsTable: React.FC<RefundsTableProps> = ({ refunds, onAction, usersMap }) => {
  return (
    <div className="mx-auto max-w-screen-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">Daftar Refund</h2>
        <p className="text-xs text-zinc-500">
          Tinjau permintaan refund dan lakukan persetujuan atau penolakan.
        </p>
      </div>

      {refunds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Tidak ada refund tersedia.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0">
            {/* Lebar kolom diatur agar tidak overscreen */}
            <colgroup>
              <col className="w-16" /> {/* ID */}
              <col className="w-28 sm:w-36" /> {/* Booking ID */}
              <col className="w-40 sm:w-56" /> {/* Pengaju (nama) */}
              <col className="w-40 sm:w-48" /> {/* Jumlah */}
              <col className="w-28" /> {/* Status */}
              <col className="w-40 sm:w-48" /> {/* Aksi */}
            </colgroup>

            <thead>
              <tr className="text-left text-[13px] font-semibold text-zinc-600">
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    ID
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Booking ID
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Pengaju
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Jumlah Refund
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Status
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {refunds.map((r, idx) => {
                const finalAmount = toNumber(r.jumlahRefund);
                const displayName =
                  r.userName ?? usersMap?.[r.userId] ?? "-";

                return (
                  <tr
                    key={r.refundId}
                    className={`text-sm text-zinc-800 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                    } hover:bg-blue-50/40`}
                  >
                    <td className="border-t border-zinc-200 px-3 py-3 font-medium">
                      {r.refundId}
                    </td>

                    <td className="border-t border-zinc-200 px-3 py-3">
                      {r.bookingId}
                    </td>

                    <td className="border-t border-zinc-200 px-3 py-3">
                      <div className="truncate" title={displayName}>
                        {displayName}
                      </div>
                      {/* userId kecil di bawah, berguna bila butuh referensi teknis */}
                      <div className="text-[11px] text-zinc-400">
                        #{r.userId}
                      </div>
                    </td>

                    <td className="border-t border-zinc-200 px-3 py-3 font-semibold">
                      {formatIDR(finalAmount)}
                    </td>

                    <td className="border-t border-zinc-200 px-3 py-3">
                      <StatusBadge status={r.statusRefund} />
                    </td>

                    <td className="border-t border-zinc-200 px-3 py-3">
                      {r.statusRefund.toUpperCase() === "PENDING" ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onAction(r.refundId, "approve")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-green-700/20 transition hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => onAction(r.refundId, "reject")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-rose-700/20 transition hover:bg-rose-700"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RefundsTable;
