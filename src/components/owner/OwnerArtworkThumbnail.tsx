'use client';

import { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import Image from 'next/image';

type OwnerArtworkThumbnailProps = {
    imageUrl?: string | null;
    index: number;
};

export function OwnerArtworkThumbnail({ imageUrl, index }: OwnerArtworkThumbnailProps) {
    const [failed, setFailed] = useState(false);

    return (
        <span className="owner-recent-order-artwork" aria-hidden="true">
            {imageUrl && !failed ? (
                <Image src={imageUrl} alt="" fill sizes="52px" quality={75} onError={() => setFailed(true)} />
            ) : (
                <>
                    <PackageCheck size={17} />
                    <small>{String(index + 1).padStart(2, '0')}</small>
                </>
            )}
        </span>
    );
}
