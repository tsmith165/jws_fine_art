'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type ProgressiveArtworkImageProps = {
    src: string;
    placeholderSrc?: string | null;
    alt: string;
    sizes: string;
    quality: number;
    priority?: boolean;
    fetchPriority?: 'high' | 'low' | 'auto';
    onReady?: () => void;
};

type ImageWarmupProps = {
    sources: string[];
    sizes: string;
    quality: number;
};

export function ProgressiveArtworkImage({
    src,
    placeholderSrc,
    alt,
    sizes,
    quality,
    priority = false,
    fetchPriority = 'auto',
    onReady,
}: ProgressiveArtworkImageProps) {
    const [loaded, setLoaded] = useState(false);
    const settled = useRef(false);
    const showPlaceholder = Boolean(placeholderSrc && placeholderSrc !== src);

    useEffect(() => {
        settled.current = false;
        setLoaded(false);
    }, [src]);

    const finish = () => {
        if (settled.current) return;
        settled.current = true;
        setLoaded(true);
        onReady?.();
    };

    const fail = () => {
        if (settled.current) return;
        settled.current = true;
        onReady?.();
    };

    return (
        <span className={`lw-progressive-image${loaded ? ' is-loaded' : ''}`}>
            {showPlaceholder ? (
                <Image
                    className="lw-progressive-image-placeholder"
                    src={placeholderSrc!}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="64px"
                    quality={75}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority="low"
                />
            ) : null}
            <Image
                className="lw-progressive-image-main"
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                quality={quality}
                priority={priority}
                fetchPriority={fetchPriority}
                onLoad={(event) => {
                    const image = event.currentTarget;
                    void image
                        .decode()
                        .catch(() => undefined)
                        .finally(finish);
                }}
                onError={fail}
            />
        </span>
    );
}

export function ImageWarmup({ sources, sizes, quality }: ImageWarmupProps) {
    return (
        <span className="lw-image-warmup" aria-hidden="true">
            {[...new Set(sources)].map((src) => (
                <Image
                    key={src}
                    src={src}
                    alt=""
                    width={1600}
                    height={1200}
                    sizes={sizes}
                    quality={quality}
                    loading="eager"
                    fetchPriority="low"
                />
            ))}
        </span>
    );
}
