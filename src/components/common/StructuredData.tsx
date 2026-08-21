export default function StructuredData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${appUrl}/#webapp`,
        "name": "Anviksha",
        "url": appUrl,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "description":
          "Fast, privacy-first academic intelligence and results analytics portal for Guru Gobind Singh Indraprastha University (GGSIPU) students. Features Ordinance 11 SGPA/CGPA calculations, 50% annual credit promotion standing, campus placement cutoff gatekeeper, and consolidated academic transcript PDF generator.",
        "inLanguage": "en",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
        },
        "author": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://github.com/HimanshuSingh213",
          "sameAs": ["https://github.com/HimanshuSingh213"],
        },
        "creator": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://github.com/HimanshuSingh213",
        },
        "featureList": [
          "GGSIPU Ordinance 11 SGPA and CGPA Calculator",
          "50% Annual Credit Rule Promotion and Year-Back Standing Monitor",
          "Campus Placement Eligibility and Recruiter Cutoff Matrix",
          "Odd vs Even Re-appear Examination Session Planner",
          "Consolidated Master Academic Transcript PDF Generation",
          "Subject Grade Distribution and Internal vs External Marks Visualizer",
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
          "url": "https://github.com/HimanshuSingh213",
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
