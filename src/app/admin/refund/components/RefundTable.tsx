"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface Refund {
  refundId: number;
  bookingId: number;
  userId: number;
  jumlahRefund: number;
  statusRefund: string;
}

interface RefundsTableProps {
  refunds: Refund[];
  onAction: (refundId: number, action: "approve" | "reject") => void;
}

const RefundsTable: React.FC<RefundsTableProps> = ({ refunds, onAction }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>;
      case "APPROVED":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
      case "REJECTED":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {refunds.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-lg">Tidak ada refund tersedia.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "Booking ID", "User ID", "Jumlah Refund", "Status", "Aksi"].map((title) => (
                <th
                  key={title}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {refunds.map((r) => (
              <tr key={r.refundId} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{r.refundId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.bookingId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{r.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">Rp {r.jumlahRefund.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(r.statusRefund)}</td>
                <td className="px-6 py-4 whitespace-nowrap flex space-x-2 justify-center">
                  {r.statusRefund.toUpperCase() === "PENDING" ? (
                    <>
                      <button
                        onClick={() => onAction(r.refundId, "approve")}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => onAction(r.refundId, "reject")}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 font-medium">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RefundsTable;
