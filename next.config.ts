import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "canvas"],
  turbopack: {},
  webpack: (config: { externals?: unknown[] }) => {
    // pdf.js (used by pdf-parse) may try to import canvas for rendering.
    // Mark it as an external so the bundle doesn't break when canvas is absent.
    config.externals = [...(config.externals ?? []), { canvas: "canvas" }];
    return config;
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      // Google profile pictures (OAuth sign-in avatars)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

const withMDX = createMDX({
  // Note: remark-gfm omitted — Turbopack requires serialisable options.
  // GFM tables are handled via custom mdx-components.tsx instead.
  options: {},
});

export default withMDX(nextConfig);
