'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';
import { FaPlay, FaPause } from 'react-icons/fa';
import Masonry from 'react-masonry-css';

import 'react-tooltip/dist/react-tooltip.css';
import { PiecesWithImages } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';
import { FaP } from 'react-icons/fa6';

interface GalleryPieceProps {
    piece: PiecesWithImages & { index: number };
    handlePieceClick: (id: number, index: number) => void;
}

const GalleryPiece = ({ piece, handlePieceClick }: GalleryPieceProps) => {
    return (
        <div
            key={`piece-${piece.id}`}
            className="group relative cursor-pointer overflow-hidden rounded-lg bg-stone-600 shadow-md transition duration-300 ease-in-out hover:shadow-lg"
            onClick={() => handlePieceClick(piece.id, piece.index)}
        >
            <Image src={piece.image_path} alt={piece.title} width={300} height={200} className="h-auto w-full object-cover" priority />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{piece.title}</p>
            </div>
        </div>
    );
};

const Gallery = ({ pieces }: { pieces: PiecesWithImages[] }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);

    const { theme, filterMenuOpen, setFilterMenuOpen, pieceList, galleryPieces, setPieceList, setGalleryPieces } = useGalleryStore(
        (state) => ({
            theme: state.theme,
            filterMenuOpen: state.filterMenuOpen,
            setFilterMenuOpen: state.setFilterMenuOpen,
            pieceList: state.pieceList,
            galleryPieces: state.galleryPieces,
            setPieceList: state.setPieceList,
            setGalleryPieces: state.setGalleryPieces,
        }),
    );

    const [fullScreenImage, setFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});
    const [isPlaying, setIsPlaying] = useState(true);

    const selectedPiece = selectedPieceIndex !== null ? pieces[selectedPieceIndex] : null;
    const selectedImageRef = useRef<HTMLDivElement>(null);

    const imageList = selectedPiece
        ? [
              {
                  src: selectedPiece.image_path,
                  width: selectedPiece.width,
                  height: selectedPiece.height,
              },
              ...(selectedPiece.extraImages || []).map((image) => ({
                  key: `extra-${image.id}`,
                  src: image.image_path,
                  width: image.width,
                  height: image.height,
              })),
              ...(selectedPiece.progressImages || []).map((image) => ({
                  key: `progress-${image.id}`,
                  src: image.image_path,
                  width: image.width,
                  height: image.height,
              })),
          ]
        : [];

    useEffect(() => {
        setPieceList(pieces);
    }, [pieces]);

    useEffect(() => {
        if (pieceList.length > 0) {
            createGallery(pieceList, theme);
        }
    }, [pieceList, theme]);

    useEffect(() => {
        const selectedPieceId = searchParams.get('piece');
        const initialSelectedIndex = pieces.findIndex((piece) => piece.id.toString() === selectedPieceId);
        setSelectedPieceIndex(initialSelectedIndex !== -1 ? initialSelectedIndex : null);
    }, [pieces, searchParams]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            }, 3000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPlaying, imageList]);

    const handlePieceClick = (id: number, index: number) => {
        if (selectedPieceIndex === index) {
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }
        setCurrentImageIndex(0);
        setSelectedPieceIndex(index);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('piece', `${id}`);
        router.replace(`/gallery?${newSearchParams.toString()}`);
        setImageLoadStates({}); // Reset all image load states
        selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleImageLoad = () => {
        setImageLoadStates((prev) => ({ ...prev, [currentImageIndex]: true }));
    };

    const gallery_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && window.innerWidth < 768) {
            setFilterMenuOpen(false);
        }
    };

    const createGallery = async (piece_list: PiecesWithImages[], selected_theme: string) => {
        setGalleryPieces(() => []);

        const filteredPieces = piece_list.filter((piece) => {
            const piece_theme = piece.theme || 'None';
            const piece_sold = piece.sold || false;
            const piece_available = piece.available || false;

            if (selected_theme !== 'None' && selected_theme) {
                if (selected_theme === 'Available') {
                    return !piece_sold && piece_available;
                } else {
                    return piece_theme.includes(selected_theme);
                }
            }
            return true;
        });

        const newGalleryPieces = filteredPieces.map((piece, index) => (
            <GalleryPiece key={`piece-${piece.id}`} piece={{ ...piece, index }} handlePieceClick={handlePieceClick} />
        ));

        console.log('New Gallery Pieces:', newGalleryPieces);

        setGalleryPieces((prevGalleryPieces) => [...prevGalleryPieces, ...newGalleryPieces]);
    };
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
        <>
            <div className={`flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-stone-800`} onClick={gallery_clicked}>
                {selectedPiece && (
                    <div className={`flex h-fit w-full flex-col items-center p-4 pb-0`} ref={selectedImageRef}>
                        <h1 className="pb-2 font-cinzel text-2xl font-bold text-primary">{selectedPiece.title}</h1>
                        <div className="relative flex w-fit cursor-pointer items-center justify-center space-y-2 pb-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${selectedPieceIndex}-${currentImageIndex}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[currentImageIndex] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: fullScreenImage ? 0.5 : 0.3 }}
                                    onClick={() => setFullScreenImage(true)}
                                    className="flex max-h-[40dvh] min-h-[40dvh] w-auto items-center justify-center rounded-lg md:max-h-[50dvh] md:min-h-[50dvh]"
                                >
                                    {imageList.map((image, index) =>
                                        index === currentImageIndex ? (
                                            <motion.img
                                                key={`selected-${index}`}
                                                src={image.src}
                                                alt={selectedPiece.title}
                                                width={image.width}
                                                height={image.height}
                                                className="max-h-[40dvh] w-auto rounded-lg bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
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
                                                className="max-h-[40dvh] w-auto rounded-lg bg-stone-600 object-contain p-1 hover:cursor-pointer md:max-h-[50dvh] md:min-h-[50dvh]"
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
                                <StripeBrandedButton
                                    url={'/checkout/' + selectedPiece.id}
                                    price={`${selectedPiece.price}`}
                                    text="Checkout"
                                />
                            ) : (
                                <div className="h-9 text-xl font-[600] text-red-800">{selectedPiece.sold ? 'Sold' : 'Not For Sale'}</div>
                            )}
                        </div>
                    </div>
                )}
                <div className={`flex h-fit w-full px-8 ${selectedPiece ? 'py-8' : 'py-8'}`}>
                    <Masonry
                        breakpointCols={{
                            default: 5,
                            1500: 4,
                            1100: 3,
                            700: 2,
                            300: 1,
                        }}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {galleryPieces}
                    </Masonry>
                </div>
            </div>
            <FilterMenu />
            <AnimatePresence>
                {fullScreenImage && selectedPiece && (
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
                                    className="h-[90vh] w-[90vw]"
                                >
                                    <motion.img
                                        src={imageList[currentImageIndex].src}
                                        alt={selectedPiece.title}
                                        className="h-full w-full object-contain"
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {imageList.length > 1 && (
                                <>
                                    <button
                                        aria-label="Previous"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrev();
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
                                    >
                                        <IoIosArrowBack className="text-4xl text-white" />
                                    </button>
                                    <button
                                        aria-label="Next"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNext();
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-black bg-opacity-50 p-2"
                                    >
                                        <IoIosArrowForward className="text-4xl text-white" />
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Gallery;
