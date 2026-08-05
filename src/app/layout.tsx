import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Anviksha — GGSIPU Results Portal",
    template: "%s · Anviksha",
  },
  description:
    "Anviksha is an unofficial UI wrapper for the GGSIPU exam portal. View your semester results, SGPA trends, grade breakdowns, and academic analytics — beautifully.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  keywords: ["GGSIPU", "IPU results", "exam portal", "SGPA", "grades", "Anviksha"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
