import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: "/Users/sandu/Documents/personal watchlist",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
