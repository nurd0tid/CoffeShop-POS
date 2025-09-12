import type { Metadata } from "next";
import "../../globals.css";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Point of Sale System",
  description: "Point of Sale Application for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function DashboardPosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`m-0 text-sm text-[#646b72] leading-[1.5] bg-[#f7f7f7] overflow-y-auto overflow-x-hidden [@media(min-width:992px)]:overflow-y-hidden`}>
      <Header />
      {children}
    </div>
  );
}
