import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPrivateRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
    const route_is_private = isPrivateRoute(req);
    console.log('Current route: ' + req.url);
    console.log('Route is private? ' + route_is_private);

    if (route_is_private) {
        console.log('Route is private.  Protecting with ADMIN role.');
        try {
            auth().protect({ role: 'org:ADMIN' });
        } catch (error) {
            console.error('Error protecting route with ADMIN role:', error);
            return NextResponse.redirect(new URL('/signin', req.url));
        }
    } else {
        return NextResponse.next();
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
