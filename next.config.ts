import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "ryyhtihsvpzldrlizqae.supabase.co",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
