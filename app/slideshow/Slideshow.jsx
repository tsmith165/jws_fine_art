'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants';
import styles from '@/styles/pages/Slideshow.module.scss';

import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import SpeedIcon from '@mui/icons-material/Speed';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const RATIO_MIN = 0;
const RATIO_MAX = 1000;
const COLORED_QR_CODE = '/JWS_QR_CODE_GREEN_TAN.png';

function Slideshow(props) {
    const piece_list = props.piece_list;
    const piece_list_length = piece_list.length

    console.log(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`)
    console.log(piece_list)

    var image_array = [];

    var current_piece = null;
    var piece_position = 0;
    var piece_db_id = null;
    var piece_o_id = 0;

    var title = '';
    var type = '';
    var description = '';
    var sold = false;
    var price = 9999;
    var width = '';
    var height = '';
    var real_width = '';
    var real_height = '';
    var image_path = '';
    var instagram = '';

    if (piece_list_length > 0) {
        const current_piece = piece_list[piece_position]

        piece_db_id = (current_piece['id'] !== undefined) ? current_piece['id'] : ''
        piece_o_id = (current_piece['o_id'] !== undefined) ? current_piece['o_id'] : ''
        title = (current_piece['title'] !== undefined) ? current_piece['title'] : ''
        type = (current_piece['type'] !== undefined) ? current_piece['type'] : 'Oil On Canvas'
        sold = (current_piece['sold'] !== undefined) ? current_piece['sold'] : 'False'
        description = (current_piece['description'] !== undefined) ? current_piece['description'] : ''
        price = (current_piece['price'] !== undefined) ? current_piece['price'] : ''
        width = (current_piece['width'] !== undefined) ? current_piece['width'] : ''
        height = (current_piece['height'] !== undefined) ? current_piece['height'] : ''
        real_width = (current_piece['real_width'] !== undefined) ? current_piece['real_width'] : ''
        real_height = (current_piece['real_height'] !== undefined) ? current_piece['real_height'] : ''
        image_path = (current_piece['image_path'] !== undefined) ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}` : ''
        instagram = (current_piece['instagram'] !== undefined) ? current_piece['instagram'] : ''

        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push((
                <div key={`image_${i}`} className={(i == piece_position) ? styles.centered_image_container : styles.centered_image_container_hidden}>
                    <Image
                        className={styles.centered_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece['image_path']}`}
                        alt={piece['title']}
                        priority={(i > piece_position - 3 && i < piece_position + 3) ? true : false}
                        quality={100}
                        width={width}
                        height={height}
                    />
                </div>
            ))
        }
    }
    console.log("Initial image array: ", image_array)

    const base_speed = 80
    const ratioed_value = calculateRatioedValue(base_speed);
    console.log(`Ratioed Speed: ${ratioed_value}`)

    // Initial State
    const [state, setState] = useState({
        debug: false,
        loading: true,
        piece_list: piece_list,
        image_array: image_array,
        current_piece: current_piece,
        piece_position: piece_position,
        piece_db_id: piece_db_id,
        piece_o_id: piece_o_id,
        piece_details: {
            title: title,
            type: type,
            description: description,
            sold: sold,
            price: price,
            width: width,
            height: height,
            real_width: real_width,
            real_height: real_height,
            image_path: image_path,
            instagram: instagram,
        },
        next_oid: (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id'] : piece_list[piece_position + 1]['o_id'],
        last_oid: (piece_position - 1 < 0) ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'],
        running: true,
        speed_open: false,
        base_speed: base_speed,
        speed: ratioed_value * 10,
        timer: null
    });

    const timer_ref = useRef(null);
    const stateRef = useRef(state); // Initialize a reference to hold state

    // Always update the stateRef's current value whenever state changes
    useEffect(() => {
        stateRef.current = state;
    }, [state]);


    useEffect(() => { // componentDidMount (initial render)
        if (state.running) {
            timer_ref.current = setTimeout(() => {
                update_current_piece(state.piece_list, state.next_oid);
            }, state.speed);
        }

        return () => clearRunningTimeout();
    }, []); // Empty dependency list means this useEffect runs once after initial render

    // Clear the running timeout
    const clearRunningTimeout = () => {
        if (timer_ref.current) {
            clearTimeout(timer_ref.current);
            timer_ref.current = null;
        }
    };

    const change_speed = (value) => {
        console.log(`Changing speed with value ${value}`);

        var default_ratio = (DEFAULT_MAX - value) / (DEFAULT_MAX - DEFAULT_MIN);
        console.log(`Default ratio: ${default_ratio}`);

        var ratio_range = ((RATIO_MAX - RATIO_MIN) - RATIO_MIN);
        console.log(`Ratio range: ${ratio_range}`);

        var newSpeed = default_ratio * ratio_range * 10;
        console.log(`Ratioed Speed: ${newSpeed}`);

        setState({ ...state, base_speed: value, speed: newSpeed });

        clearRunningTimeout();
        if (state.running) {
            timer_ref.current = setTimeout(() => {
                update_current_piece(state.piece_list, state.next_oid, false, newSpeed);
            }, newSpeed);
        }
    };


    const update_current_piece = async (piece_list, o_id, set_running = false, speed = state.speed) => {
        clearRunningTimeout(); // Clear the existing timeout before setting a new one

        console.log("Updating to next piece with o_id: ", o_id)

        const piece_list_length = piece_list.length;

        console.log(`Piece Count: ${piece_list_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = get_piece_from_path_o_id(piece_list, o_id);
        console.log('Got piece position #', piece_position, 'with piece data: ', current_piece)
        const piece_db_id = current_piece['id']
        const piece_o_id = current_piece['0_id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id'] : piece_list[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0) ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'];

        // console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

        const piece_details = {
            title: current_piece['title'],
            piece_type: current_piece['piece_type'],
            description: current_piece['description'],
            sold: current_piece['sold'],
            price: current_piece['price'],
            width: current_piece['width'],
            height: current_piece['height'],
            real_width: current_piece['real_width'],
            real_height: current_piece['real_height'],
            image_path: `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`,
            instagram: current_piece['instagram']
        }

        const image_array = await create_image_array(state.piece_list, piece_position);

        // console.log("CURRENT PIECE DETAILS (Next Line):")
        // console.log(piece_details)

        setState({
            ...state,
            loading: false,
            url_o_id: o_id,
            piece_list: piece_list,
            image_array: image_array,
            piece_position: piece_position,
            piece_db_id: piece_db_id,
            piece_o_id: piece_o_id,
            piece: current_piece,
            piece_details: piece_details,
            next_oid: next_oid,
            last_oid: last_oid,
            running: (set_running == true) ? true : state.running
        });

        if (state.running || set_running == true) {
            timer_ref.current = setTimeout(() => {
                update_current_piece(piece_list, next_oid, false, speed);
            }, speed);
        }
    };

    const create_image_array = (piece_list, piece_position) => {
        var image_array = [];
        for (var i = 0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push((
                <div key={`image_${i}`} className={(i == piece_position) ? styles.centered_image_container : styles.centered_image_container_hidden}>
                    <Image
                        className={styles.centered_image}
                        src={`${PROJECT_CONSTANTS.AWS_BUCKET_URL}${piece.image_path}`}
                        alt={piece.title}
                        priority={(i > piece_position - 3 && i < piece_position + 3) ? true : false}
                        quality={100}
                        width={piece.width}
                        height={piece.height}
                    />
                </div>
            ))
        }
        return image_array
    };

    const get_piece_from_path_o_id = (piece_list, o_id) => {
        for (var i = 0; i < piece_list.length; i++) {
            if (piece_list[i].o_id.toString() == o_id.toString()) {
                return [i, piece_list[i]]
            }
        }
        return [-1, null]
    }

    console.log('Using speed: ', state.speed);

    // Rendering
    return (
        <div className={styles.slideshow_body}>
            <div className={styles.centered_image_outer_container} onClick={(e) => {
                e.preventDefault();
                {
                    (state.running == false) ? (
                        update_current_piece(state.piece_list, state.next_oid, true)
                    ) : (
                        setState({ ...state, running: false })
                    )
                }
            }}>
                {state.image_array}
            </div>
            <div className={styles.slideshow_menu_container}>
                <div className={styles.slideshow_menu_left_container}>
                    {state.running == true ? (
                        <Pause className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); setState({ ...state, running: false }) }} />
                    ) : (
                        <PlayArrow className={`${styles.slideshow_icon}`} onClick={(e) => {
                            e.preventDefault();
                            update_current_piece(state.piece_list, state.next_oid, true)
                        }} />
                    )}

                    <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon} ${styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); update_current_piece(state.piece_list, state.last_oid) }} />

                    <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); update_current_piece(state.piece_list, state.next_oid) }} />

                    <SpeedIcon className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); setState({ ...state, speed_open: !state.speed_open }) }} />
                </div>
                <div className={styles.slideshow_menu_title_container}>
                    <div className={styles.slideshow_menu_title}>
                        {state.piece_details?.title}
                    </div>
                </div>
            </div>

            {state.speed_open == true ? (
                <div className={styles.speed_menu}>
                    <input
                        type="range"
                        min="1"
                        max="100"
                        defaultValue={state.base_speed}
                        className={styles.speed_slider}
                        id="speed_slider"
                        onChange={(e) => setState({ ...state, base_speed: e.target.value, speed: calculateRatioedValue(e.target.value) * 10 })}
                        onMouseUp={(e) => change_speed(e.target.value)} // Update speed when the knob is released
                    />
                    <div className={styles.speed_text}>
                        {`${(state.speed / 1000)}s`}
                    </div>
                </div>
            ) : (
                null
            )}
        </div>
    )
}

function calculateRatioedValue(baseSpeed) {
    const default_ratio = (DEFAULT_MAX - baseSpeed) / (DEFAULT_MAX + DEFAULT_MIN);
    // console.log(`Default ratio: ${default_ratio}`);

    const ratio_range = ((RATIO_MAX - RATIO_MIN) - RATIO_MIN);
    // console.log(`Ratio range: ${ratio_range}`);

    const ratioed_value = default_ratio * ratio_range;
    console.log(`Ratioed Speed: ${ratioed_value}`);

    return ratioed_value;
}

export default Slideshow;
