'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause } from 'react-icons/fa';

const images = [
    {
        src: '/marketing/event_1-outer-small.jpg',
        width: 512,
        height: 683,
    },
    {
        src: '/marketing/event_1-inner-small.jpg',
        width: 683,
        height: 512,
    },
];

export default function EventsBasic() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);
    const [showSlider, setShowSlider] = useState(false);

    const selectedImageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, speed);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [speed, isPlaying]);

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const togglePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value, 10);
        setSpeed(newSpeed);
    };

    return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-stone-900 p-4" ref={selectedImageRef}>
            <div className="relative flex w-fit cursor-pointer items-center justify-center space-y-2 pb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex max-h-[40dvh] min-h-[40dvh] w-auto items-center justify-center rounded-md md:max-h-[50dvh] md:min-h-[50dvh]"
                    >
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex].src}
                            alt={`Event Image ${currentImageIndex + 1}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            width={images[currentImageIndex].width}
                            height={images[currentImageIndex].height}
                            className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex h-7 w-full items-center justify-center space-x-4 pb-1">
                <div className="flex w-full flex-row">
                    <div className="flex w-full flex-grow justify-end pr-1">
                        {images.length > 1 && (
                            <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} className="ml-2">
                                {isPlaying ? (
                                    <FaPause className="fill-stone-600 text-xl hover:fill-primary" />
                                ) : (
                                    <FaPlay className="fill-stone-600 text-xl hover:fill-primary" />
                                )}
                            </button>
                        )}
                    </div>
                    <div className="flex w-fit items-center justify-center space-x-2">
                        {images.length > 1 && (
                            <button aria-label="Previous" onClick={handlePrev} className="">
                                <IoIosArrowBack className="fill-stone-600 text-2xl hover:fill-primary" />
                            </button>
                        )}
                        {images.map((_, index) => (
                            <div
                                key={`dot-${index}`}
                                className={`h-3 w-3 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-stone-600'}`}
                            />
                        ))}
                        {images.length > 1 && (
                            <button aria-label="Next" onClick={handleNext} className="">
                                <IoIosArrowForward className="fill-stone-600 text-2xl hover:fill-primary" />
                            </button>
                        )}
                    </div>
                    <div
                        className="group relative flex w-full flex-grow flex-row justify-start pl-1"
                        onMouseEnter={() => setShowSlider(true)}
                        onMouseLeave={() => setShowSlider(false)}
                    >
                        {images.length > 1 && (
                            <>
                                {showSlider ? (
                                    <div className="mr-0.5 w-6 text-center leading-6 text-primary">
                                        {speed / 1000}s
                                    </div>
                                ) : (
                                    <IoIosSpeedometer
                                        className={`${
                                            showSlider ? 'fill-primary' : 'fill-stone-600'
                                        } relative z-10 h-[24px] w-[24px] cursor-pointer fill-stone-600 hover:fill-primary`}
                                    />
                                )}
                                {showSlider && (
                                    <div className="z-0 flex h-[24px] transform items-center justify-center rounded-md px-2">
                                        <div className="jutify-center flex items-center justify-center">
                                            <input
                                                type="range"
                                                min={2000}
                                                max={10000}
                                                step={100}
                                                value={speed}
                                                onChange={handleSpeedChange}
                                                className="w-16 cursor-pointer appearance-none rounded-lg bg-stone-600 xs:w-20 md:w-24 [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:bg-stone-600 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <h1 className="bg-gradient-to-r from-primary via-primary_dark to-primary bg-clip-text text-center text-4xl font-bold text-transparent">
                Events
            </h1>
            <p className="text-center text-xl font-semibold text-stone-300">Next dates and details coming soon!</p>
        </div>
    );
}