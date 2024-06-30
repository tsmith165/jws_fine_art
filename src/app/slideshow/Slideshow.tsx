'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { MdPlayArrow } from 'react-icons/md';
import { FaPause } from 'react-icons/fa';
import { IoIosArrowForward, IoIosSpeedometer } from 'react-icons/io';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

type SlideshowProps = {
    pieceList: { title: string; image_path: string }[];
};

export default function Slideshow({ pieceList }: SlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(2000);
    const [showSlider, setShowSlider] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-stone-900">
            <div className="relative h-full w-full">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={variants}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={image_path}
                            alt={title}
                            layout="fill"
                            objectFit="contain"
                            className="object-contain"
                            onLoad={() => setIsImageLoaded(true)}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex h-[50px] w-full flex-row bg-stone-400">
                <div className="flex !w-[108px] min-w-[108px]"></div>
                <div className="flex w-full flex-grow items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-[600] text-primary_dark">
                    {title}
                </div>
                <div className="flex w-fit flex-grow items-center">
                    {isPlaying ? (
                        <FaPause
                            className="h-[50px] w-[50px] cursor-pointer fill-primary_dark py-2 hover:fill-primary"
                            onClick={handlePlayPause}
                        />
                    ) : (
                        <MdPlayArrow
                            className="h-[50px] w-[50px] cursor-pointer fill-primary_dark py-2 hover:fill-primary"
                            onClick={handlePlayPause}
                        />
                    )}
                    <div className="group relative mr-2" onMouseEnter={() => setShowSlider(true)} onMouseLeave={() => setShowSlider(false)}>
                        <IoIosSpeedometer
                            className={`${showSlider ? 'fill-primary' : 'fill-primary_dark'} relative z-10 h-[50px] w-[50px] cursor-pointer py-2 hover:fill-primary`}
                        />
                        {showSlider && (
                            <div className="fixed bottom-[48px] right-0 z-0 transform rounded-tl-md bg-stone-400 p-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min={1500}
                                        max={10000}
                                        step={100}
                                        value={speed}
                                        onChange={handleSpeedChange}
                                        className="slider w-24 appearance-none bg-transparent"
                                    />
                                    <div className="w-8 text-center text-sm text-primary">{speed / 1000}s</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
