import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/notices", "/calculations", "/report"],
      disallow: ["/api/", "/dashboard/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
