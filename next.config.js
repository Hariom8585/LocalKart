/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'assets.localkart.in'],
    unoptimized: true
  }
};

module.exports = nextConfig;
