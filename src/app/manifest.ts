import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anviksha — GGSIPU Academic Analytics Portal",
    short_name: "Anviksha",
    description: "Academic intelligence, Ordinance 11 CGPA analytics, and official transcript generator for GGSIPU students.",
    start_url: "/",
    display: "standalone",
    background_color: "#060608",
    theme_color: "#060608",
    icons: [
      {
        src: "/favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
