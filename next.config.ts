// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // === Si usas Next.js 15+ ===
  // Indica a Next que no "vendorice" pdfkit en los server bundles
  serverExternalPackages: ["pdfkit"],
  
  // Desactivar ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
