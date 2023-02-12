import React from 'react';
import { useEffect } from 'react'
import Image from 'next/image'

import styles from '../../styles/components/Slideshow.module.scss'

import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import SpeedIcon from '@material-ui/icons/Speed';
import { CircularProgress } from '@material-ui/core';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class SlideshowComponent extends React.Component {
    constructor(props) {
        super(props);

        const pieces = this.props.piece_list;

        console.log(`getServerSideProps Pieces (Next Line):`)
        console.log(pieces)

        const pieces_length = pieces.length
        console.log(`Pieces Length: ${pieces_length}`)

        var image_array = [];
        
        var current_piece = null;
        var piece_position = 0;
        var piece_o_id = 0;
        var piece_db_id = null;

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

        if (pieces_length > 0) {
            const current_piece = pieces[piece_position]

            piece_db_id = (current_piece['id']          !== undefined) ? current_piece['id'] : ''
            piece_o_id =  (current_piece['o_id']        !== undefined) ? current_piece['o_id'] : ''
            title =       (current_piece['title']       !== undefined) ? current_piece['title'] : ''
            type =        (current_piece['type']        !== undefined) ? current_piece['type'] : 'Oil On Canvas'
            sold =        (current_piece['sold']        !== undefined) ? current_piece['sold'] : 'False'
            description = (current_piece['description'] !== undefined) ? current_piece['description'] : ''
            price =       (current_piece['price']       !== undefined) ? current_piece['price'] : ''
            width =       (current_piece['width']       !== undefined) ? current_piece['width'] : ''
            height =      (current_piece['height']      !== undefined) ? current_piece['height'] : ''
            real_width =  (current_piece['real_width']  !== undefined) ? current_piece['real_width'] : ''
            real_height = (current_piece['real_height'] !== undefined) ? current_piece['real_height'] : ''
            image_path =  (current_piece['image_path']  !== undefined) ? `${baseURL}${current_piece['image_path']}` : ''
            instagram =   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : ''
        }

        this.state = {
            debug: false,
            loading: true,
            pieces: pieces,
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
            next_oid: (piece_position + 1 > pieces_length - 1) ? pieces[0]['o_id'] : pieces[piece_position + 1]['o_id'],
            last_oid: (piece_position - 1 < 0) ? pieces[pieces_length - 1]['o_id'] : pieces[piece_position - 1]['o_id'],
            running: true,
            speed_open: false,
            speed: 50,
            timer: null
        }

        this.create_image_array = this.create_image_array.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.change_speed = this.change_speed.bind(this);
    }

    async componentDidMount() {
        await this.update_current_piece(this.state.pieces, this.state.next_oid)

        const timer = setInterval(async () => {
            if (this.state.running) {
                await this.update_current_piece(this.state.pieces, this.state.next_oid)
            }
        }, ((100 - this.state.speed) * 40))
        return () => clearTimeout(timer)
    }

    async update_current_piece(pieces, o_id, set_running=false) {
        const pieces_length = pieces.length;

        // console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(pieces, o_id);
        const piece_db_id = current_piece['id']
        const piece_o_id = current_piece['0_id']

        // console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[piece_position - 1]['o_id'];

        // console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

        const piece_details = {
            title:       current_piece['title'],
            type:        current_piece['type'],
            description: current_piece['description'],
            sold:        current_piece['sold'],
            price:       current_piece['price'],
            width:       current_piece['width'],
            height:      current_piece['height'],
            real_width:  current_piece['real_width'],
            real_height: current_piece['real_height'],
            image_path:  `${baseURL}${current_piece['image_path']}`,
            instagram:   current_piece['instagram']
        }

        const image_array = await this.create_image_array(this.state.pieces, piece_position);

        // console.log("CURRENT PIECE DETAILS (Next Line):")
        // console.log(piece_details)

        this.setState({
            loading: false,
            url_o_id: o_id,
            pieces: pieces,
            image_array: image_array,
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece_o_id: piece_o_id, 
            piece: current_piece, 
            piece_details: piece_details, 
            next_oid: next_oid, 
            last_oid: last_oid,
            running: (set_running == true) ? true : this.state.running
        })
    }

    async create_image_array(pieces, piece_position) {
        var image_array = [];
        for (var i=0; i < pieces.length; i++) {
            let piece = pieces[i];
            image_array.push((
                <div key={i} className={(i == piece_position) ? styles.slideshow_image_container : styles.slideshow_image_container_hidden}>
                    <Image                                         
                        className={styles.slideshow_image}
                        src={`${baseURL}${piece['image_path']}`}
                        alt={piece['title']}
                        priority={true}
                        layout='fill'
                        objectFit='contain'
                        quality={100} 
                    />
                </div>
            ))
        }
        return image_array
    }

    async get_piece_from_path_o_id(pieces, o_id) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, pieces[i]]
            }
        }
    }

    change_speed(value) {
        const old_min = 1; const old_max = 100;
        const new_min = 20; const new_max = 85;

        var ratioed_value = ( (value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min

        console.log(`Ratioed Speed: ${ratioed_value}`)
        this.setState({speed: ratioed_value})
    }

    render() {
        // console.log("CURRENT PIECE DETAILS (Next Line):")
        // console.log(this.state.piece_details)

        return (
            <div className={styles.slideshow_body}>
                <div className={styles.slideshow_image_outer_container} onClick={(e) => { 
                    e.preventDefault(); 
                    {(this.state.running == false) ? ( 
                        this.setState({running: true}) 
                    ) : ( 
                        this.setState({running: false}) 
                    )
                }}}>
                    { (this.state.loading == true) ? ( 
                        <div className={styles.loader_container}>
                            <div>Loading Gallery</div>
                            <CircularProgress color="inherit" className={styles.loader}/>
                        </div>
                    ) : (
                        this.state.image_array
                    )}
                </div>
                <div className={styles.slideshow_menu_container}>
                    <div className={styles.slideshow_menu_left_container}>
                        {this.state.running == true ? (
                            <Pause className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); this.setState({running: false}) }}/>
                        ) : (
                            <PlayArrow className={`${styles.slideshow_icon}`}  onClick={(e) => {
                                e.preventDefault();
                                this.setState({running: true}) 
                            }}/>
                        )}

                        <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon} ${styles.img_hor_vert}`} onClick={(e) => {e.preventDefault(); this.update_current_piece(this.state.pieces, this.state.last_oid)}}/>

                        <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); this.update_current_piece(this.state.pieces, this.state.next_oid)}}/>

                        <SpeedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); this.setState({speed_open: !this.state.speed_open})}}/>
                    </div>
                    <div className={styles.slideshow_menu_title_container}>
                        <div className={styles.slideshow_menu_title}>
                            {this.state.pieces[this.state.piece_position]['title']}
                        </div>
                    </div>
                </div>

                {this.state.speed_open == true ? (
                    <div className={styles.speed_menu}>
                        <input type="range" min="1" max="100" defaultValue={this.state.speed} class={styles.speed_slider} id="speed_slider" onChange={(e) => {e.preventDefault(); this.change_speed(e.target.value) }}/>
                    </div>
                ) : (
                    null
                )}
            </div>
        )
    }
}

export default SlideshowComponent;
