import * as cheerio from "cheerio";
import { GGSIPUNotice, NoticeCategory } from "@/types/notice";

// Maximum notices to retain in memory.
const MAX_NOTICES = 500;

// Fallback notices served during upstream university downtime.
let lastKnownNotices: GGSIPUNotice[] = [
  {
    id: "notice-fallback-1",
    title: "Final Date Sheet for End Term Semester Examinations (Theory & Practical)",
    date: "Recent",
    url: "https://ipu.ac.in/exam_notices.php",
    category: "Datesheet",
  },
  {
    id: "notice-fallback-2",
    title: "Declaration of Results for End Term Semester Examinations",
    date: "Recent",
    url: "https://ipu.ac.in/exam_notices.php",
    category: "Result",
  },
  {
    id: "notice-fallback-3",
    title: "Schedule for Inspection of Evaluated Answer Sheets / Certified Copies",
    date: "Recent",
    url: "https://ipu.ac.in/exam_notices.php",
    category: "Inspection",
  },
  {
    id: "notice-fallback-4",
    title: "Important Notice regarding Re-appear & Supplementary Examination Registrations",
    date: "Recent",
    url: "https://ipu.ac.in/exam_notices.php",
    category: "Notice",
  },
];

// Infers notice category from title keywords.
function getCategory(title: string): NoticeCategory {
  const text = title.toLowerCase();
  if (text.includes("inspection") || text.includes("certified copy")) return "Inspection";
  if (text.includes("result") || text.includes("rechecking")) return "Result";
  if (text.includes("datesheet") || text.includes("schedule")) return "Datesheet";
  return "Notice";
}

// Fetches and parses a single paginated notices page from GGSIPU portal.
async function getNoticesFromPage(page: number): Promise<GGSIPUNotice[]> {
  try {
    const response = await fetch(`https://www.ipu.ac.in/exam_notices.php?page=${page}&limit=100`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000), // 6-second upstream timeout
      next: { revalidate: 900 }, // 15-minute ISR cache
    });
    if (!response.ok) return [];

    const $ = cheerio.load(await response.text());
    const notices: GGSIPUNotice[] = [];

    // One <tr> row per notice.
    const rows = $("table tr").toArray();
    for (const row of rows) {
      const columns = $(row).find("td");
      if (columns.length < 2) continue; // not a notice row

      const link = $(row).find("a");
      const href = link.attr("href");
      if (!href || href.startsWith("mailto:")) continue;

      // Fallback to table cell text if anchor text is generic
      const linkText = link.text().trim();
      const uselessLinkTexts = ["click here", "download", "pdf", "view"];
      const isUseless = linkText.length <= 5 || uselessLinkTexts.includes(linkText.toLowerCase());
      const title = isUseless ? columns.first().text().trim() : linkText;
      if (!title) continue;

      // Notice date recorded in terminal column
      const date = columns.last().text().trim() || "Recent";

      // Resolve relative PDF path against official domain
      const url = href.startsWith("http") ? href : `https://www.ipu.ac.in/${href.replace(/^\//, "")}`;

      notices.push({
        id: "", // filled in later
        title: title.replace(/\s+/g, " "),
        date: date.replace(/\s+/g, " "),
        url,
        category: getCategory(title),
      });
    }

    return notices;
  } catch {
    return [];
  }
}

// Fetches recent notices from GGSIPU examination portal across concurrent pages.
export async function fetchGGSIPUNotices(): Promise<GGSIPUNotice[]> {
  // Concurrently fetch first 5 pages (100 notices per page)
  const pages = await Promise.all([
    getNoticesFromPage(1),
    getNoticesFromPage(2),
    getNoticesFromPage(3),
    getNoticesFromPage(4),
    getNoticesFromPage(5),
  ]);

  // Deduplicate merged notices by document URL
  const mergedNotices: GGSIPUNotice[] = [];
  const usedUrls: string[] = [];

  for (const pageNotices of pages) {
    for (const notice of pageNotices) {
      if (usedUrls.includes(notice.url)) continue;
      usedUrls.push(notice.url);
      mergedNotices.push(notice);
    }
  }

  // Keep newest MAX_NOTICES
  const recentNotices = mergedNotices.slice(0, MAX_NOTICES);

  // Assign sequential identifiers
  const notices: GGSIPUNotice[] = [];
  for (let i = 0; i < recentNotices.length; i++) {
    notices.push({ ...recentNotices[i], id: `notice-${i}` });
  }

  // Return cached fallback if upstream fetch yielded zero records
  if (notices.length === 0) return lastKnownNotices;

  lastKnownNotices = notices;
  return notices;
}
