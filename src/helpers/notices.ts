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

export async function fetchGGSIPUNotices(): Promise<GGSIPUNotice[]> {
  try {
    const response = await fetch("http://www.ipu.ac.in/exam_notices.php", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
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
      const title = (linkText.length > 5 && !["click here", "download", "pdf", "view"].includes(linkText.toLowerCase()))
        ? linkText
        : (firstColumnText || linkText);

      const lastColumnText = $(columns[columns.length - 1]).text().trim();
      const date = lastColumnText || firstColumnText || "Recent";

      // Build full PDF url
      const pdfUrl = href.startsWith("http")
        ? href
        : `http://www.ipu.ac.in/${href.replace(/^\//, "")}`;

      noticesList.push({
        id: `notice-${index}`,
        title: title.replace(/\s+/g, " "),
        date: date.replace(/\s+/g, " "),
        url: pdfUrl,
        category: getNoticeCategory(title),
      });
    });

    return noticesList;
  } catch (error) {
    console.error("Failed to fetch notices:", error);
    return [];
  }
}
