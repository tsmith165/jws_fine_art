import constants from './lib/constants.js';

const { AWS_BUCKET_URL } = constants;

/** @type {import('next').NextConfig} */

const nextConfig = {
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: AWS_BUCKET_URL.replace('https://', ''),
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
        ],
        minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
    },
    async rewrites() {
        return [
            {
                source: '/api/checkout/webhook',
                destination: '/api/checkout/webhook',
                locale: false,
            },
            {
                source: '/:locale/api/checkout/webhook',
                destination: '/api/checkout/webhook',
                locale: false,
            },
        ];
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
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
