import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

const isPrivateRoute = createRouteMatcher(['/admin(/.*)', '/api/uploadthing']);

export default clerkMiddleware(async (auth, req) => {
    const route_is_private = isPrivateRoute(req);
    console.log('Current route: ' + req.url);
    console.log('Route is private? ' + route_is_private);

    // Check if the request is for the Uploadthing route
    const isUploadthingRoute = req.nextUrl.pathname === '/api/uploadthing';
    if (isUploadthingRoute) {
        return NextResponse.next();
    }

    if (route_is_private === true) {
        console.log('Route is private.  Protecting with admin role.');
        console.log('Current auth object: ' + JSON.stringify(auth()));

        const userId = auth().userId;
        console.log('User ID: ' + userId);

        if (!userId) {
            console.log('User ID is null. Redirecting to home page.');
            return NextResponse.redirect(new URL('/', req.url));
        }

        const hasAdminRole = await isClerkUserIdAdmin(userId);
        console.log('User hasAdminRole: ' + hasAdminRole);
        if (!hasAdminRole) {
            console.log('User does not have admin role. Redirecting to home page.');
            return NextResponse.redirect(new URL('/', req.url));
        }
        console.log('User has admin role. Continuing...');
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
