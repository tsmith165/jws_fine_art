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

export default authMiddleware({
    publicRoutes,
    async afterAuth(auth, req, evt) {
        const sign_in_page = new URL('/signin', req.url);

        const { userId, isPublicRoute, getToken } = auth;
        const user = userId ? await clerkClient.users.getUser(userId) : null;

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
