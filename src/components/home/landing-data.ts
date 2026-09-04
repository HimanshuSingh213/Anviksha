import type { GGSIPUNotice } from "@/types/notice";

export type NoticeTeaser = Pick<GGSIPUNotice, "title" | "category">;

export interface FaqItem {
  q: string;
  a: string;
}

export interface StreamTab {
  id: string;
  label: string;
  courses: { name: string; detail: string }[];
}

export const STREAM_TABS: StreamTab[] = [
  {
    id: "engineering",
    label: "Engineering",
    courses: [
      { name: "B.Tech", detail: "CSE · IT · ECE · AI/ML · ME · CE · EE · ICE" },
      { name: "M.Tech", detail: "All specialisations, semester system" },
      { name: "BCA", detail: "Bachelor of Computer Applications" },
      { name: "MCA", detail: "Includes Software Engineering track" },
      { name: "LEET", detail: "Lateral entry, directly into 2nd year" },
    ],
  },
  {
    id: "business",
    label: "Business",
    courses: [
      { name: "BBA", detail: "General · Banking & Insurance" },
      { name: "MBA", detail: "All specialisations incl. Analytics" },
      { name: "B.Com (H)", detail: "Honours, semester system" },
      { name: "BA Economics (H)", detail: "Honours programme" },
    ],
  },
  {
    id: "law",
    label: "Law",
    courses: [
      { name: "BA LLB (H)", detail: "5-year integrated, honours" },
      { name: "BBA LLB (H)", detail: "5-year integrated, honours" },
      { name: "LLM", detail: "Corporate · Cyber · Constitutional" },
    ],
  },
  {
    id: "health",
    label: "Health Sciences",
    courses: [
      { name: "B.Sc Nursing", detail: "Semester + annual variants" },
      { name: "BPT", detail: "Bachelor of Physiotherapy" },
      { name: "B.Pharm", detail: "Bachelor of Pharmacy" },
      { name: "BMLT / BOT", detail: "Medical Lab · Occupational Therapy" },
    ],
  },
  {
    id: "media",
    label: "Media, Design & Education",
    courses: [
      { name: "BA JMC", detail: "Journalism & Mass Communication" },
      { name: "B.Ed", detail: "Bachelor of Education" },
      { name: "B.Voc", detail: "Applied Technology" },
      { name: "B.Arch / B.Plan", detail: "Architecture & Planning" },
    ],
  },
];

export const COLLEGES = [
  { abbr: "USICT", full: "University School of ICT, Dwarka" },
  { abbr: "MAIT", full: "Maharaja Agrasen Institute of Technology, Rohini" },
  { abbr: "MSIT", full: "Maharaja Surajmal Institute of Technology, Janakpuri" },
  { abbr: "BVCOE", full: "Bharati Vidyapeeth's College of Engineering, Paschim Vihar" },
  { abbr: "BPIT", full: "Bhagwan Parshuram Institute of Technology, Rohini" },
  { abbr: "GTBIT", full: "Guru Tegh Bahadur Institute of Technology, Rajouri Garden" },
  { abbr: "VIPS", full: "Vivekananda Institute of Professional Studies, Pitampura" },
  {
    abbr: "ADGITM",
    full: "Dr. Akhilesh Das Gupta Institute of Technology & Management, Shastri Park",
  },
  { abbr: "USAR", full: "University School of Automation & Robotics, East Delhi" },
  { abbr: "JIMS", full: "Jagan Institute of Management Studies, Rohini" },
  { abbr: "DTC", full: "Delhi Technical Campus, Greater Noida" },
  { abbr: "GNDIT", full: "Guru Nanak Dev Institute of Technology, Rohini" },
];

export const FAQS: FaqItem[] = [
  {
    q: "How do I check my result on Anviksha?",
    a: "Enter your GGSIPU enrollment number and password — the same credentials you use on examweb.ggsipu.ac.in. Anviksha proxies your session directly to the university server and renders your marks with full analytics in your browser.",
  },
  {
    q: "Does it work for every programme and college?",
    a: "If your result is declared on GGSIPU's ExamWeb server, Anviksha shows it — every affiliated institute is covered. Analytics are computed under each programme's own ordinance (Ordinance 11 for semester degrees; separate verified frameworks for MBBS, BPT, and other professional programmes), and anything not yet verified is clearly labelled instead of guessed.",
  },
  {
    q: "How is CGPA calculated under Ordinance 11?",
    a: "SGPA is the credit-weighted average of grade points for a semester: Σ(credits × grade points) ÷ Σ(credits) — Ordinance 11, Clause 13. CGPA is the cumulative equivalent across all completed semesters, and the equivalent percentage is CGPA × 10. Anviksha implements the formula exactly as written in the ordinance — no approximations.",
  },
  {
    q: "What is the 50% credit rule?",
    a: "Under Ordinance 11, promotion to the next academic year requires earning at least 50% of the credits offered in your current academic year (Clause 11.3(v)). Anviksha tracks your annual credit standing live so a year-back never surprises you — it uses the verified ordinance baseline and notes that additional programme-scheme requirements may apply, rather than inventing extra conditions.",
  },
  {
    q: "Where does my data go?",
    a: "Nowhere. Anviksha runs on a zero-database architecture — credentials pass through a direct proxy to GGSIPU and are never written to disk, logged, or cached. Your session terminates the moment you log out or close the tab.",
  },
  {
    q: "My result is declared but not showing — why?",
    a: "GGSIPU publishes notices on ipu.ac.in before results propagate to the student portal. This university-side delay usually resolves within 24–48 hours. If it persists on the official portal itself, it's not an Anviksha issue.",
  },
];

export const TICKER_FALLBACK = [
  "Circulars sync from ipu.ac.in every 15 minutes",
  "Result notifications, date-sheets & inspection schedules",
  "Open the Circulars feed for the complete list",
];
