import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Sarita",
  description: "Iniciar sesión como administrador",
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon.ico",
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}