// app/(admin)/layout.tsx
import type { Metadata } from "next";
import Navbar from "../../../components/Navbar";

export const metadata: Metadata = {
  title: "Admin Dashboard | Sarita",
  description: "Panel de administración Sarita",
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon.ico",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar/>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-11 pb-6">
        {children}
      </main>
    </>
  );
}