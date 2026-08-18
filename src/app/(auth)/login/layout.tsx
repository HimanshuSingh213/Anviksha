import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Login - GGSIPU Result Portal",
  description:
    "Sign in to Anviksha with your GGSIPU enrollment credentials to fetch semester results, calculate SGPA/CGPA, and download academic transcripts.",
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
