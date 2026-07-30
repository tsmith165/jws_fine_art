/** @type {import('next').NextConfig} */

const nextConfig = {
    poweredByHeader: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: '*.ufs.sh',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'jwsfineart.s3.us-west-1.amazonaws.com',
                pathname: '/pieces/**',
            },
            {
                protocol: 'https',
                hostname: 'jwsfineartpieces.s3.us-west-1.amazonaws.com',
                pathname: '/pieces/**',
            },
        ],
        // Every unique (image, width, quality) combination bills as one Vercel
        // image transformation, so the site uses exactly two quality tiers
        // (75 placeholder, 95 artwork), a reduced set of width buckets, and a
        // month-long cache so re-transformations stop recounting weekly.
        qualities: [75, 95],
        deviceSizes: [640, 828, 1080, 1920, 2560],
        imageSizes: [64, 128, 256],
        minimumCacheTTL: 60 * 60 * 24 * 31, //In seconds
    },
    async redirects() {
        return [
            { source: '/login/:path*', destination: '/signin/:path*', permanent: false },
            { source: '/sign-in/:path*', destination: '/signin/:path*', permanent: false },
            { source: '/logout/:path*', destination: '/signout/:path*', permanent: false },
            { source: '/sign-out/:path*', destination: '/signout/:path*', permanent: false },
        ];
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                ],
            },
        ];
    },
};

export default nextConfig;
