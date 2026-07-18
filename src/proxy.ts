import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    if (req.nextUrl.pathname.startsWith('/admin')) {
        if (!userId) {
            const signIn = new URL('/signin', req.url);
            signIn.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search);
            return NextResponse.redirect(signIn);
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*', '/api/uploadthing'],
};
