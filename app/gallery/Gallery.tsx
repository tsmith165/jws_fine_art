'use client';

import React, { useState, useEffect } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Pieces } from '@/db/schema';

import useGalleryStore from '@/stores/gallery_store';

import Piece from './Piece';
import FilterMenu from './FilterMenu';

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
            console.log(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
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
        console.log('Checking theme change...');
        if (state.window_width && state.window_height) {
            createGallery(state.piece_list, theme);
        }
    }, [theme, state.window_width, state.window_height, state.piece_list]);

    const createGallery = async (piece_list: Pieces[], selected_theme: string) => {
        console.log('Begin create gallery');
        const piece_list_length = piece_list.length;

        if (piece_list == null || piece_list.length < 1) {
            console.error(
                `Cannot create gallery, passed piece_list invalid.  Width: ${state.window_width == undefined ? null : state.window_width}`,
            );
        }
        console.log(`Passed piece_list length: ${piece_list_length}`);

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
        console.log(`Window Width: ${state.window_width} | Window height: ${state.window_height}`);

        var gallery_pieces: JSX.Element[] = [];
        var column_bottom_list: number[] = [];
        var lowest_height = 0;

        // Calculate piece width and max columns based on window width
        var piece_width = state.window_width < MOBILE_SCREEN_MAX_WIDTH ? (state.window_width - 40 - 60 - 20) / 2 : DEFAULT_PIECE_WIDTH;
        var max_columns = Math.trunc(state.window_width / (piece_width + BORDER_MARGIN_WIDTH * 2 + INNER_MARGIN_WIDTH));

        console.log(`PIECE WIDTH: ${piece_width} | MAX COLUMNS: ${max_columns}`);

        // Calculate width of one row of images
        var gallery_width = (piece_width + BORDER_MARGIN_WIDTH * 2) * max_columns + 10 * max_columns;
        if (max_columns < 3) gallery_width -= 20;

        var leftover_width = state.window_width - gallery_width; // Leftover width for margins
        var margin = leftover_width / 2; // Margin width for left and right

        var [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH]; // Initial X / Y Coords
        var [row, col] = [0, 0]; // Initial Row / Col

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
                        // Skipping piece as it is sold
                        i += 1;
                        continue;
                    }
                    if (!piece_available) {
                        // Skipping piece as it is not available
                        i += 1;
                        continue;
                    }
                } else {
                    if (piece_theme !== undefined && !piece_theme.includes(selected_theme)) {
                        // Skipping piece as it does not match theme
                        i += 1;
                        continue;
                    }
                }
            }

            var o_id = current_piece_json.o_id ? current_piece_json.o_id.toString() : 'None';
            var class_name = current_piece_json.class_name ? current_piece_json.class_name : 'None';
            var image_path = current_piece_json.image_path ? current_piece_json.image_path : 'None';
            var title = current_piece_json.title ? current_piece_json.title : 'None';
            var description = current_piece_json.description ? current_piece_json.description : 'None';
            var sold = current_piece_json.sold ? current_piece_json.sold : false;
            var available = current_piece_json.available !== undefined ? current_piece_json.available : false;
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
                // Y from last row intercepts current row.  Skipping column...
                skip_col = cur_y > row_starting_height ? true : false;
            }

            if (skip_col == true) {
                // Skipping column since it would collide with previous row
                if (col < max_columns - 1) {
                    // set next x coord at end of current piece
                    col += 1;
                    cur_x += piece_width + INNER_MARGIN_WIDTH;
                } else {
                    // Reset row / col / cur_x / cur_y to move to next row
                    [row, col] = [row + 1, 0];
                    [cur_x, cur_y] = [margin, 0];
                }
            } else if (skip_col == false) {
                // Generate dimensions and create Piece component
                column_bottom_list[index] = column_bottom_list[index] + scaled_height + INNER_MARGIN_WIDTH; // Current bottom

                var dimensions: [number, number, number, number] = [cur_x, cur_y, scaled_width, scaled_height];

                gallery_pieces.push(
                    <Piece
                        key={i}
                        id={`piece-${i}`}
                        o_id={o_id}
                        className={class_name}
                        image_path={image_path}
                        dimensions={dimensions}
                        title={title}
                        sold={sold}
                        available={available || true}
                    />,
                );

                if (col < max_columns - 1) {
                    // set next x coord at end of current piece
                    cur_x += scaled_width + INNER_MARGIN_WIDTH;
                    col += 1;
                } else {
                    // Reset row / col / cur_x / cur_y to move to next row
                    [row, col] = [row + 1, 0];
                    [cur_x, cur_y] = [margin, 0];
                }
                i += 1;
            }
        }

        for (var i = 0; i < column_bottom_list.length; i++) {
            if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
        }
        if (state.window_width < 600) lowest_height = lowest_height + 60;

        console.log(`Create gallery complete.  Pieces: `, gallery_pieces);

        setState((prevState) => ({
            ...prevState,
            piece_list: piece_list,
            gallery_pieces: gallery_pieces,
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
            <div className={`max-h-full min-h-full min-w-full max-w-full bg-secondary_dark`}>
                <div
                    className={`relative !max-h-[calc(100vh-80px)] w-full overflow-y-auto overflow-x-hidden bg-secondary_dark`}
                    onClick={(e) => {
                        gallery_clicked(e);
                    }}
                >
                    <div className={`max-h-full w-full`} style={{ height: state.lowest_height }}>
                        {state.gallery_pieces}
                    </div>
                </div>
            </div>

            <FilterMenu />
        </>
    );
};

export default Gallery;
