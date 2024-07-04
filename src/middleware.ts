import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/gallery',
    '/signin',
    '/signup',
    '/details',
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
    '/events',
    '/faq',
]);

const isUploadthingRoute = createRouteMatcher(['/api/uploadthing']);

const isAdminRoute = createRouteMatcher(['/admin/tools', '/admin/:path*']);

export default clerkMiddleware(
    (auth, req) => {
        const signInPage = new URL('/signin', req.url);

        // Check if the route is public, Uploadthing route, or Google crawler
        if (isPublicRoute(req) || isUploadthingRoute(req) || isGoogleCrawler(req)) {
            return NextResponse.next();
        }

        // Protect admin routes
        if (isAdminRoute(req)) {
            auth().protect();

            // Check for ADMIN role
            const isAdmin = auth().has({ role: 'org:ADMIN' });
            if (!isAdmin) {
                return NextResponse.redirect(signInPage);
            }
        }

        return NextResponse.next();
    },
    { debug: true },
); // Enable debugging for development

function isGoogleCrawler(req: Request): boolean {
    const userAgent = req.headers.get('user-agent');
    return userAgent?.toLowerCase().includes('googlebot') ?? false;
}

export const config = {
    matcher: [
        '/admin/tools',
        '/admin/:path*',
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/((?!.+\\.[\\w]+$|_next|api/checkout/webhook).*)',
        '/',
        '/(api|trpc)(.*)',
    ],
};
