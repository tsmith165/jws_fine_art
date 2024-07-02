import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '4MB' } })
        .middleware(async ({ req }) => {
            // Get the authenticated user from Clerk
            const { userId } = getAuth(req);

            // If the user is not authenticated, throw an error
            if (!userId) {
                console.log('User is not authenticated. Cannot upload image.');
                throw new Error('Unauthorized');
            }
            console.log('User is authenticated. Continuing...');

            // Get the user's role from Clerk
            const user = await clerkClient.users.getUser(userId);
            const userRole = user.publicMetadata?.role;

            // Check if the user has the "ADMIN" role
            if (userRole !== 'ADMIN') {
                console.log('User does not have the "ADMIN" role. Cannot upload image.');
                throw new Error('Forbidden');
            }
            console.log('User has the "ADMIN" role. Continuing...');

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