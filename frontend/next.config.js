/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-supabase-storage-url.supabase.co'],
  },
  // Enable experimental features if needed
  // experimental: {
  //   serverActions: true,
  // },
};

module.exports = nextConfig;
