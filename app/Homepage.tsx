'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface HomepageData {
    id: number;
    title: string;
    image_path: string;
    width: number;
    height: number;
    bio_paragraph: string;
}

interface HomepageProps {
    homepageDataPromise: Promise<HomepageData[]>;
}

const slideDirections = [
    { x: '-100vw', opacity: 0 },
    { x: '100vw', opacity: 0 },
    { y: '-100vh', opacity: 0 },
    { y: '100vh', opacity: 0 },
];

const Homepage = ({ homepageDataPromise }: HomepageProps) => {
    const [homepageData, setHomepageData] = useState<HomepageData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        homepageDataPromise.then((data) => {
            setHomepageData(data);
        });
    }, [homepageDataPromise]);

    const startInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setImageLoaded(false);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % homepageData.length);
        }, 7500);
    };

    useEffect(() => {
        if (!isPaused) startInterval();
        return () => clearInterval(intervalRef.current!);
    }, [homepageData.length, isPaused]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % homepageData.length);
        startInterval();
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + homepageData.length) % homepageData.length);
        startInterval();
    };

    const handlePanEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
        if (Math.abs(offset.y) < Math.abs(offset.x)) {
            if (offset.x > 100 || velocity.x > 1) {
                handlePrev();
            } else if (offset.x < -100 || velocity.x < -1) {
                handleNext();
            }
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col space-y-2">
            <AnimatePresence>
                {homepageData.map((data, index) => {
                    const isEven = index % 2 === 0;
                    const direction = slideDirections[index % slideDirections.length];

                    const current_image_div = (
                        <Image
                            src="/bio_pic_updated_small.jpg"
                            alt="Bio Pic"
                            width={300}
                            height={400}
                            quality={100}
                            className="max-h-[calc(calc(100%-50px)/2)] w-auto rounded-lg bg-secondary p-1 md:h-full md:w-auto"
                        />
                    );
                    const current_paragraph_div = (
                        <p
                            className={`h-fit max-h-[calc(calc(100%-50px)/2)] max-w-prose overflow-y-auto rounded-lg bg-secondary_dark bg-opacity-85 p-2 text-lg text-gray-400 md:max-h-fit`}
                        >
                            {data.bio_paragraph}
                        </p>
                    );

                    const variants = {
                        initial: direction,
                        animate: { x: 0, y: 0, opacity: 1 },
                        exit: { opacity: 0 },
                    };

                    return (
                        index === currentIndex && (
                            <motion.div
                                key={data.id}
                                initial="initial"
                                animate={imageLoaded ? 'animate' : {}}
                                exit="exit"
                                variants={variants}
                                transition={{ duration: 1 }}
                                className="absolute inset-0 h-full"
                                onPanEnd={handlePanEnd}
                            >
                                <Image
                                    src={data.image_path}
                                    alt={data.title}
                                    width={data.width}
                                    height={data.height}
                                    className="h-full w-full object-cover"
                                    quality={100}
                                    priority
                                    onLoad={handleImageLoad}
                                />

                                <div className="absolute inset-0 flex h-[calc(100%-50px)] flex-col items-center justify-center space-y-2 px-4 text-center text-white md:flex-row md:space-x-4 md:space-y-0">
                                    {isEven ? current_image_div : current_paragraph_div}
                                    {!isEven ? current_image_div : current_paragraph_div}
                                </div>
                            </motion.div>
                        )
                    );
                })}
            </AnimatePresence>
            <div className="absolute bottom-0 flex h-[50px] w-full items-center justify-center space-x-4">
                <button aria-label="Previous" onClick={handlePrev} className="rounded-lg bg-secondary_dark p-1 hover:bg-secondary">
                    <IoIosArrowBack className="text-2xl" />
                </button>
                {homepageData.map((_, index) => (
                    <div
                        key={index}
                        className={`h-4 w-4 rounded-full border-2 ${
                            index === currentIndex ? 'border-secondary_dark bg-primary' : 'border-primary bg-secondary_dark'
                        }`}
                    ></div>
                ))}
                <button aria-label="Next" onClick={handleNext} className="rounded-lg bg-secondary_dark p-1 hover:bg-secondary">
                    <IoIosArrowForward className="text-2xl" />
                </button>
            </div>
        </div>
    );
};

export default Homepage;
