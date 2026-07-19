import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!userId) {
            const denied = new URL('/not-authorized', req.url);
            denied.searchParams.set('return_to', req.nextUrl.pathname + req.nextUrl.search);
            return NextResponse.redirect(denied);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/api/uploadthing', '/signin/:path*', '/signout', '/not-authorized'],
};
