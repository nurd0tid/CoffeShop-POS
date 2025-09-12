import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";


const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Point of Sale System",
  description: "Point of Sale Application for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunitoSans.variable} antialiased m-0 text-sm text-[#646b72] leading-[1.5] bg-[#f7f7f7] overflow-y-auto overflow-x-hidden [@media(min-width:992px)]:overflow-y-hidden`}
      >
        <div>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
