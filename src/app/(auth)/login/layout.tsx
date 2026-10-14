import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Anviksha Sign In — Use Your GGSIPU ExamWeb Login",
  description:
    "Sign in to Anviksha with your existing GGSIPU ExamWeb enrollment number and password. Live CAPTCHA, direct university connection, no new account and no passwords saved.",
  alternates: {
    canonical: `${appUrl}/login`,
  },
  openGraph: {
    title: "Anviksha Sign In — Use Your GGSIPU ExamWeb Login",
    description:
      "No new account. Use your ExamWeb enrollment number and password with a live CAPTCHA to open your result dossier.",
    url: `${appUrl}/login`,
    type: "website",
    siteName: "Anviksha",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
