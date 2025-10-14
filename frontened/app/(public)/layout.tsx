// app/layout.tsx
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pedidos | Sarita",
  description: "Sistema de pedidos Sarita",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Paytone+One&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-neutral-200 text-neutral-900">
        <Navbar/>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-11 pb-6">
          {children}
        </main>
      </body>
    </html>
  );
}
