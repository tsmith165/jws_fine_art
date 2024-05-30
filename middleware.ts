// File 5: /middleware.ts

import { NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

const publicRoutes = [
    '/',
    '/gallery',
    '/signin',
    '/signup',
    '/details/:id*',
    '/checkout/:id*',
    '/checkout/cancel/:id*',
    '/checkout/success/:id*',
    '/slideshow',
    '/socials',
    '/checkout',
    '/api/checkout/webhook',
    '/biography',
    '/contact',
    '/api/uploadthing',
];

const googleCrawlerUserAgents = [
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'Googlebot-Video',
    'AdsBot-Google',
    'AdsBot-Google-Mobile',
];

export default authMiddleware({
    publicRoutes,
    async afterAuth(auth, req, evt) {
        const sign_in_page = new URL('/signin', req.url);

        const { userId, isPublicRoute, getToken } = auth;
        const user = userId ? await clerkClient.users.getUser(userId) : null;

        // Check if the user agent matches the Google crawler
        const userAgent = req.headers.get('user-agent');
        const isGoogleCrawler = googleCrawlerUserAgents.some((crawlerUserAgent) => userAgent?.includes(crawlerUserAgent));

        if (isPublicRoute && isGoogleCrawler) {
            return NextResponse.next();
        }

        if (isPublicRoute) {
            return NextResponse.next();
        }

        if (!userId || !user) {
            return NextResponse.redirect(sign_in_page);
        }

        console.log('Comparing user role:', user.publicMetadata?.role, 'to ADMIN');
        if (user.publicMetadata?.role !== 'ADMIN') {
            return NextResponse.redirect(sign_in_page);
        }

        return NextResponse.next();
    },
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/((?!.+\\.[\\w]+$|_next|api/checkout/webhook).*)', '/', '/(api|trpc)(.*)'],
};
