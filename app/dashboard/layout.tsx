import type { Metadata } from "next";
import "../globals.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Link from "next/link";
import "@ant-design/v5-patch-for-react-19";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Dashboard",
  description: "Point of Sale Application for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="text-sm text-[#646b72] leading-[1.5] overflow-y-auto overflow-x-hidden bg-[#f7f7f7]">
      <Header />
      <Sidebar />
      <div className="transition-all duration-[.2s] ease-in m-[0_0_0_252px] p-[65px_0_0] relative left-0 [@max-width(991.96px)]:m-0 [@max-width(991.96px)]:p-[65px_0_0]">
        <div className="p-[24px_24px_0] min-h-[calc(100vh-105px)]">
          <AntdRegistry>{children}</AntdRegistry>
        </div>
        <div className="mt-[24px]">
          <div className="flex items-center justify-between border-t border-t-[#e6eaed] bg-white p-[1rem]">
            <p className="mb-0 mt-0 text-[#212b36]">Copyright © {new Date().getFullYear()} BagiKopi</p>
            <p className="text-[#212b36]">
              Designed & Developed by{" "}
              <Link href="#" className="text-[#0076f9]">
                nurd0tid
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
