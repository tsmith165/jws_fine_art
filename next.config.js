/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'utfs.io',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                pathname: '**',
            },
        ],
        qualities: [75, 90],
        minimumCacheTTL: 60 * 60 * 24 * 7, //In seconds
    },
};

export default nextConfig;
