'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack, IoIosSpeedometer } from 'react-icons/io';
import { FaPlay, FaPause } from 'react-icons/fa';
import { PiecesWithImages } from '@/db/schema';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

interface SelectedPieceViewProps {
    selectedPiece: PiecesWithImages;
    currentImageIndex: number;
    imageList: { src: string; width: number; height: number }[];
    imageLoadStates: { [key: number]: boolean };
    handleImageLoad: () => void;
    setIsFullScreenImage: (isFullScreen: boolean) => void;
    selectedPieceIndex: number | null;
    selectedImageRef: React.RefObject<HTMLDivElement>;
    handleNext: () => void;
    handlePrev: () => void;
    togglePlayPause: () => void;
    isPlaying: boolean;
    speed: number;
    setSpeed: (speed: number) => void;
}

const SelectedPieceView: React.FC<SelectedPieceViewProps> = ({
    selectedPiece,
    currentImageIndex,
    imageList,
    imageLoadStates,
    handleImageLoad,
    setIsFullScreenImage,
    selectedPieceIndex,
    selectedImageRef,
    handleNext,
    handlePrev,
    togglePlayPause,
    isPlaying,
    speed,
    setSpeed,
}) => {
    const [showSlider, setShowSlider] = useState(false);

    const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSpeed = parseInt(e.target.value, 10);
        setSpeed(newSpeed);
    };

    return (
        <motion.div
            className={`flex h-fit w-full flex-col items-center p-4 pb-0`}
            ref={selectedImageRef}
            initial={{ y: -300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75 }}
        >
            <h1 className="pb-2 font-cinzel text-2xl font-bold text-primary">{selectedPiece.title}</h1>
            <div className="relative flex w-fit cursor-pointer items-center justify-center space-y-2 pb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedPieceIndex}-${currentImageIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: imageLoadStates[currentImageIndex] ? 1 : 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setIsFullScreenImage(true)}
                        className="flex max-h-[40dvh] min-h-[40dvh] w-auto items-center justify-center rounded-md md:max-h-[50dvh] md:min-h-[50dvh]"
                    >
                        {imageList.map((image, index) =>
                            index === currentImageIndex ? (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedPiece.title}
                                    width={image.width}
                                    height={image.height}
                                    className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                                    onLoad={handleImageLoad}
                                />
                            ) : (
                                <motion.img
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[index] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={`selected-${index}`}
                                    src={image.src}
                                    alt={selectedPiece.title}
                                    width={image.width}
                                    height={image.height}
                                    hidden
                                    className="max-h-[40dvh] w-auto rounded-md bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
                                    onLoad={handleImageLoad}
                                />
                            ),
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex h-7 w-full items-center justify-center space-x-4 pb-1">
                <div className="flex w-full flex-row">
                    <div className="flex w-full flex-grow justify-end">
                        {imageList.length > 1 && (
                            <button aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} className="ml-2">
                                {isPlaying ? (
                                    <FaPause className="fill-primary text-xl hover:fill-primary_dark" />
                                ) : (
                                    <FaPlay className="fill-primary text-xl hover:fill-primary_dark" />
                                )}
                            </button>
                        )}
                    </div>
                    <div className="flex w-fit items-center justify-center space-x-2">
                        {imageList.length > 1 && (
                            <button aria-label="Previous" onClick={handlePrev} className="">
                                <IoIosArrowBack className="text-2xl hover:fill-primary" />
                            </button>
                        )}
                        {imageList.map((_, index) => (
                            <div
                                key={`dot-${index}`}
                                className={`h-4 w-4 rounded-full border-2 text-2xl ${
                                    index === currentImageIndex ? 'border-stone-600 bg-primary' : 'border-primary bg-stone-600'
                                }`}
                            ></div>
                        ))}
                        {imageList.length > 1 && (
                            <button aria-label="Next" onClick={handleNext} className="">
                                <IoIosArrowForward className="text-2xl hover:fill-primary" />
                            </button>
                        )}
                    </div>
                    <div
                        className="group relative flex w-full flex-grow flex-row justify-start"
                        onMouseEnter={() => setShowSlider(true)}
                        onMouseLeave={() => setShowSlider(false)}
                    >
                        <IoIosSpeedometer
                            className={`${
                                showSlider ? 'fill-primary_dark' : 'fill-primary'
                            } relative z-10 h-[24px] w-[24px] cursor-pointer hover:fill-primary_dark`}
                        />
                        {showSlider && (
                            <div className="z-0 h-[24px] transform rounded-md px-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="range"
                                        min={2000}
                                        max={10000}
                                        step={100}
                                        value={speed}
                                        onChange={handleSpeedChange}
                                        className="slider h-[24px] w-24 appearance-none bg-transparent"
                                    />
                                    <div className="w-8 text-center text-sm text-primary">{speed / 1000}s</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex h-fit w-full flex-col items-center space-y-0.5">
                {selectedPiece.piece_type && <p className="text-lg font-bold text-primary">{selectedPiece.piece_type}</p>}
                {selectedPiece.real_width && selectedPiece.real_height && (
                    <p className="text-lg font-bold text-primary">
                        {`${selectedPiece.real_width}" x ${selectedPiece.real_height}"${selectedPiece.framed ? ' Framed' : ''}`}
                    </p>
                )}
                {selectedPiece.sold === false && selectedPiece.available === true ? (
                    <StripeBrandedButton url={'/checkout/' + selectedPiece.id} price={`${selectedPiece.price}`} text="Checkout" />
                ) : (
                    <div className="h-9 text-xl font-[600] text-red-800">{selectedPiece.sold ? 'Sold' : 'Not For Sale'}</div>
                )}
            </div>
        </motion.div>
    );
};

export default SelectedPieceView;
