import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { FaPlay, FaPause } from 'react-icons/fa';
import { PiecesWithImages } from '@/db/schema';

interface FullScreenViewProps {
    selectedPiece: PiecesWithImages | null;
    currentImageIndex: number;
    setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
    imageList: { src: string; width: number; height: number }[];
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    setFullScreenImage: (isFullScreen: boolean) => void;
    selectedPieceIndex: number | null;
}

const FullScreenView: React.FC<FullScreenViewProps> = ({
    selectedPiece,
    currentImageIndex,
    setCurrentImageIndex,
    imageList,
    isPlaying,
    setIsPlaying,
    setFullScreenImage,
    selectedPieceIndex,
}) => {
    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    };

    const togglePlayPause = () => {
        setIsPlaying((prevState) => !prevState);
    };

    return (
        <AnimatePresence>
            {selectedPiece && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setFullScreenImage(false)}
                >
                    <div className="relative flex h-full w-full items-center justify-center">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={`${selectedPieceIndex}-${currentImageIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="h-[80vh] w-[90vw]"
                            >
                                <motion.img
                                    src={imageList[currentImageIndex].src}
                                    alt={selectedPiece.title}
                                    className="h-full w-full object-contain"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="flex h-7 w-full items-center justify-center space-x-4">
                                <div className="flex w-full flex-row">
                                    <div className="flex w-full flex-grow"></div>
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
                                                    index === currentImageIndex
                                                        ? 'border-stone-600 bg-primary'
                                                        : 'border-primary bg-stone-600'
                                                }`}
                                            ></div>
                                        ))}
                                        {imageList.length > 1 && (
                                            <button aria-label="Next" onClick={handleNext} className="">
                                                <IoIosArrowForward className="text-2xl hover:fill-primary" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex w-full flex-grow">
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
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullScreenView;
