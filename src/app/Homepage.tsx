'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const Homepage: React.FC<HomepageProps> = ({ homepageData }) => {
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [isImageVisible, setImageVisible] = useState(false);
    const currentImageIndexRef = useRef(0);

    useEffect(() => {
        const interval = setInterval(async () => {
            setImageVisible(false);
            await delay(1500);
            currentImageIndexRef.current = (currentImageIndexRef.current + 1) % homepageData.length;
            setImageVisible(true);
        }, 5500);

        setTimeout(async () => {
            await delay(1000);
            setImageVisible(true);
        }, 1000);

        return () => clearInterval(interval);
    }, [homepageData]);

    const circularFadeVariants = {
        hidden: {
            background: 'radial-gradient(circle, transparent 0%, rgba(23, 23, 23, 0) 60%)',
        },
        visible: {
            background: 'radial-gradient(circle, transparent 20%, rgba(23, 23, 23, 1) 100%)',
            transition: { duration: 2 },
        },
    };

    return (
        <div className="relative h-[calc(100dvh-50px)] w-full overflow-hidden bg-stone-800">
            <AnimatePresence>
                {isImageVisible && (
                    <motion.div
                        key={currentImageIndexRef.current}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 1.3 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 3 }}
                        className="absolute inset-0 h-full w-full"
                    >
                        <Image
                            src={homepageData[currentImageIndexRef.current].image_path}
                            width={homepageData[currentImageIndexRef.current].width}
                            height={homepageData[currentImageIndexRef.current].height}
                            className="absolute inset-0 h-full w-full object-cover"
                            alt={homepageData[currentImageIndexRef.current].title}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                variants={circularFadeVariants}
                initial="hidden"
                animate={isImageVisible ? 'visible' : 'hidden'}
                transition={{ duration: 2 }}
                className="absolute inset-0 bg-neutral-900"
            ></motion.div>
            {isLogoVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-full bg-neutral-900 opacity-70">
                        <Image src="/logo/full_logo.png" alt="JWS Fine Art Logo" width={300} height={300} />
                    </div>
                </motion.div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                <Link
                    href="/gallery"
                    className="rounded-full bg-secondary px-6 py-2 text-secondary_dark transition-colors duration-300 hover:bg-secondary_dark hover:text-primary"
                >
                    Enter Gallery
                </Link>
            </div>
        </div>
    );
};

export default Homepage;
