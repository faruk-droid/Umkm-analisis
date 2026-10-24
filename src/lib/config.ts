export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "UMKM Insight AI",
  tagline: "Sistem Pendukung Keputusan Bisnis Cerdas & Berbasis Data untuk UMKM",
  description:
    "Platform evaluasi kelayakan usaha, kalkulasi finansial deterministik, simulasi skenario, dan analisis risiko berbasis data riil tanpa janji palsu.",
  version: "1.0.0-mvp",
  isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
  author: "Senior Full-Stack & AI Engineering Team",
  links: {
    github: "https://github.com",
    documentation: "/docs",
  },
};
