import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['drive.google.com'], // Permitir imágenes de Google Drive
  },
};

export default nextConfig;
