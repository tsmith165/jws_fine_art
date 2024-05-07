'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { eq } from 'drizzle-orm';
import { db, piecesTable } from '@/db/db';
import { Pieces } from '@/db/schema';

// React Icons
import { MdPlayArrow } from 'react-icons/md';
import { FaPause } from 'react-icons/fa';
import { IoIosArrowForward, IoIosSpeedometer } from 'react-icons/io';

type SlideshowProps = {
    piece_ids: number[];
};

export default function Slideshow({ piece_ids }: SlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(1200);
    const [showSlider, setShowSlider] = useState(false);
    const [pieces, setPieces] = useState<Pieces[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchPieces = async () => {
            const fetchedPieces = await Promise.all(
                piece_ids.map(async (id) => {
                    const [piece] = await db.select().from(piecesTable).where(eq(piecesTable.id, id)).limit(1);
                    return piece;
                }),
            );
            setPieces(fetchedPieces);
        };

        fetchPieces();
    }, [piece_ids]);

    useEffect(() => {
        if (isPlaying) {
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % pieces.length);
            }, speed);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentIndex, isPlaying, speed, pieces.length]);

    const handlePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + pieces.length) % pieces.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % pieces.length);
    };

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const speed = parseInt(e.target.value, 10);
        setSpeed(speed);
    };

    const current_piece = pieces[currentIndex];

    if (!current_piece) {
        return <div>Loading...</div>;
    }

    const { title, image_path } = current_piece;
    return (
        <div className="relative h-full w-full overflow-hidden bg-secondary_dark">
            <div className="absolute left-0 top-0 h-full w-full">
                <div className="relative h-full w-full">
                    <Image src={image_path} alt={title} fill className="object-contain" />
                </div>
            </div>

            {/* Slideshow Menu */}
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-between bg-primary_dark px-4 py-2">
                <div className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl text-primary">{title}</div>
                <div className="flex items-center space-x-4">
                    {isPlaying ? (
                        <FaPause className="h-8 w-8 cursor-pointer fill-primary hover:fill-secondary_dark" onClick={handlePlayPause} />
                    ) : (
                        <MdPlayArrow className="h-8 w-8 cursor-pointer fill-primary hover:fill-secondary_dark" onClick={handlePlayPause} />
                    )}
                    <IoIosArrowForward
                        className="h-8 w-8 rotate-180 transform cursor-pointer fill-primary hover:fill-primary"
                        onClick={handlePrev}
                    />
                    <IoIosArrowForward className="h-8 w-8 cursor-pointer fill-primary hover:fill-secondary_dark" onClick={handleNext} />
                    <div className="relative bg-primary_dark">
                        <div className="group relative" onMouseEnter={() => setShowSlider(true)} onMouseLeave={() => setShowSlider(false)}>
                            <IoIosSpeedometer className="relative z-10 h-8 w-8 cursor-pointer fill-primary" />
                            {showSlider && (
                                <div className="fixed bottom-10 right-0 z-0 transform rounded-tl-md bg-primary_dark p-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="range"
                                            min={100}
                                            max={10000}
                                            step={100}
                                            value={speed}
                                            onChange={handleSpeedChange}
                                            className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-secondary_light"
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, #54786d, #365349)',
                                            }}
                                        />
                                        <div className="w-8 text-right text-sm text-primary">{speed / 1000}s</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
