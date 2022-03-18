/** @type {import('next').NextConfig} */
require("dotenv-safe").config()

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["jwsfineart.sfo2.digitaloceanspaces.com"]
  },
}

module.exports = nextConfig
