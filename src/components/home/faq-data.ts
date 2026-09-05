export interface FaqItem {
  q: string;
  a: string;
}

export const FAQS: FaqItem[] = [
  {
    q: "How do I check my GGSIPU semester result on Anviksha?",
    a: "Enter your enrollment number and password (the same ones you use on the university portal). Anviksha proxies straight to the official exam server and returns your complete marks, grade points and standing instantly.",
  },
  {
    q: "Does it work for my programme and college?",
    a: "Any programme declared on ExamWeb is rendered in full, across all affiliated institutes. Deep analytics run under your programme's own ordinance: Ordinance 11 for B.Tech, BCA, BBA, MBA, BA LLB and other semester degrees, with separate verified frameworks for MBBS, BPT, BHMS, BAMS and BASLP.",
  },
  {
    q: "How are SGPA and CGPA calculated?",
    a: "Under Ordinance 11 (Clause 13), SGPA is the credit-weighted average of grade points; CGPA is the cumulative credit-weighted average across cleared semesters. Equivalent percentage is CGPA × 10.",
  },
  {
    q: "What is the 50% credit rule?",
    a: "To be promoted to the next academic year you must clear at least 50% of the total credits offered across both semesters of the year. Anviksha tracks this automatically and flags the shortfall from your current results.",
  },
  {
    q: "How current is the circulars feed?",
    a: "The notices feed synchronizes with the official university portal every 15 minutes via server-side caching, with keyword search, category filters and direct official PDFs.",
  },
  {
    q: "What happens to my password?",
    a: "It is hashed in transit and proxied straight to the university's login endpoint. Anviksha runs a zero-database architecture: credentials and marks are never saved or recorded anywhere.",
  },
];
