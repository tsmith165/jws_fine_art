/** @type {import('next').NextConfig} */
require("dotenv-safe").config()

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["jwsfineart.s3.us-west-1.amazonaws.com"]
  },
}

module.exports = nextConfig
