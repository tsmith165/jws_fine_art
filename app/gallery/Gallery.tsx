'use client';

import React, { useState, useEffect, Suspense } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Pieces } from '@/db/schema';
import useGalleryStore from '@/stores/gallery_store';
import FilterMenu from './FilterMenu';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
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
    gallery_loaded: boolean;
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
        gallery_loaded: false,
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
            createGallery(state.piece_list, theme);
        }
    }, [theme, state.window_width, state.window_height, state.piece_list]);

    const createGallery = async (piece_list: Pieces[], selected_theme: string) => {
        const piece_list_length = piece_list.length;

        if (piece_list == null || piece_list.length < 1) {
            console.error(
                `Cannot create gallery, passed piece_list invalid.  Width: ${state.window_width == undefined ? null : state.window_width}`,
            );
        }

        if (state.window_width == undefined) {
            console.error(
                `Cannot create gallery, state.window_width invalid.  Value: ${state.window_width == undefined ? null : state.window_width}`,
            );
        }
        if (state.window_height == undefined) {
            console.error(
                `Cannot create gallery, state.window_height invalid.  Value: ${
                    state.window_width == undefined ? null : state.window_width
                }`,
            );
        }

        var gallery_pieces: JSX.Element[] = [];
        var column_bottom_list: number[] = [];
        var lowest_height = 0;

        var piece_width = state.window_width < MOBILE_SCREEN_MAX_WIDTH ? (state.window_width - 40 - 60 - 20) / 2 : DEFAULT_PIECE_WIDTH;
        var max_columns = Math.trunc(state.window_width / (piece_width + BORDER_MARGIN_WIDTH * 2 + INNER_MARGIN_WIDTH));

        var gallery_width = (piece_width + BORDER_MARGIN_WIDTH * 2) * max_columns + 10 * max_columns;
        if (max_columns < 3) gallery_width -= 20;

        var leftover_width = state.window_width - gallery_width;
        var margin = leftover_width / 2;

        var [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH];
        var [row, col] = [0, 0];

        var row_starting_height = INNER_MARGIN_WIDTH;
        var skip_col = false;

        var i = 0;
        var real_i = 0;
        while (i < piece_list_length) {
            var current_piece_json = piece_list[i];

            var piece_theme = current_piece_json.theme ? current_piece_json.theme : 'None';
            var piece_sold = current_piece_json.sold ? current_piece_json.sold : false;
            var piece_available = current_piece_json.available ? current_piece_json.available : false;

            if (selected_theme != 'None' && selected_theme != undefined && selected_theme != null) {
                if (selected_theme == 'Available') {
                    if (piece_sold) {
                        i += 1;
                        continue;
                    }
                    if (!piece_available) {
                        i += 1;
                        continue;
                    }
                } else {
                    if (piece_theme !== undefined && !piece_theme.includes(selected_theme)) {
                        i += 1;
                        continue;
                    }
                }
            }

            var id = current_piece_json.id ? current_piece_json.id : 1;
            var o_id = current_piece_json.o_id ? current_piece_json.o_id.toString() : 'None';
            var class_name = current_piece_json.class_name ? current_piece_json.class_name : 'None';
            var image_path = current_piece_json.image_path ? current_piece_json.image_path : 'None';
            var title = current_piece_json.title ? current_piece_json.title : 'None';
            var description = current_piece_json.description ? current_piece_json.description : 'None';
            var [width, height] =
                current_piece_json.width !== undefined && current_piece_json.height !== undefined
                    ? [current_piece_json.width, current_piece_json.height]
                    : [0, 0];

            var [scaled_width, scaled_height] = [piece_width, height];
            scaled_height = (piece_width / width) * height;

            real_i = row * max_columns + col;
            var index = real_i % max_columns;

            if (row > 0) cur_y = column_bottom_list[index];
            else column_bottom_list.push(INNER_MARGIN_WIDTH);

            if (col == 0) {
                row_starting_height = column_bottom_list[index] + INNER_MARGIN_WIDTH;
                skip_col = row_starting_height > column_bottom_list[index + 1] + INNER_MARGIN_WIDTH ? true : false;
            } else {
                skip_col = cur_y > row_starting_height ? true : false;
            }

            if (skip_col == true) {
                if (col < max_columns - 1) {
                    col += 1;
                    cur_x += piece_width + INNER_MARGIN_WIDTH;
                } else {
                    [row, col] = [row + 1, 0];
                    [cur_x, cur_y] = [margin, 0];
                }
            } else if (skip_col == false) {
                column_bottom_list[index] = column_bottom_list[index] + scaled_height + INNER_MARGIN_WIDTH;

                var dimensions: [number, number, number, number] = [cur_x, cur_y, scaled_width, scaled_height];

                gallery_pieces.push(
                    <Piece
                        key={i}
                        id={`${id}`}
                        o_id={o_id}
                        className={class_name}
                        image_path={image_path}
                        dimensions={dimensions}
                        title={title}
                        sold={piece_sold}
                        available={piece_available ? true : false}
                    />,
                );

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

        for (var i = 0; i < column_bottom_list.length; i++) {
            if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
        }
        if (state.window_width < 600) lowest_height = lowest_height + 20;

        setState((prevState) => ({
            ...prevState,
            piece_list: piece_list,
            gallery_pieces: gallery_pieces,
            lowest_height: lowest_height,
            gallery_loaded: true,
        }));
    };

    const gallery_clicked = (e: React.MouseEvent) => {
        if (filterMenuOpen && state.window_width < 768) {
            setFilterMenuOpen(false);
        }
    };

    if (!state.gallery_loaded) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div
                className={`relative !max-h-[calc(100vh-80px)] w-full overflow-y-auto overflow-x-hidden bg-secondary_dark`}
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
