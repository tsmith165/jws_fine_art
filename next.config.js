/** @type {import('next').NextConfig} */

const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  reactStrictMode: true,
  images: {
    domains: ["jwsfineart.s3.us-west-1.amazonaws.com"],
      minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
  },
}

module.exports = nextConfig
