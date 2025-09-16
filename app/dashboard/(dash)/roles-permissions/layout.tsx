import type { Metadata } from "next";
import "../../../globals.css";

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Role Permissions",
  description: "Role Permissions for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function DashboardRolePermLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
