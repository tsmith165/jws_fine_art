'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Image from 'next/image';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import Link from 'next/link';

interface HomepageData {
    id: number;
    title: string;
    image_path: string;
    width: number;
    height: number;
    bio_paragraph: string;
}

interface HomepageProps {
    homepageData: HomepageData[];
}

const slideDirections = [
    { x: '-100vw', opacity: 0 },
    { x: '100vw', opacity: 0 },
    { y: '-100dvh', opacity: 0 },
    { y: '100dvh', opacity: 0 },
];

const Homepage = ({ homepageData }: HomepageProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setImageLoaded(false);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % homepageData.length);
            setFirstLoad(false);
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
                    const direction = firstLoad && index === 0 ? { opacity: 0 } : slideDirections[index % slideDirections.length];

                    const current_image_div = (
                        <div className="flex h-fit min-w-[20%] flex-col space-y-0 rounded-lg bg-secondary bg-opacity-85">
                            <Image
                                src="/bio/bio_pic_updated_small.jpg"
                                alt="Bio Pic"
                                width={300}
                                height={400}
                                quality={100}
                                className="h-auto w-48 rounded-lg p-1 pb-0 md:max-h-fit md:w-auto"
                            />
                            <Link
                                href={'/gallery'}
                                className="w-full rounded rounded-b-lg rounded-t-none py-1 text-gray-400 hover:bg-secondary_dark hover:bg-opacity-25 hover:font-bold hover:text-primary"
                                prefetch={false}
                            >
                                Enter Gallery
                            </Link>
                        </div>
                    );

                    const current_paragraph_div = (
                        <p
                            className={`h-fit max-h-[30%] max-w-[80%] overflow-y-auto rounded-lg bg-secondary bg-opacity-85 p-2 text-lg text-gray-400 md:max-h-fit md:max-w-[60%]`}
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

                                <div className="absolute inset-0 flex h-full flex-col items-center justify-center space-y-4 px-4 py-4 text-center text-white md:flex-row md:space-x-4 md:space-y-0">
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
