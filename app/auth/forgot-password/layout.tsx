import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Bagi Kopi Indonesia - Forgot Password",
  description: "Point of Sale Application for Bagi Kopi Indonesia",
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="w-full overflow-hidden h-screen flex flex-wrap [@media(max-width:991.96)]:!bg-none"
      style={{
        backgroundImage: `url(${process.env.NEXT_PUBLIC_URL}/forgot-password-img.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "50%",
      }}
    >
      {children}
    </div>
  );
}
