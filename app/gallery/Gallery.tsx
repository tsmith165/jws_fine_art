'use client';

import React, { useState, useEffect, Suspense } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Pieces } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';

const Piece = React.lazy(() => import('./Piece'));

const DEFAULT_PIECE_WIDTH = 250;
const MOBILE_SCREEN_MAX_WIDTH = 500 + 40 + 60 + 30;
const INNER_MARGIN_WIDTH = 30;
const BORDER_MARGIN_WIDTH = 10;

interface GalleryState {
    window_width: number;
    window_height: number;
    piece_list: Pieces[];
    gallery_pieces: JSX.Element[];
    lowest_height: number;
}

const Gallery = ({ pieces }: { pieces: Pieces[] }) => {
    const { theme, filterMenuOpen, setFilterMenuOpen } = useGalleryStore((state) => ({
        theme: state.theme,
        filterMenuOpen: state.filterMenuOpen,
        setFilterMenuOpen: state.setFilterMenuOpen,
    }));

    const [state, setState] = useState<GalleryState>({
        window_width: 0,
        window_height: 0,
        piece_list: pieces,
        gallery_pieces: [],
        lowest_height: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setState((prevState) => ({
                ...prevState,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            }));
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (state.window_width && state.window_height) {
            createGallery(pieces, theme);
        }
    }, [theme, state.window_width, state.window_height, pieces]);

    const createGallery = async (piece_list: Pieces[], selected_theme: string) => {
        const piece_list_length = piece_list.length;

        if (!piece_list || piece_list.length < 1) {
            console.error(`Cannot create gallery, passed piece_list invalid.`);
            return;
        }

        if (state.window_width === undefined) {
            console.error(`Cannot create gallery, state.window_width invalid.`);
            return;
        }
        if (state.window_height === undefined) {
            console.error(`Cannot create gallery, state.window_height invalid.`);
            return;
        }

        const column_bottom_list: number[] = [];
        let lowest_height = 0;

        const piece_width = state.window_width < MOBILE_SCREEN_MAX_WIDTH ? (state.window_width - 40 - 60 - 20) / 2 : DEFAULT_PIECE_WIDTH;
        const max_columns = Math.trunc(state.window_width / (piece_width + BORDER_MARGIN_WIDTH * 2 + INNER_MARGIN_WIDTH));

        let gallery_width = (piece_width + BORDER_MARGIN_WIDTH * 2) * max_columns + 10 * max_columns;
        if (max_columns < 3) gallery_width -= 20;

        const leftover_width = state.window_width - gallery_width;
        const margin = leftover_width / 2;

        let [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH];
        let [row, col] = [0, 0];

        let row_starting_height = INNER_MARGIN_WIDTH;
        let skip_col = false;

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

                setState((prevState) => ({
                    ...prevState,
                    gallery_pieces: [
                        ...prevState.gallery_pieces,
                        <Piece
                            key={i}
                            id={`${id}`}
                            o_id={o_id}
                            className={class_name}
                            image_path={image_path}
                            dimensions={dimensions}
                            title={title}
                            sold={piece_sold}
                            available={piece_available}
                        />,
                    ],
                }));

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

        for (let i = 0; i < column_bottom_list.length; i++) {
            if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
        }
        if (state.window_width < 600) lowest_height = lowest_height + 20;

        setState((prevState) => ({
            ...prevState,
            lowest_height: lowest_height,
        }));
    };

    const gallery_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && state.window_width < 768) {
            setFilterMenuOpen(false);
        }
    };

    return (
        <>
            <div
                className={`relative !h-[calc(100vh-80px)] w-full overflow-y-auto overflow-x-hidden bg-secondary_dark`}
                onClick={(e) => {
                    gallery_clicked(e);
                }}
            >
                <div style={{ height: state.lowest_height }}>{state.gallery_pieces}</div>
            </div>
            <FilterMenu />
        </>
    );
};

export default Gallery;
