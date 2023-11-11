'use client';

import { useAnalytics } from '@/lib/useAnalytics';
import logger from '@/lib/logger';
import React, { useState, useEffect, useContext } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import AppContext from '@/contexts/AppContext';
import styles from '@/styles/pages/Gallery.module.scss';
import Piece from './Piece';

const DEFAULT_PIECE_WIDTH = 250;
const MOBILE_SCREEN_MAX_WIDTH = 500 + 40 + 60 + 30;
const INNER_MARGIN_WIDTH = 30;
const BORDER_MARGIN_WIDTH = 10;

const Gallery = (props) => {
    useAnalytics();
    const { appState, setAppState } = useContext(AppContext);

    const [state, setState] = useState({
        filter_menu_open: false,
        window_width: null,
        window_height: null,
        piece_list: props.piece_list,
        gallery_pieces: [],
        lowest_height: 0,
        theme: 'None',
        fade_in_visible: true
    });

    useEffect(() => {
        const handleResize = () => {
            logger.debug(`Window Width: ${window.innerWidth} | Height: ${window.innerHeight}`);
            setState(prevState => ({
                ...prevState,
                window_width: window.innerWidth,
                window_height: window.innerHeight,
            }));
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        console.log("Checking theme change...");
        if (state.window_width && state.window_height) {
            createGallery(state.piece_list, appState.theme);
        }
    }, [state.theme, appState.theme, state.window_width, state.window_height]);

    const createGallery = async (piece_list, theme) => {
        console.log("Begin create gallery")
        const piece_list_length = piece_list.length

        if (piece_list == null || piece_list.length < 1) {
            logger.error(`Cannot create gallery, passed piece_list invalid.  Width: ${(state.window_width == undefined) ? null : state.window_width}`)
        }
        logger.debug(`Passed piece_list length: ${piece_list_length}`)

        if (state.window_width == undefined) {
            logger.error(`Cannot create gallery, state.window_width invalid.  Value: ${(state.window_width == undefined) ? null : state.window_width}`)
        }
        if (state.window_height == undefined) {
            logger.error(`Cannot create gallery, state.window_height invalid.  Value: ${(state.window_width == undefined) ? null : state.window_width}`)
        }
        logger.debug(`Window Width: ${state.window_width} | Window height: ${state.window_height}`)

        var gallery_pieces = [];
        var column_bottom_list = [];
        var lowest_height = 0;

        // Calculate piece width and max columns based on window width
        var piece_width = (state.window_width < MOBILE_SCREEN_MAX_WIDTH) ? (state.window_width - 40 - 60 - 20) / 2 : DEFAULT_PIECE_WIDTH;
        var max_columns = Math.trunc(state.window_width / (piece_width + (BORDER_MARGIN_WIDTH * 2) + INNER_MARGIN_WIDTH));

        console.log(`PIECE WIDTH: ${piece_width} | MAX COLUMNS: ${max_columns}`)

        // Calculate width of one row of images
        var gallery_width = ((piece_width + (BORDER_MARGIN_WIDTH * 2)) * max_columns) + (10 * max_columns);
        if (max_columns < 3) gallery_width -= 20;

        var leftover_width = state.window_width - gallery_width; // Leftover width for margins
        var margin = leftover_width / 2; // Margin width for left and right

        var [cur_x, cur_y] = [margin, INNER_MARGIN_WIDTH]; // Initial X / Y Coords
        var [row, col] = [0, 0]; // Initial Row / Col

        var row_starting_height = INNER_MARGIN_WIDTH;
        var skip_col = false;

        // logger.debug(`Creating gallery with piece_list length: ${piece_list_length} | Data (Next Line):`)
        // logger.debug(piece_list)

        var i = 0; var real_i = 0;
        while (i < piece_list_length) {
            var current_piece_json = piece_list[i];
            // logger.debug(current_piece_json)

            var piece_theme = (current_piece_json['theme'] !== undefined) ? ((current_piece_json['theme'] != null) ? current_piece_json['theme'] : 'None') : 'None';
            var piece_sold = (current_piece_json['sold'] !== undefined) ? ((current_piece_json['sold'] != null) ? current_piece_json['sold'] : false) : false;
            var piece_available = (current_piece_json['available'] !== undefined) ? ((current_piece_json['available'] != null) ? current_piece_json['available'] : false) : false;
            // logger.extra(`Current piece theme: ${piece_theme} | State theme: ${theme}`)
            if (theme != 'None' && theme != undefined && theme != null) {
                if (theme == 'Available') {
                    if (piece_sold) { // Skipping piece as it is sold
                        i += 1;
                        continue;
                    }
                    if (!piece_available) { // Skipping piece as it is not available
                        i += 1;
                        continue;
                    }
                } else {
                    if ((piece_theme !== undefined) && (!piece_theme.includes(appState.theme))) { // Skipping piece as it does not match theme
                        i += 1;
                        continue;
                    }
                }
            }

            var o_id = (current_piece_json['o_id'] !== undefined) ? current_piece_json['o_id'] : 'None';
            var class_name = (current_piece_json['class_name'] !== undefined) ? current_piece_json['class_name'] : 'None';
            var image_path = (current_piece_json['image_path'] !== undefined) ? current_piece_json['image_path'] : 'None';
            var title = (current_piece_json['title'] !== undefined) ? current_piece_json['title'] : 'None';
            var description = (current_piece_json['description'] !== undefined) ? current_piece_json['description'] : 'None';
            var sold = (current_piece_json['sold'] !== undefined) ? current_piece_json['sold'] : 'None';
            var available = (current_piece_json['available'] !== undefined) ? current_piece_json['available'] : 'None';
            var [width, height] = (current_piece_json['width'] !== undefined && current_piece_json['height'] !== undefined) ? [current_piece_json['width'], current_piece_json['height']] : 'None';

            var [scaled_width, scaled_height] = [piece_width, height];
            scaled_height = (piece_width / width) * height;

            real_i = (row * max_columns) + col;
            var index = real_i % max_columns;

            if (row > 0) cur_y = column_bottom_list[index];
            else column_bottom_list.push(INNER_MARGIN_WIDTH);

            if (col == 0) {
                row_starting_height = column_bottom_list[index] + INNER_MARGIN_WIDTH;
                skip_col = (row_starting_height > column_bottom_list[index + 1] + INNER_MARGIN_WIDTH) ? true : false;
            } else {
                // Y from last row intercepts current row.  Skipping column...
                skip_col = (cur_y > row_starting_height) ? true : false
            }

            if (skip_col == true) { // Skipping column since it would collide with previous row
                if (col < max_columns - 1) { // set next x coord at end of current piece
                    col += 1;
                    cur_x += piece_width + INNER_MARGIN_WIDTH;
                } else { // Reset row / col / cur_x / cur_y to move to next row
                    [row, col] = [(row + 1), 0];
                    [cur_x, cur_y] = [margin, 0];
                }
            }
            else if (skip_col == false) { // Generate dimensions and create Piece component
                column_bottom_list[index] = column_bottom_list[index] + scaled_height + INNER_MARGIN_WIDTH; // Current bottom

                var dimensions = [cur_x, cur_y, scaled_width, scaled_height];

                gallery_pieces.push(
                    <Piece key={i} id={`piece-${i}`} o_id={o_id}
                        className={class_name}
                        image_path={image_path}
                        dimensions={dimensions}
                        title={title}
                        description={description}
                        sold={sold}
                        available={available}
                    />
                );

                if (col < max_columns - 1) { // set next x coord at end of current piece
                    cur_x += scaled_width + INNER_MARGIN_WIDTH;
                    col += 1;
                } else { // Reset row / col / cur_x / cur_y to move to next row
                    [row, col] = [(row + 1), 0];
                    [cur_x, cur_y] = [margin, 0];
                }
                i += 1;
            }
        }

        for (var i = 0; i < column_bottom_list.length; i++) {
            if (column_bottom_list[i] > lowest_height) lowest_height = column_bottom_list[i];
        }
        if (state.window_width < 600) lowest_height = lowest_height + 60;

        console.log(`Create gallery complete.  Pieces: `, gallery_pieces)

        setState(prevState => ({
            ...prevState,
            piece_list: piece_list,
            gallery_pieces: gallery_pieces,
            lowest_height: lowest_height,
            fade_in_visible: false
        }));

        setTimeout(() => {
            setState(prevState => ({ ...prevState, fade_in_visible: false }));
        }, 1000);  // 2 seconds delay
    };

    return (
        <>
            {!state.fade_in_visible ? null : (<div className={`fixed top-[100px] left-0 right-0 bottom-0 bg-black z-50 animate-fade-out pointer-events-auto `}></div> )}
            <div className={`h-full bg-dark w-full`}>
                <div className={`relative max-h-[calc(100vh-100px)] w-full overflow-y-auto overflow-x-hidden bg-dark`} onClick={(e) => {
                    if (appState.filter_menu_open == true && state.window_width < 768) {
                        setAppState({ ...appState, filter_menu_open: false });
                    }
                }}>
                    <div className={`w-full`} style={{ height: state.lowest_height }}>
                        {state.gallery_pieces}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Gallery;
