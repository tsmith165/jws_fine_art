import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getAuth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 2 } })
        .middleware(async ({ req }) => {
            // Get the authenticated user from Clerk
            const { userId } = getAuth(req);
            console.log('Middleware: User ID:', userId);

            // If the user is not authenticated, allow the request to proceed (for webhook callback)
            if (!userId) {
                console.log('User is not authenticated. Allowing request to proceed.');
                return {};
            }

            console.log('User is authenticated. Continuing...');

            const hasAdminRole = await isClerkUserIdAdmin(userId);
            console.log('User hasAdminRole: ' + hasAdminRole);
            if (!hasAdminRole) {
                console.log('User does not have admin role. Redirecting to home page.');
                return {};
            }
            console.log('User has admin role. Continuing...');

            // Return the authenticated user ID
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            console.log('Upload complete for userId:', metadata.userId);
            console.log('file url', file.url);

            const originalFileName = file.name;
            console.log('originalFileName:', originalFileName);

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId, uploadedFileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
