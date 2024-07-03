import constants from './src/lib/constants.js';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

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
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
                child_process: false,
            };
            config.plugins.push(new NodePolyfillPlugin());
        }
        return config;
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
