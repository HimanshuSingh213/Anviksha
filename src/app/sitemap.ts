import type { MetadataRoute } from "next";
import { fetchGGSIPUNotices } from "@/helpers/notices";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const revalidate = 900; // match the notices ISR window

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Static pages first — the money pages for search.
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/notices`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculations`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Each notice links to an official ipu.ac.in PDF. We can't index those
  // (they're another site's URLs), but listing the notices page as freshly
  // changed is what matters — so no per-notice entries are needed.
  try {
    await fetchGGSIPUNotices();
  } catch {
    // sitemap must never fail generation because upstream is down
  }

  return staticEntries;
}
