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
        qualities: [75, 82, 85, 90, 100],
        minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
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
