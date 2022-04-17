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
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=9999999999, immutable',
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
