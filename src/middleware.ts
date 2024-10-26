import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

export default clerkMiddleware(async (auth, req) => {
    const userId = auth().userId;

    // Apply admin checks only on protected routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!userId) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        const hasAdminRole = await isClerkUserIdAdmin(userId);
        if (!hasAdminRole) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/api/uploadthing'],
};
