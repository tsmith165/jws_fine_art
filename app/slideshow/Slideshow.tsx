'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { MdPlayArrow } from 'react-icons/md';
import { FaPause } from 'react-icons/fa';
import { IoIosArrowForward, IoIosSpeedometer } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

type SlideshowProps = {
    pieceListPromise: Promise<{ title: string; image_path: string }[]>;
};

export default function Slideshow({ pieceListPromise }: SlideshowProps) {
    const [pieceList, setPieceList] = useState<{ title: string; image_path: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(2000);
    const [showSlider, setShowSlider] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        pieceListPromise.then((data) => {
            setPieceList(data);
            preloadNextImage(data);
        });
    }, [pieceListPromise]);

    const preloadNextImage = (list: { title: string; image_path: string }[]) => {
        if (list.length > 0) {
            const img = new window.Image();
            img.src = list[nextIndex].image_path;
            img.onload = () => setIsImageLoaded(true);
        }
    };

    useEffect(() => {
        if (isPlaying && isImageLoaded) {
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex(nextIndex);
                setNextIndex((nextIndex + 1) % pieceList.length);
                setIsImageLoaded(false);
                preloadNextImage(pieceList);
            }, speed);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [nextIndex, isPlaying, speed, pieceList.length, isImageLoaded]);

    const handlePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + pieceList.length) % pieceList.length;
        setNextIndex(newIndex);
        setIsImageLoaded(false);
        preloadNextImage(pieceList);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % pieceList.length;
        setNextIndex(newIndex);
        setIsImageLoaded(false);
        preloadNextImage(pieceList);
    };

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const speed = parseInt(e.target.value, 10);
        setSpeed(speed);
    };

    if (pieceList.length === 0) {
        return <LoadingSpinner page="Slideshow" />;
    }

    const current_piece = pieceList[currentIndex];

    if (!current_piece) {
        return <LoadingSpinner page="Slideshow" />;
    }

    const { title, image_path } = current_piece;

    const variants = {
        initial: { opacity: 0, x: -100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-secondary_dark">
            <div className="h-full w-full">
                <AnimatePresence>
                    <motion.div
                        key={currentIndex}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        transition={{ duration: 1 }}
                        className="relative h-full w-full"
                    >
                        <Image src={image_path} alt={title} fill className="object-contain" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex h-[50px] w-full items-center justify-between bg-primary_dark px-4 py-2">
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
