'use client';

import Image from 'next/image';
import Link from 'next/link';

type PieceProps = {
    dimensions: [number, number, number, number];
    id: string;
    className: string;
    o_id: string;
    image_path: string;
    title: string;
    sold: boolean;
    available: boolean;
    index: number;
};

const Piece: React.FC<PieceProps> = ({ dimensions, id, className, o_id, image_path, title, sold, available, index }) => {
    var [x, y, img_width, img_height] = dimensions;
    x = x == null || x < 0 ? 0 : x;

    return (
        <div id={id} className={`absolute rounded-md ${className}`} style={{ width: img_width, height: img_height, top: y, left: x }}>
            <Link href={`/details/${id}`}>
                <Image
                    className={`rounded-md bg-secondary_light p-1`}
                    src={image_path}
                    width={img_width}
                    height={img_height}
                    sizes="(min-width: 1291px) calc(20vw - 30px), (min-width: 1031px) calc(25vw - 30px), (min-width: 771px) calc(33vw - 20px), (min-width: 611px) calc(50vw - 10px), calc(calc(100vw - 120px) / 2)"
                    quality={70}
                    alt={title}
                    priority={index < 10}
                />
                {sold === true || available === false ? (
                    <div className={`absolute !bottom-2.5 right-2.5`}>
                        <Image className={`!left-auto !top-auto`} src="/redDot.png" alt="Piece Sold" width={30} height={30} priority />
                    </div>
                ) : null}
            </Link>
        </div>
    );
};

export default Piece;
