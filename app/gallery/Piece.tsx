'use client';

import Image from 'next/image';
import Link from 'next/link';

const USING_YELLOW_DOT = false;

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
        <div
            id={id}
            className={`absolute rounded-md bg-secondary_light p-1 ${className}`}
            style={{ width: img_width + 8, height: img_height + 8, top: y, left: x }}
        >
            <Link href={`/details/${id}`}>
                <div className={`p-0`} style={{ width: img_width }}>
                    <div className={`relative`}>
                        <Image
                            className={`p-0`}
                            src={image_path}
                            width={img_width}
                            height={img_height}
                            style={{ width: img_width, height: img_height }}
                            sizes="(min-width: 768px) 30vw, (max-width: 769px) 45vw"
                            alt={title}
                        />
                    </div>
                    {sold === true ? (
                        <div className={`absolute !bottom-2.5 right-2.5`}>
                            <Image
                                className={`!left-auto !top-auto`}
                                src="/redDot.png"
                                alt="Piece Sold"
                                width={30}
                                height={30}
                                priority={true}
                            />
                        </div>
                    ) : USING_YELLOW_DOT && available === false ? (
                        <div className={`absolute !bottom-2.5 right-2.5`}>
                            <Image
                                className={`!left-auto !top-auto`}
                                src="/yellowDot.png"
                                alt="Piece Sold"
                                layout="fixed"
                                width={30}
                                height={30}
                            />
                        </div>
                    ) : null}
                </div>
            </Link>
        </div>
    );
};

export default Piece;
