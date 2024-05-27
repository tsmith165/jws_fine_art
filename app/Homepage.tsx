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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % homepage_data.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [homepage_data.length]);

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
                            className="rounded-lg bg-secondary p-1 "
                        />
                    );
                    const current_paragraph_div = (
                        <p
                            className={`max-w-prose rounded-lg bg-secondary_dark bg-opacity-70 stroke-secondary_light stroke-1 p-2 text-lg text-primary`}
                        >
                            {data.bio_paragraph}
                        </p>
                    );

                    return (
                        index === currentIndex && (
                            <motion.div
                                key={data.id}
                                initial={direction}
                                animate={{ x: 0, y: 0, opacity: 1 }}
                                exit={direction}
                                transition={{ duration: 1 }}
                                className="absolute inset-0"
                            >
                                <Image src={data.image_path} alt={data.title} layout="fill" objectFit="cover" quality={100} priority />

                                <div className="absolute inset-0 flex flex-col items-center justify-center space-x-4 bg-secondary_dark bg-opacity-40 p-4 text-center text-white md:flex-row">
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
