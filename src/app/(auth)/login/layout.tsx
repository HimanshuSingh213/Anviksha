import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Sign In — GGSIPU Results & Academic Portal",
  description:
    "Sign in with your GGSIPU enrollment credentials to access semester examination results, SGPA/CGPA calculations, and consolidated academic transcripts.",
  alternates: {
    canonical: `${appUrl}/login`,
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
