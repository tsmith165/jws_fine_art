import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { getAuth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 2 } })
        .middleware(async ({ req }) => {
            const { userId } = getAuth(req);
            if (!userId) {
                throw new Error('Unauthorized');
            }

            const hasAdminRole = await isClerkUserIdAdmin(userId);
            if (!hasAdminRole) {
                throw new Error('Forbidden');
            }

            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, uploadedFileUrl: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
