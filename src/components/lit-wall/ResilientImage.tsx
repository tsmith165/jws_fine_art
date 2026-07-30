'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

// Falls back to the raw source when the Vercel image optimizer is unavailable
// (its plan quota returns 402 for every request) so media renders instead of
// a broken frame. The mount check matters: images that fail while the page is
// still hydrating never fire onError, so the DOM state is the only signal.
export function ResilientImage({ onError, ...props }: ImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [unoptimized, setUnoptimized] = useState(Boolean(props.unoptimized));

    useEffect(() => {
        const image = imageRef.current;
        if (image && image.complete && image.naturalWidth === 0) setUnoptimized(true);
    }, []);

    return (
        <Image
            {...props}
            ref={imageRef}
            unoptimized={unoptimized}
            onError={(event) => {
                onError?.(event);
                setUnoptimized(true);
            }}
        />
    );
}
