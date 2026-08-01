import type { ComponentProps } from 'react';
import type { ArtworkPresentationCrop } from '@/types/artwork';
import { ResilientImage } from './ResilientImage';

type Props = ComponentProps<typeof ResilientImage> & { crop?: ArtworkPresentationCrop | null };

export function ArtworkPresentationImage({ crop, className, ...props }: Props) {
    if (!crop || !Object.values(crop).some((value) => value > 0)) return <ResilientImage className={className} {...props} />;
    const visibleWidth = 1 - crop.left - crop.right;
    const visibleHeight = 1 - crop.top - crop.bottom;
    return (
        <span className={['lw-presentation-crop', className].filter(Boolean).join(' ')} aria-hidden={props.alt === '' ? 'true' : undefined}>
            <span
                style={{
                    left: `${(-crop.left / visibleWidth) * 100}%`,
                    top: `${(-crop.top / visibleHeight) * 100}%`,
                    width: `${100 / visibleWidth}%`,
                    height: `${100 / visibleHeight}%`,
                }}
            >
                <ResilientImage {...props} className={undefined} />
            </span>
        </span>
    );
}
