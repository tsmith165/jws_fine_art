'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import 'react-tooltip/dist/react-tooltip.css';
import { PiecesWithImages } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';
import FullScreenView from './FullScreenView';
import SelectedPieceView from './SelectedPieceView';
import GalleryPiece from './GalleryPiece';
import { motion } from 'framer-motion';

interface GalleryPieceProps {
    piece: PiecesWithImages & { index: number };
    handlePieceClick: (id: number, index: number) => void;
}

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

    const [isMasonryLoaded, setIsMasonryLoaded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [speed, setSpeed] = useState(3000);
    const [isFullScreenImage, setIsFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});

    const selectedPiece = selectedPieceIndex !== null ? pieces[selectedPieceIndex] : null;
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
        setPieceList(pieces);
    }, [pieces]);

    useEffect(() => {
        if (pieceList.length > 0) {
            createGallery(pieceList, theme).then(() => {
                setTimeout(() => {
                    setIsMasonryLoaded(true);
                }, 500);
            });
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
            }, speed);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [speed, isPlaying, imageList]);

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

        setGalleryPieces((prevGalleryPieces) => [...prevGalleryPieces, ...newGalleryPieces]);
    };

    const gallery_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && window.innerWidth < 768) {
            setFilterMenuOpen(false);
        }
    };

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
        setImageLoadStates((prevLoadStates) => ({
            ...prevLoadStates,
            [currentImageIndex]: true,
        }));
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

    if (!isMasonryLoaded) {
        return (
            <div className="inset-0 flex h-full w-full items-center justify-center">
                <div className="relative flex h-[250px] w-[250px] items-center justify-center rounded-full bg-stone-900 p-6 opacity-70 xxs:h-[300px] xxs:w-[300px] xs:h-[350px] xs:w-[350px]">
                    <Image src="/logo/full_logo_small.png" alt="JWS Fine Art Logo" width={370} height={150} />
                </div>
            </div>
        );
    }

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
