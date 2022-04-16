/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["jwsfineart.s3.us-west-1.amazonaws.com"],
      minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
  },
}

module.exports = nextConfig
