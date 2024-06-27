'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';

import 'react-tooltip/dist/react-tooltip.css';
import { PiecesWithImages } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';
import StripeBrandedButton from '@/components/svg/StripeBrandedButton';

const Piece = React.lazy(() => import('./Piece'));

const DEFAULT_PIECE_WIDTH = 250;
const MOBILE_SCREEN_MAX_WIDTH = 500 + 40 + 60 + 30;
const INNER_MARGIN_WIDTH = 30;
const BORDER_MARGIN_WIDTH = 10;

const Gallery = ({ pieces }: { pieces: PiecesWithImages[] }) => {
    const {
        theme,
        filterMenuOpen,
        setFilterMenuOpen,
        pieceList,
        galleryPieces,
        selectedPieceIndex,
        setPieceList,
        setGalleryPieces,
        setSelectedPieceIndex,
    } = useGalleryStore((state) => ({
        theme: state.theme,
        filterMenuOpen: state.filterMenuOpen,
        setFilterMenuOpen: state.setFilterMenuOpen,
        pieceList: state.pieceList,
        galleryPieces: state.galleryPieces,
        selectedPieceIndex: state.selectedPieceIndex,
        setPieceList: state.setPieceList,
        setGalleryPieces: state.setGalleryPieces,
        setSelectedPieceIndex: state.setSelectedPieceIndex,
    }));

    const [fullScreenImage, setFullScreenImage] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoadStates, setImageLoadStates] = useState<{ [key: number]: boolean }>({});

    let windowWidth = 0;
    let windowHeight = 0;

    useEffect(() => {
        setPieceList(pieces);
    }, [pieces]);

    useEffect(() => {
        const handleResize = () => {
            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;
            createGallery(pieceList, theme);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [theme, pieceList]);

    const selectedImageRef = useRef<HTMLDivElement>(null);

    const handlePieceClick = (index: number) => {
        console.log('Handle Piece Click:', index);
        setCurrentImageIndex(0);
        setSelectedPieceIndex(index);
        setImageLoadStates({}); // Reset all image load states

        // Use setTimeout to ensure the DOM has updated before scrolling
        setTimeout(() => {
            selectedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleImageChange = (direction: 'next' | 'prev') => {
        setIsImageChanging(true);
        setTimeout(() => {
            if (direction === 'next') {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageList.length);
            } else {
                setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageList.length) % imageList.length);
            }
        }, 300);
    };

    const handleImageLoad = () => {
        setImageLoadStates((prev) => ({ ...prev, [currentImageIndex]: true }));
        setIsImageChanging(false);
    };

    const gallery_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && windowWidth < 768) {
            setFilterMenuOpen(false);
        }
    };

    const createGallery = async (piece_list: PiecesWithImages[], selected_theme: string) => {
        const piece_list_length = piece_list.length;

        if (!piece_list || piece_list.length < 1) {
            console.error(`Cannot create gallery, passed piece_list invalid.`);
            return;
        }

        if (windowWidth === undefined) {
            console.error(`Cannot create gallery, windowWidth invalid.`);
            return;
        }
        if (windowHeight === undefined) {
            console.error(`Cannot create gallery, windowHeight invalid.`);
            return;
        }

        const column_bottom_list: number[] = [];

        const piece_width = windowWidth < MOBILE_SCREEN_MAX_WIDTH ? (windowWidth - 40 - 60 - 20) / 2 : DEFAULT_PIECE_WIDTH;
        const max_columns = Math.trunc(windowWidth / (piece_width + BORDER_MARGIN_WIDTH * 2 + INNER_MARGIN_WIDTH));

        let gallery_width = (piece_width + BORDER_MARGIN_WIDTH * 2) * max_columns + 10 * max_columns;
        if (max_columns < 3) gallery_width -= 20;

        const leftover_width = windowWidth - gallery_width;
        const margin = leftover_width / 2;

        let [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH];
        let [row, col] = [0, 0];

        let row_starting_height = INNER_MARGIN_WIDTH;
        let skip_col = false;

        setGalleryPieces(() => []);

        let i = 0;
        while (i < piece_list_length) {
            const current_piece_json = piece_list[i];

            const piece_theme = current_piece_json.theme || 'None';
            const piece_sold = current_piece_json.sold || false;
            const piece_available = current_piece_json.available || false;

            if (selected_theme !== 'None' && selected_theme) {
                if (selected_theme === 'Available') {
                    if (piece_sold || !piece_available) {
                        i += 1;
                        continue;
                    }
                } else {
                    if (!piece_theme.includes(selected_theme)) {
                        i += 1;
                        continue;
                    }
                }
            }

            const id = current_piece_json.id || 1;
            const o_id = current_piece_json.o_id?.toString() || 'None';
            const class_name = current_piece_json.class_name || 'None';
            const image_path = current_piece_json.image_path || 'None';
            const title = current_piece_json.title || 'None';
            const description = current_piece_json.description || 'None';
            const [width, height] = [current_piece_json.width || 0, current_piece_json.height || 0];

            const scaled_width = piece_width;
            const scaled_height = (piece_width / width) * height;

            const real_i = row * max_columns + col;
            const index = real_i % max_columns;

            if (row > 0) cur_y = column_bottom_list[index];
            else column_bottom_list.push(INNER_MARGIN_WIDTH);

            if (col === 0) {
                row_starting_height = column_bottom_list[index] + INNER_MARGIN_WIDTH;
                skip_col = row_starting_height > column_bottom_list[index + 1] + INNER_MARGIN_WIDTH;
            } else {
                skip_col = cur_y > row_starting_height;
            }

            if (skip_col) {
                if (col < max_columns - 1) {
                    col += 1;
                    cur_x += piece_width + INNER_MARGIN_WIDTH;
                } else {
                    [row, col] = [row + 1, 0];
                    [cur_x, cur_y] = [margin, 0];
                }
            } else {
                column_bottom_list[index] = column_bottom_list[index] + scaled_height + INNER_MARGIN_WIDTH;

                const dimensions: [number, number, number, number] = [cur_x, cur_y, scaled_width, scaled_height];

                setGalleryPieces((prevGalleryPieces) => [
                    ...prevGalleryPieces,
                    <Piece
                        key={id}
                        id={`${id}`}
                        o_id={o_id}
                        className={class_name}
                        image_path={image_path}
                        dimensions={dimensions}
                        title={title}
                        sold={piece_sold}
                        available={piece_available}
                        index={i}
                        handlePieceClick={handlePieceClick}
                    />,
                ]);

                if (col < max_columns - 1) {
                    cur_x += scaled_width + INNER_MARGIN_WIDTH;
                    col += 1;
                } else {
                    [row, col] = [row + 1, 0];
                    [cur_x, cur_y] = [margin, 0];
                }
                i += 1;
            }
        }

        let lowestHeight = 0;
        for (let i = 0; i < column_bottom_list.length; i++) {
            if (column_bottom_list[i] > lowestHeight) lowestHeight = column_bottom_list[i];
        }
    };

    const selectedPiece = selectedPieceIndex !== null ? pieceList[selectedPieceIndex] : null;

    const imageList = selectedPiece
        ? [
              {
                  src: selectedPiece.image_path,
                  width: selectedPiece.width,
                  height: selectedPiece.height,
              },
              ...(selectedPiece.extraImages || []).map((image) => ({
                  src: image.image_path,
                  width: image.width,
                  height: image.height,
              })),
              ...(selectedPiece.progressImages || []).map((image) => ({
                  src: image.image_path,
                  width: image.width,
                  height: image.height,
              })),
          ]
        : [];

    const [isImageChanging, setIsImageChanging] = useState(false);

    const handleNext = () => handleImageChange('next');
    const handlePrev = () => handleImageChange('prev');

    const handlePanEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
        if (Math.abs(offset.y) < Math.abs(offset.x)) {
            if (offset.x > 100 || velocity.x > 1) {
                handlePrev();
            } else if (offset.x < -100 || velocity.x < -1) {
                handleNext();
            }
        }
    };

    const fadeVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    console.log(`Image list length: ${imageList.length}`);

    return (
        <>
            <div className={`flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-stone-300`} onClick={gallery_clicked}>
                {selectedPiece && (
                    <div className={`flex h-fit w-full flex-col items-center p-4 pb-0`} ref={selectedImageRef}>
                        <h1 className="font-cinzel pb-2 text-2xl font-bold text-primary">{selectedPiece.title}</h1>
                        <div className="relative flex w-fit cursor-pointer items-center justify-center space-y-2 pb-2">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${selectedPieceIndex}-${currentImageIndex}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: imageLoadStates[currentImageIndex] ? 1 : 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setFullScreenImage(true)}
                                    className="flex max-h-[50dvh] min-h-[50dvh] w-auto items-center justify-center rounded-md"
                                >
                                    <Image
                                        src={imageList[currentImageIndex].src}
                                        alt={selectedPiece.title}
                                        width={imageList[currentImageIndex].width}
                                        height={imageList[currentImageIndex].height}
                                        quality={80}
                                        className="max-h-[50dvh] min-h-[50dvh] w-auto rounded-md bg-secondary_dark object-contain p-1"
                                        onLoad={handleImageLoad}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {imageList.length > 1 && (
                            <div className="flex w-full items-center justify-center space-x-4 pb-1">
                                <button aria-label="Previous" onClick={handlePrev} className="">
                                    <IoIosArrowBack className="text-2xl hover:fill-primary" />
                                </button>
                                {imageList.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-4 w-4 rounded-full border-2 ${
                                            index === currentImageIndex
                                                ? 'border-secondary_dark bg-primary'
                                                : 'border-primary bg-secondary_dark'
                                        }`}
                                    ></div>
                                ))}
                                <button aria-label="Next" onClick={handleNext} className="">
                                    <IoIosArrowForward className="text-2xl hover:fill-primary" />
                                </button>
                            </div>
                        )}
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
                                <div className="text-xl font-[600] text-red-800">{selectedPiece.sold ? 'Sold' : 'Not For Sale'}</div>
                            )}
                        </div>
                    </div>
                )}
                <div className="flex h-fit w-full">
                    <div className="relative h-fit w-full">
                        <div style={{ height: 'auto' }}>{galleryPieces}</div>
                    </div>
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
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImageIndex}
                                src={imageList[currentImageIndex].src}
                                alt={selectedPiece.title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="max-h-[90vh] max-w-[90vw] object-contain"
                                onPanEnd={handlePanEnd}
                            />
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Gallery;
