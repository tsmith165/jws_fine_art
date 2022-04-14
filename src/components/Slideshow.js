import { useState, useEffect } from 'react';
import Image from 'next/image'

import styles from '../../styles/components/Slideshow.module.scss'

import CloseIcon from '@material-ui/icons//Close';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import SpeedIcon from '@material-ui/icons/Speed';

const baseURL = "https://jwsfineart.s3.us-west-1.amazonaws.com";

const SlideshowComponent = ({piece_list}) => {
    const debug = false;
    if (debug) {
        console.log(`WINDOW WIDTH: ${window_size.width} | HEIGHT: ${window_size.height}`);
        console.log("Generating Gallery - Data Next Line")
        console.log(piece_list)
    }

    console.log("Piece List (Next Line):")
    console.log(piece_list)

    const [cur_piece_id, set_cur_piece_id] = useState(0)
    const [running, set_running] = useState(true)
    const [speed_open, set_speed_open] = useState(false)
    const [speed, set_speed] = useState(50)

    console.log(`Running: ${running}`)
    console.log(`cur_piece_id: ${cur_piece_id}`)

    console.log(`Speed Open: ${speed_open}`)
    console.log(`Current Speed: ${speed}`)

    useEffect(() => {
        const timer = setInterval(() => {
            if (running) {
                console.log(`Cur Piece Id: ${cur_piece_id} `)
                if (cur_piece_id + 1 < piece_list.length - 1) {
                    set_cur_piece_id(cur_piece_id + 1)
                } else {
                    set_cur_piece_id(0)
                }
            }
        }, ((100 - speed) * 40))
        return () => clearTimeout(timer)
    })
    
    function handle_arrow_click(event, dir) {
        if (running) set_running(false);
        if (dir == true) {
            if (cur_piece_id + 1 < piece_list.length - 1) {
                set_cur_piece_id(cur_piece_id + 1)
            } else {
                set_cur_piece_id(0)
            }
        } else {
            if (cur_piece_id - 1 > 0) {
                set_cur_piece_id(cur_piece_id - 1)
            } else {
                set_cur_piece_id(piece_list.length - 1)
            }
        }
    }

    function speed_icon_clicked() {
        set_speed_open(!speed_open)
    }

    function change_speed(value) {
        const old_min = 1; const old_max = 100;
        const new_min = 20; const new_max = 85;

        var ratioed_value = ( (value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min

        console.log(`Ratioed Speed: ${ratioed_value}`)
        set_speed(ratioed_value)
    }

    return (
        <div className={styles.slideshow_body}>
            <div className={styles.slideshow_image_container} onClick={(e) => { 
                e.preventDefault(); 
                if (running == false) {
                    (cur_piece_id + 1 < piece_list.length) ? set_cur_piece_id(cur_piece_id + 1) : set_cur_piece_id(0);
                }
                set_running(!running) 
                }}>
                <Image                                         
                    className={styles.slideshow_image}
                    src={`${baseURL}${piece_list[cur_piece_id]['image_path']}`}
                    alt={piece_list[cur_piece_id]['title']}
                    priority={true}
                    layout='fill'
                    objectFit='contain'
                    quality={100} 
                />
            </div>
            <div className={styles.slideshow_menu_container}>
                <div className={styles.slideshow_menu_left_container}>
                    {running == true ? (
                        <Pause className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); set_running(false) }}/>
                    ) : (
                        <PlayArrow className={`${styles.slideshow_icon}`}  onClick={(e) => {
                            e.preventDefault();
                            (cur_piece_id + 1 < piece_list.length) ? set_cur_piece_id(cur_piece_id + 1) : set_cur_piece_id(0);  
                            set_running(true)
                        }}/>
                    )}

                    <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon} ${styles.img_hor_vert}`} onClick={(e) => {handle_arrow_click(e, false)}}/>

                    <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); handle_arrow_click(e, true)}}/>

                    <SpeedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); speed_icon_clicked()}}/>
                </div>
                <div className={styles.slideshow_menu_title_container}>
                    <div className={styles.slideshow_menu_title}>
                        {piece_list[cur_piece_id]['title']}
                    </div>
                </div>
            </div>

            {speed_open == true ? (
                <div className={styles.speed_menu}>
                    <input type="range" min="1" max="100" defaultValue={speed} class={styles.speed_slider} id="speed_slider" onChange={(e) => {e.preventDefault(); change_speed(e.target.value) }}/>
                </div>
                
            ) : (
                null
            )}
        </div>
    )
}

export default SlideshowComponent;
