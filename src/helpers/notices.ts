import * as cheerio from "cheerio";
import { GGSIPUNotice, NoticeCategory } from "@/types/notice";

function getNoticeCategory(title: string): NoticeCategory {
  const text = title.toLowerCase();

  if (text.includes("inspection") || text.includes("certified copy")) {
    return "Inspection";
  }
  if (text.includes("result") || text.includes("rechecking")) {
    return "Result";
  }
  if (text.includes("datesheet") || text.includes("date sheet") || text.includes("schedule")) {
    return "Datesheet";
  }
  return "Notice";
}

// In-memory fallback cache to ensure zero blank-screen downtime if upstream GGSIPU server hangs
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

const TARGET_URLS = [
  "https://www.ipu.ac.in/exam_notices.php",
  "https://ipu.ac.in/exam_notices.php",
  "http://www.ipu.ac.in/exam_notices.php",
];

export async function fetchGGSIPUNotices(): Promise<GGSIPUNotice[]> {
  for (const targetUrl of TARGET_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        next: { revalidate: 900 },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      if (!html || html.length < 200) {
        continue;
      }

      const $ = cheerio.load(html);
      const tableRows = $("table tr");

      const noticesList: GGSIPUNotice[] = [];

      tableRows.each((index, row) => {
        const columns = $(row).find("td");
        if (columns.length < 2) return;

        const linkElement = $(row).find("a");
        const href = linkElement.attr("href");
        if (!href || href.startsWith("mailto:")) return;

        // Extract title and date
        const linkText = linkElement.text().trim();
        const firstColumnText = $(columns[0]).text().trim();
        const title =
          linkText.length > 5 &&
          !["click here", "download", "pdf", "view"].includes(linkText.toLowerCase())
            ? linkText
            : firstColumnText || linkText;

        const lastColumnText = $(columns[columns.length - 1]).text().trim();
        const date = lastColumnText || firstColumnText || "Recent";

        // Build full PDF url
        const pdfUrl = href.startsWith("http")
          ? href
          : `https://www.ipu.ac.in/${href.replace(/^\//, "")}`;

        noticesList.push({
          id: `notice-${index}`,
          title: title.replace(/\s+/g, " "),
          date: date.replace(/\s+/g, " "),
          url: pdfUrl,
          category: getNoticeCategory(title),
        });
      });

      if (noticesList.length > 0) {
        lastKnownNotices = noticesList;
        return noticesList;
      }
    } catch {
      // Try next mirror URL
      continue;
    }
  }

  // Graceful fallback to last known notices during upstream GGSIPU downtime
  return lastKnownNotices;
}
