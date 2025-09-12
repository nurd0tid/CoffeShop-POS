import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "../../globals.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Sign",
  description: "Point of Sale Application for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="w-full overflow-hidden h-screen flex flex-wrap [@media(max-width:991.96)]:!bg-none"
      style={{
        backgroundImage: `url(${process.env.NEXT_PUBLIC_URL}/login-bg.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "50%",
      }}
    >
      {children}
    </div>
  );
}
