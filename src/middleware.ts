import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const publicRoutes = [
    '/',
    '/gallery',
    '/signin',
    '/signup',
    '/details',
    '/details/(.*)',
    '/checkout/(.*)',
    '/slideshow',
    '/socials',
    '/checkout',
    '/api/checkout/webhook',
    '/biography',
    '/contact',
    '/events',
    '/faq',
    '/api/uploadthing',
];

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware((auth, req) => {
    if (isPublicRoute(req)) {
        return NextResponse.next();
    } else {
        auth().protect().has({ role: 'org:ADMIN' });
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
