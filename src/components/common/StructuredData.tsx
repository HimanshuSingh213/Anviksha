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
        "applicationSubCategory": "Academic Analytics & Grading System",
        "operatingSystem": "All",
        "browserRequirements": "Requires HTML5 and JavaScript",
        "softwareVersion": "1.6.0",
        "description":
          "Modern, privacy-first academic intelligence and results analytics platform for Guru Gobind Singh Indraprastha University (GGSIPU) students. Features Ordinance 11 SGPA/CGPA calculations, 50% annual credit promotion monitoring, campus placement cutoff gatekeeper, and consolidated transcript generation.",
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
          "GGSIPU Ordinance 11 SGPA and CGPA Calculator",
          "Real-time GGSIPU Examination Circulars, Date-Sheets, and Result Notices Feed",
          "50% Annual Credit Rule Promotion and Year-Back Standing Monitor",
          "Campus Placement Eligibility and Recruiter Cutoff Matrix",
          "Odd vs Even Re-appear Examination Session Planner",
          "Consolidated Master Academic Transcript PDF Generation",
          "Subject Grade Distribution and Internal vs External Marks Visualizer",
          "Universal support for B.Tech, BCA, BBA, MBA, Law, Medical & Allied Sciences across all 50+ affiliated colleges",
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
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${appUrl}/notices?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
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
