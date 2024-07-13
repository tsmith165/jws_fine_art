'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Head from 'next/head';

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
    console.log('Rendering Homepage...');
    const [isLogoVisible, setLogoVisible] = useState(true);
    const [isImageVisible, setImageVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const rotateImages = async () => {
            while (true) {
                await delay(5500); // Wait before starting transition
                setImageVisible(false);
                await delay(1500); // Wait for fade out
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % homepageData.length);
                await delay(100); // Small delay before fade in
                setImageVisible(true);
            }
        };

        const startRotation = async () => {
            await delay(250);
            setImageVisible(true);
            rotateImages();
        };

        startRotation();
    }, [homepageData.length]);

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
        <>
            <Head>
                <link rel="preload" href={homepageData[0].image_path} as="image" />
            </Head>
            <div className="relative h-[calc(100dvh-50px)] w-full overflow-hidden bg-stone-900">
                <AnimatePresence mode="wait">
                    {isImageVisible && (
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1 }}
                            animate={{ opacity: 1, scale: 1.3 }}
                            exit={{ opacity: 0, scale: 1 }}
                            transition={{ duration: 3 }}
                            className="absolute inset-0 h-full w-full"
                        >
                            <Image
                                src={homepageData[currentImageIndex].image_path}
                                width={homepageData[currentImageIndex].width}
                                height={homepageData[currentImageIndex].height}
                                className="absolute inset-0 h-full w-full object-cover"
                                alt={homepageData[currentImageIndex].title}
                                priority={currentImageIndex === 0}
                                loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
                                placeholder="blur"
                                blurDataURL={`data:image/svg+xml;base64,${btoa(
                                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${homepageData[currentImageIndex].width} ${homepageData[currentImageIndex].height}">
                                        <filter id="b" color-interpolation-filters="sRGB">
                                            <feGaussianBlur stdDeviation="20" />
                                        </filter>
                                        <rect width="100%" height="100%" x="0" y="0" fill="#f0f0f0" filter="url(#b)" />
                                    </svg>`,
                                )}`}
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
                />
                {isLogoVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px]">
                            <Image src="/logo/full_logo_small.png" alt="JWS Fine Art Logo" width={370} height={150} priority />
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
        </>
    );
};

export default React.memo(Homepage);
