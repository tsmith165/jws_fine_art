'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface HomepageData {
    id: number;
    title: string;
    image_path: string;
    bio_paragraph: string;
}

interface HomepageProps {
    homepage_data: HomepageData[];
}

const slideDirections = [
    { x: '-100vw', opacity: 0 },
    { x: '100vw', opacity: 0 },
    { y: '-100vh', opacity: 0 },
    { y: '100vh', opacity: 0 },
];

const Homepage = ({ homepage_data }: HomepageProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageLoaded(false); // Reset image loaded state
            setCurrentIndex((prevIndex) => (prevIndex + 1) % homepage_data.length);
        }, 7500);

        return () => clearInterval(interval);
    }, [homepage_data.length]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className="relative h-screen w-screen">
            <AnimatePresence>
                {homepage_data.map((data, index) => {
                    const isEven = index % 2 === 0;
                    const direction = slideDirections[index % slideDirections.length];

                    const current_image_div = (
                        <Image
                            src="/bio_pic_updated_small.jpg"
                            alt="Bio Pic"
                            width={300}
                            height={400}
                            quality={100}
                            className="h-[calc((100%-80px)/2)] w-auto rounded-lg bg-secondary p-1 md:h-full md:w-full"
                        />
                    );
                    const current_paragraph_div = (
                        <p
                            className={`max-h-[calc((100%-80px)/2)] max-w-prose overflow-y-auto rounded-lg bg-secondary_dark bg-opacity-70 stroke-secondary_light stroke-1 p-2 text-lg text-primary md:h-full`}
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
                                className="absolute inset-0 h-[calc(100%-80px)]"
                            >
                                <Image
                                    src={data.image_path}
                                    alt={data.title}
                                    layout="fill"
                                    objectFit="cover"
                                    quality={100}
                                    priority
                                    onLoadingComplete={handleImageLoad}
                                />

                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-secondary_dark bg-opacity-40 p-4 text-center text-white md:flex-row md:space-x-4 md:space-y-0">
                                    {isEven ? current_image_div : current_paragraph_div}
                                    {!isEven ? current_image_div : current_paragraph_div}
                                </div>
                            </motion.div>
                        )
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Homepage;
