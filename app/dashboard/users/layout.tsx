import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Users Management",
  description: "User Management for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function DashboardUsersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
