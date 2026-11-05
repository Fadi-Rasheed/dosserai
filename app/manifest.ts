import type { MetadataRoute } from "next";

const APP_DESCRIPTION =
  "Personal AI knowledge base. Upload, extract, and query in natural language — originals are never stored.";

const Manifest = (): MetadataRoute.Manifest => ({
  name: "Dosserai",
  short_name: "Dosserai",
  description: APP_DESCRIPTION,
  start_url: "/dashboard",
  scope: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#ffffff",
  icons: [
    {
      src: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
});

export default Manifest;
