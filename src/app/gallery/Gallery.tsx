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
import FullScreenView from './FullScreenView';
import SelectedPieceView from './SelectedPieceView';

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
            <Image
                src={piece.image_path}
                alt={piece.title}
                width={300}
                height={200}
                className="h-auto w-full rounded-lg bg-stone-600 object-cover p-1"
                priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{piece.title}</p>
            </div>
        </div>
    );
};

interface MasonryGalleryProps {
    galleryPieces: JSX.Element[];
    selectedPiece: PiecesWithImages | null;
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ galleryPieces, selectedPiece }) => {
    return (
        <div className={`flex h-fit w-full px-8 ${selectedPiece ? 'py-4 md:py-8' : 'py-8'}`}>
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
                    <SelectedPieceView
                        selectedPiece={selectedPiece}
                        currentImageIndex={currentImageIndex}
                        imageList={imageList}
                        imageLoadStates={imageLoadStates}
                        handleImageLoad={handleImageLoad}
                        setFullScreenImage={setFullScreenImage}
                        selectedPieceIndex={selectedPieceIndex}
                        selectedImageRef={selectedImageRef}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        togglePlayPause={togglePlayPause}
                        isPlaying={isPlaying}
                    />
                )}
                <MasonryGallery galleryPieces={galleryPieces} selectedPiece={selectedPiece} />
            </div>
            <FilterMenu />
            {fullScreenImage && selectedPiece && (
                <FullScreenView
                    selectedPiece={selectedPiece}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    imageList={imageList}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    setFullScreenImage={setFullScreenImage}
                    selectedPieceIndex={selectedPieceIndex}
                />
            )}
        </>
    );
};

export default Gallery;
