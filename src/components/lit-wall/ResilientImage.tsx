'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

// Falls back to the raw source when the Vercel image optimizer is unavailable
// (its plan quota returns 402 for every request) so media renders instead of
// a broken frame. ProgressiveArtworkImage has its own richer fallback.
export function ResilientImage({ onError, ...props }: ImageProps) {
    const [unoptimized, setUnoptimized] = useState(Boolean(props.unoptimized));
    return (
        <Image
            {...props}
            unoptimized={unoptimized}
            onError={(event) => {
                onError?.(event);
                setUnoptimized(true);
            }}
        />
    );
}
