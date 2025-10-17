// app/admin/refund/components/RefundsTable.tsx
"use client";

import React from "react";
import { CheckCircle, XCircle, Hash, UserRound, Wallet } from "lucide-react";

const ASSUME_GROSS_FROM_BACKEND = true; // set ke false jika jumlahRefund sudah final
const ADMIN_FEE_RATE = 0.1;

interface Refund {
  refundId: number;
  bookingId: number;
  userId: number;
  jumlahRefund: number | string;
  statusRefund: string;
  userName?: string;
}

interface RefundsTableProps {
  refunds: Refund[];
  onAction: (refundId: number, action: "approve" | "reject") => void;
  usersMap?: Record<number, string>;
}

const toNumber = (v: unknown) =>
  typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.-]/g, "")) || 0;

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toUpperCase();
  if (s === "PENDING")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        Pending
      </span>
    );
  if (s === "APPROVED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-200">
        Approved
      </span>
    );
  if (s === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-inset ring-zinc-200">
      {status}
    </span>
  );
};

const RefundsTable: React.FC<RefundsTableProps> = ({ refunds, onAction, usersMap }) => {
  return (
    <div className="mx-auto max-w-screen-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {refunds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 py-12 text-center">
          <p className="text-zinc-500">Kosong</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <colgroup>
              <col className="w-16" />
              <col className="w-28 sm:w-36" />
              <col className="w-40 sm:w-56" />
              <col className="w-40 sm:w-48" />
              <col className="w-28" />
              <col className="w-40 sm:w-48" />
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
                  Booking
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    User
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-zinc-50/80 px-3 py-3 ring-1 ring-zinc-200 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Refund (Final)
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
                const raw = toNumber(r.jumlahRefund);
                const net = ASSUME_GROSS_FROM_BACKEND ? raw * (1 - ADMIN_FEE_RATE) : raw;
                const finalAmount = Math.max(0, Math.round(net));
                const displayName = r.userName ?? usersMap?.[r.userId] ?? "-";
                const pending = r.statusRefund.toUpperCase() === "PENDING";

                return (
                  <tr
                    key={r.refundId}
                    className={`text-sm text-zinc-800 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                    } hover:bg-blue-50/40`}
                  >
                    <td className="border-t border-zinc-200 px-3 py-3 font-medium">{r.refundId}</td>
                    <td className="border-t border-zinc-200 px-3 py-3">{r.bookingId}</td>
                    <td className="border-t border-zinc-200 px-3 py-3">
                      <div className="truncate" title={displayName}>
                        {displayName}
                      </div>
                      <div className="text-[11px] text-zinc-400">#{r.userId}</div>
                    </td>
                    <td className="border-t border-zinc-200 px-3 py-3 font-semibold">
                      {formatIDR(finalAmount)}
                    </td>
                    <td className="border-t border-zinc-200 px-3 py-3">
                      <StatusBadge status={r.statusRefund} />
                    </td>
                    <td className="border-t border-zinc-200 px-3 py-3">
                      {pending ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => onAction(r.refundId, "approve")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-green-700/20 transition hover:bg-green-700"
                            aria-label="Approve"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => onAction(r.refundId, "reject")}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-inset ring-rose-700/20 transition hover:bg-rose-700"
                            aria-label="Reject"
                            title="Reject"
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
