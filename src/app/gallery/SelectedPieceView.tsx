import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
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
}) => {
    return (
        <div className={`flex h-fit w-full flex-col items-center p-4 pb-0`} ref={selectedImageRef}>
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
        </div>
    );
};

export default SelectedPieceView;
