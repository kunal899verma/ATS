import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  turbopack: {},
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  // Note: remark-gfm omitted — Turbopack requires serialisable options.
  // GFM tables are handled via custom mdx-components.tsx instead.
  options: {},
});

export default withMDX(nextConfig);
