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
        <div className="relative h-[calc(100dvh-50px)] w-full overflow-hidden bg-stone-900">
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
                    <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px]">
                        <Image src="/logo/full_logo.png" alt="JWS Fine Art Logo" width={1335} height={541} />
                    </div>
                </motion.div>
            )}
            <div className="absolute bottom-8 left-0 w-full">
                <div className="flex h-fit w-full items-center justify-center space-x-2">
                    <Link
                        href="/gallery"
                        className="rounded-full bg-primary px-6 py-2 text-secondary_dark opacity-55 transition-colors duration-300 hover:opacity-90 active:opacity-90"
                    >
                        Enter Gallery
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Homepage;
