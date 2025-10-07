"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import RefundsTable from "./components/RefundTable";

interface Refund {
  refundId: number;
  bookingId: number;
  userId: number;
  jumlahRefund: number;
  statusRefund: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Report Booking", href: "/admin/report/bookings" },
    { name: "Report Refuns", href: "/admin/report/refund" },
    { name: "Paket Wisata", href: "/admin/paket-wisata" },
    { name: "Fasilitas", href: "/admin/fasilitas" },
    { name: "Supir", href: "/admin/supir" },
    { name: "Armada", href: "/admin/armada" },
    { name: "Booking", href: "/admin/booking" },
    { name: "Pengguna", href: "/admin/user" },
    { name: "Refund", href: "/admin/refund" },
  ];

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal memuat data refund");
      const data = await res.json();
      setRefunds(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleUpdateStatus = async (refundId: number, action: "approve" | "reject") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refunds/${refundId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ catatanAdmin: action === "approve" ? "Disetujui admin" : "Ditolak admin" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal update status refund");
      }

      fetchRefunds();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-orange-400 mb-8 text-center">Admin Panel</h1>
        <nav className="flex-1">
        <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`block py-2 px-4 rounded-lg transition duration-200 ${
                    pathname === link.href
                      ? "bg-orange-500 text-white shadow-md"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Refund</h1>
        </header>

        {loading ? (
          <p className="text-gray-700 text-xl text-center py-10">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-center py-10">{error}</p>
        ) : (
          <RefundsTable refunds={refunds} onAction={handleUpdateStatus} />
        )}
      </main>
    </div>
  );
}
