import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { requireAdminRequest } from '@/utils/auth/requireAdminRequest';

const f = createUploadthing();

export const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '32MB', maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const userId = await requireAdminRequest(req);
            return { userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { uploadedBy: metadata.userId, uploadedFileUrl: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
