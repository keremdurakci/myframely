import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Product discontinued 2026-08-15 — send old links/bookmarks to the
      // catalog instead of a dead end.
      {
        source: "/products/personalized-custom-name-license-plate-frame",
        destination: "/#products",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
