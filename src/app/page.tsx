import type { Metadata } from "next";
import { cookies } from "next/headers";
import { fetchGGSIPUNotices } from "@/helpers/notices";
import RedesignHeader from "@/components/home/RedesignHeader";
import RedesignHero from "@/components/home/RedesignHero";
import RedesignEngine from "@/components/home/RedesignEngine";
import RedesignCoverage from "@/components/home/RedesignCoverage";
import RedesignTrust from "@/components/home/RedesignTrust";
import RedesignFaqCta from "@/components/home/RedesignFaqCta";
import { FAQS } from "@/components/home/faq-data";
import RedesignFooter from "@/components/home/RedesignFooter";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Anviksha · GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
  description:
    "Check your GGSIPU result instantly and get SGPA/CGPA calculated under Ordinance 11, promotion standing, placement eligibility, and a consolidated transcript. Official ExamWeb data, nothing stored.",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "Anviksha · GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "Your GGSIPU result, actually explained. SGPA/CGPA under Ordinance 11, promotion standing, placement eligibility, and consolidated transcripts — instantly after login.",
    url: appUrl,
    type: "website",
    siteName: "Anviksha",
    locale: "en_IN",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Anviksha · GGSIPU Results & Academic Analytics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anviksha · GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "Your GGSIPU result, actually explained. SGPA/CGPA under Ordinance 11, promotion standing, placement eligibility, and consolidated transcripts — instantly after login.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("auth_session")?.value);

  let heroNotices: { title: string; url: string }[] = [];
  try {
    heroNotices = (await fetchGGSIPUNotices()).slice(-8).map(({ title, url }) => ({ title, url }));
  } catch {
    heroNotices = [];
  }

  const cta = isAuthenticated
    ? { label: "Go to Dashboard", href: "/dashboard" }
    : { label: "View My Result", href: "/login" };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <RedesignHeader isAuthenticated={isAuthenticated} />
      <main id="main-content" className="flex-1">
        <RedesignHero isAuthenticated={isAuthenticated} cta={cta} notices={heroNotices} />
        <RedesignEngine />
        <RedesignCoverage />
        <RedesignTrust />
        <RedesignFaqCta cta={cta} />
      </main>
      <RedesignFooter />
    </div>
  );
}
