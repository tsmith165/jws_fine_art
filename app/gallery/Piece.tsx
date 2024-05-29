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
};

const Piece: React.FC<PieceProps> = ({ dimensions, id, className, o_id, image_path, title, sold, available }) => {
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
                    sizes="(min-width: 768px) 30vw, (max-width: 769px) 45vw"
                    alt={title}
                    priority
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
