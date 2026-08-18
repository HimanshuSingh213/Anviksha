export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://anviksha-result.vercel.app/#webapp",
        "name": "Anviksha",
        "url": "https://anviksha-result.vercel.app",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All",
        "description":
          "Fast, privacy-first academic intelligence and results analytics portal for Guru Gobind Singh Indraprastha University (GGSIPU) students. Features Ordinance 11 SGPA/CGPA calculations, 50% annual credit promotion standing, campus placement cutoff gatekeeper, and official single-page transcript generator.",
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
        "@id": "https://anviksha-result.vercel.app/#website",
        "url": "https://anviksha-result.vercel.app",
        "name": "Anviksha",
        "description": "GGSIPU Academic Analytics, Examination Results & Transcript Portal",
        "publisher": {
          "@type": "Person",
          "name": "Himanshu Singh",
          "url": "https://github.com/HimanshuSingh213",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://anviksha-result.vercel.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How to check GGSIPU Results 2026 online?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can check GGSIPU semester examination results instantly on Anviksha by logging in with your GGSIPU enrollment number and password. Anviksha fetches results in real-time from the university servers without storing any student credentials.",
            },
          },
          {
            "@type": "Question",
            "name": "How is SGPA and CGPA calculated in GGSIPU under Ordinance 11?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "In GGSIPU, SGPA/CGPA is calculated using Ordinance 11: Sum of (Subject Credits × Grade Points) divided by Total Credits registered. Grade Points scale from 10 (O grade for 90-100 marks) down to 4 (P grade for 40-44 marks). F grade awards 0 points.",
            },
          },
          {
            "@type": "Question",
            "name": "What is the 50% Credit Rule for Academic Promotion in GGSIPU?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Under GGSIPU Ordinance 11, a student must secure passing grades in at least 50% of the total credits offered across both semesters of an academic year to be promoted to the subsequent year without detention (year-back).",
            },
          },
          {
            "@type": "Question",
            "name": "How is GGSIPU CGPA converted to percentage?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "According to official GGSIPU regulations, the equivalent aggregate percentage is calculated using the standard formula: Percentage = CGPA × 10.0.",
            },
          },
          {
            "@type": "Question",
            "name": "When can students appear for Odd vs Even semester backlogs in GGSIPU?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Odd semester backlogs (Semesters 1, 3, 5, 7) can only be re-appeared during the Winter exam window (Nov-Dec), while Even semester backlogs (Semesters 2, 4, 6, 8) can only be taken during the Summer exam window (May-June).",
            },
          },
        ],
      },
      {
        "@type": "HowTo",
        "@id": "https://anviksha-result.vercel.app/#howto",
        "name": "How to Check GGSIPU Results and Calculate CGPA on Anviksha",
        "description": "Step-by-step guide for GGSIPU students to check live semester marks, calculate SGPA/CGPA, verify Ordinance 11 promotion standing, and download consolidated transcripts.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Sign In with GGSIPU Credentials",
            "text": "Enter your GGSIPU student enrollment number and password on the Anviksha login screen.",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Instant SGPA & CGPA Calculation",
            "text": "View your instant semester-by-semester SGPA, cumulative CGPA, and grade distributions calculated according to Ordinance 11.",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Check Academic Standing & Placement Eligibility",
            "text": "Inspect your 50% annual credit promotion standing, review odd/even re-appear session schedules, and verify campus placement cutoff eligibility.",
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Export Consolidated Master Transcript",
            "text": "Download a single-page official-style consolidated academic transcript PDF with QR code verification in one click.",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://anviksha-result.vercel.app/#breadcrumbs",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://anviksha-result.vercel.app",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "GGSIPU Results & Analytics Dashboard",
            "item": "https://anviksha-result.vercel.app/dashboard",
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Academic Analytics & Ordinance 11 Standing",
            "item": "https://anviksha-result.vercel.app/dashboard/analytics",
          },
        ],
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
