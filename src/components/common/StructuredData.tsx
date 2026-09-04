export default function StructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";
  // Keep in sync with package.json "version" — shown in WebApplication JSON-LD.
  const version = "1.6.0";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${appUrl}/#webapp`,
        "name": "Anviksha",
        "url": appUrl,
        "applicationCategory": "EducationalApplication",
        "applicationSubCategory": "Academic Analytics & Grading System",
        "operatingSystem": "All",
        "browserRequirements": "Requires HTML5 and JavaScript",
        "softwareVersion": version,
        "description":
          "Privacy-first academic results and analytics platform for Guru Gobind Singh Indraprastha University (GGSIPU) students. Ordinance-based SGPA/CGPA calculations with verification badges, promotion monitoring under each programme's own ordinance, campus placement cutoff gatekeeper, and consolidated transcript generation.",
        "inLanguage": "en-IN",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
        },
        "author": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://himanshusinghdangi.vercel.app",
        },
        "creator": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://himanshusinghdangi.vercel.app",
        },
        "about": {
          "@type": "EducationalOrganization",
          "name": "Guru Gobind Singh Indraprastha University",
          "alternateName": ["GGSIPU", "IP University", "IPU"],
          "url": "http://www.ipu.ac.in",
          "location": {
            "@type": "PostalAddress",
            "addressLocality": "Dwarka",
            "addressRegion": "New Delhi",
            "addressCountry": "IN",
          },
        },
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": "student",
        },
        "featureList": [
          "GGSIPU SGPA and CGPA calculator with verification badges",
          "Ordinance-aware analytics: Ordinance 11 semester degrees, plus separate frameworks for MBBS, BPT, BHMS, BAMS, and BASLP",
          "50% Annual Credit Rule promotion and year-back standing monitor",
          "Campus placement eligibility and recruiter cutoff matrix",
          "Odd vs Even re-appear examination session planner",
          "Consolidated master academic transcript PDF generation",
          "Subject grade distribution and internal vs external marks visualizer",
          "Result access for every affiliated GGSIPU institute — raw marks always visible even where analytics are not yet verified",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        "url": appUrl,
        "name": "Anviksha",
        "alternateName": [
          "Anviksha Portal",
          "Anviksha Results",
          "Anviksha - GGSIPU Results",
          "Anviksha GGSIPU",
          "Anviksha Academic Analytics",
        ],
        "description": "GGSIPU Academic Analytics, Examination Results & Transcript Portal",
        "publisher": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://himanshusinghdangi.vercel.app",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
