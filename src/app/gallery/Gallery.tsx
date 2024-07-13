'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Masonry from 'react-masonry-css';
import 'react-tooltip/dist/react-tooltip.css';
import { PiecesWithImages } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';
import FullScreenView from './FullScreenView';
import SelectedPieceView from './SelectedPieceView';
import GalleryPiece from './GalleryPiece';
import { motion } from 'framer-motion';

interface GalleryProps {
    initialPieces: PiecesWithImages[];
}

const Gallery: React.FC<GalleryProps> = ({ initialPieces }) => {
    const searchParams = useSearchParams();

    const {
        theme,
        filterMenuOpen,
        setFilterMenuOpen,
        pieceList,
        galleryPieces,
        setPieceList,
        setGalleryPieces,
        selectedPieceIndex,
        setSelectedPieceIndex,
    } = useGalleryStore((state) => ({
        theme: state.theme,
        filterMenuOpen: state.filterMenuOpen,
        setFilterMenuOpen: state.setFilterMenuOpen,
        pieceList: state.pieceList,
        galleryPieces: state.galleryPieces,
        setPieceList: state.setPieceList,
        setGalleryPieces: state.setGalleryPieces,
        selectedPieceIndex: state.selectedPieceIndex,
        setSelectedPieceIndex: state.setSelectedPieceIndex,
    }));

    const [isMasonryLoaded, setIsMasonryLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});

    const selectedPiece = selectedPieceIndex !== null ? pieceList[selectedPieceIndex] : null;
    const selectedImageRef = useRef<HTMLDivElement>(null);

    const imageList = selectedPiece
        ? [
              {
                  src: selectedPiece.small_image_path || selectedPiece.image_path,
                  width: selectedPiece.small_width || selectedPiece.width,
                  height: selectedPiece.small_height || selectedPiece.height,
              },
              ...(selectedPiece.extraImages || []).map((image) => ({
                  src: image.small_image_path || image.image_path,
                  width: image.small_width || image.width,
                  height: image.small_height || image.height,
              })),
              ...(selectedPiece.progressImages || []).map((image) => ({
                  src: image.small_image_path || image.image_path,
                  width: image.small_width || image.width,
                  height: image.small_height || image.height,
              })),
          ]
        : [];

    useEffect(() => {
        setPieceList(initialPieces);
    }, [initialPieces, setPieceList]);

    useEffect(() => {
        const selectedPieceId = searchParams.get('piece');
        if (pieceList.length > 0 && selectedPieceId) {
            const index = pieceList.findIndex((piece) => piece.id.toString() === selectedPieceId);
            setSelectedPieceIndex(index !== -1 ? index : null);
        }
    }, [pieceList, searchParams, setSelectedPieceIndex]);

    const createGallery = useCallback(() => {
        console.log(`createGallery called - theme: ${theme} | pieceList.length: ${pieceList.length}`);

        const filteredPieces = pieceList.filter((piece) => {
            const piece_theme = piece.theme || 'None';
            const piece_sold = piece.sold || false;
            const piece_available = piece.available || false;

            if (theme !== 'None' && theme) {
                if (theme === 'Available') {
                    return !piece_sold && piece_available;
                } else {
                    return piece_theme.includes(theme);
                }
            }
            return true;
        });

        const newGalleryPieces = filteredPieces.map((piece, index) => (
            <GalleryPiece key={`piece-${piece.id}`} piece={{ ...piece, index }} handlePieceClick={handlePieceClick} />
        ));

        setGalleryPieces(() => newGalleryPieces);
    }, [pieceList, theme, setGalleryPieces]);

    useEffect(() => {
        if (pieceList.length > 0) {
            createGallery();
            setIsMasonryLoaded(true);
        }
    }, [pieceList, theme, createGallery]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && imageList.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            }, speed);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [speed, isPlaying, imageList.length]);

    const handlePieceClick = useCallback(
        (id: number, index: number) => {
            if (selectedPieceIndex === index) {
                selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
            setCurrentImageIndex(0);
            setSelectedPieceIndex(index);

            // Update URL without triggering a page reload
            const newUrl = `/gallery?piece=${id}`;
            window.history.pushState({}, '', newUrl);

            setImageLoadStates({});
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        [selectedPieceIndex, setSelectedPieceIndex],
    );

    const gallery_clicked = useCallback(
        (e: React.MouseEvent) => {
            if (filterMenuOpen && window.innerWidth < 768) {
                setFilterMenuOpen(false);
            }
        },
        [filterMenuOpen, setFilterMenuOpen],
    );

    const handleImageLoad = useCallback(() => {
        setImageLoadStates((prevLoadStates) => ({
            ...prevLoadStates,
            [currentImageIndex]: true,
        }));
    }, [currentImageIndex]);

    const handleNext = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
    }, [imageList.length]);

    const handlePrev = useCallback(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
    }, [imageList.length]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying((prevState) => !prevState);
    }, []);

    return (
        <>
            <motion.div
                className={`flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-stone-900`}
                onClick={gallery_clicked}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
            >
                {selectedPiece && (
                    <SelectedPieceView
                        selectedPiece={selectedPiece}
                        currentImageIndex={currentImageIndex}
                        imageList={imageList}
                        imageLoadStates={imageLoadStates}
                        handleImageLoad={handleImageLoad}
                        setIsFullScreenImage={setIsFullScreenImage}
                        selectedPieceIndex={selectedPieceIndex}
                        selectedImageRef={selectedImageRef}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        togglePlayPause={togglePlayPause}
                        isPlaying={isPlaying}
                        speed={speed}
                        setSpeed={setSpeed}
                    />
                )}
                <motion.div
                    className={`flex h-fit w-full px-8 ${selectedPiece ? 'py-4 md:py-8' : 'py-8'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <Masonry
                        breakpointCols={{
                            default: 5,
                            1500: 4,
                            1100: 3,
                            700: 2,
                            300: 1,
                        }}
                        className="my-masonry-grid w-full"
                        columnClassName="my-masonry-grid_column"
                    >
                        {galleryPieces}
                    </Masonry>
                </motion.div>
            </motion.div>
            <FilterMenu />
            {isFullScreenImage && selectedPiece && (
                <FullScreenView
                    selectedPiece={selectedPiece}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setIsFullScreenImage={setIsFullScreenImage}
                    selectedPieceIndex={selectedPieceIndex}
                    setSpeed={setSpeed}
                    speed={speed}
                />
            )}
        </>
    );
};

export default Gallery;
