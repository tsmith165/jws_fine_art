'use client';

import { SignedIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';

const EditPieceButton = ({ db_id }: { db_id: number }) => {
    const { user } = useUser();

    return (
        <SignedIn>
            {user && user.publicMetadata.role === 'ADMIN' && (
                <Link href={`/admin/edit?id=${db_id}`} className="flex h-full w-fit" prefetch={false}>
                    <div className="flex h-full items-center justify-center rounded-md border-2 border-primary_dark bg-primary px-3 font-bold text-secondary_dark hover:border-primary hover:bg-secondary_dark hover:text-primary">
                        Edit Piece
                    </div>
                </Link>
            )}
        </SignedIn>
    );
};

export default EditPieceButton;
