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
};

export default nextConfig;
