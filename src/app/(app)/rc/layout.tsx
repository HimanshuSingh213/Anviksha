import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearing List",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RCLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
