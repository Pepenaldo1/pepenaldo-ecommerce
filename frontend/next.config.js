/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // allow product images from any host (S3, Cloudinary, etc.)
    ],
  },
};

module.exports = nextConfig;
