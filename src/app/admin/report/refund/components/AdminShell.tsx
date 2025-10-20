"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Report Booking", href: "/admin/report/bookings" },
  { name: "Report Refund", href: "/admin/report/refund" },
  { name: "Paket Wisata", href: "/admin/paket-wisata" },
  { name: "Fasilitas", href: "/admin/fasilitas" },
  { name: "Supir", href: "/admin/supir" },
  { name: "Armada", href: "/admin/armada" },
  { name: "Booking", href: "/admin/booking" },
  { name: "Pengguna", href: "/admin/user" },
  { name: "Refund", href: "/admin/refund" },
];

export default function AdminShell({ children, title }: PropsWithChildren<{ title?: string }>) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-orange-400 mb-8 text-center">Admin Panel</h1>
        <nav className="flex-1">
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`block py-2 px-4 rounded-lg transition duration-200 ${
                      active ? "bg-orange-500 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {title && (
          <header className="bg-white shadow-md rounded-lg p-6 mb-6 flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
