import logger from '@/lib/logger';
import PROJECT_CONSTANTS from '@/lib/constants'

import React from 'react';
import Image from 'next/image'

import styles from '../../../../styles/pages/Slideshow.module.scss'

import PlayArrow from '@mui/icons-material/PlayArrow';
import Pause from '@mui/icons-material/Pause';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import SpeedIcon from '@mui/icons-material/Speed';


const DEFAULT_MIN = 0; const DEFAULT_MAX = 100;
const RATIO_MIN = 0; const RATIO_MAX = 1000;

class Slideshow extends React.Component {
    constructor(props) {
        super(props);

        const piece_list = this.props.piece_list;
        const piece_list_length = piece_list.length

        logger.debug(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`)
        logger.debug(piece_list)

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
            image_path =  (current_piece['image_path']  !== undefined) ? `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}` : ''
            instagram =   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : ''

            for (var i=0; i < piece_list.length; i++) {
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
        const base_speed = 80
        const default_ratio = (DEFAULT_MAX - base_speed) / (DEFAULT_MAX + DEFAULT_MIN)
        // logger.debug(`Default ratio: ${default_ratio}`)

        const ratio_range = ((RATIO_MAX - RATIO_MIN) - RATIO_MIN)
        // logger.debug(`Ratio range: ${ratio_range}`)

        const ratioed_value = default_ratio * ratio_range
        // logger.debug(`Ratioed Speed: ${ratioed_value}`)

        this.state = {
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
        }

        this.timer_ref = React.createRef();

        this.create_image_array = this.create_image_array.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.change_speed = this.change_speed.bind(this);
    }

    async componentDidMount() {
        this.update_current_piece(this.state.piece_list, this.state.next_oid)

    }

    // create a componentWillUnmount() method that clears the timer
    componentWillUnmount() {
        clearTimeout(this.state.timer);

        this.setState({running: false})
    }

    change_speed(value) {
        logger.debug(`Changing speed with value ${value}`)

        var default_ratio = (DEFAULT_MAX - value) / (DEFAULT_MAX - DEFAULT_MIN)
        logger.debug(`Default ratio: ${default_ratio}`)

        var ratio_range = ((RATIO_MAX - RATIO_MIN) - RATIO_MIN)
        logger.debug(`Ratio range: ${ratio_range}`)

        var ratioed_value = default_ratio * ratio_range
        logger.debug(`Ratioed Speed: ${ratioed_value}`)

        this.setState({base_speed: value, speed: ratioed_value * 10})
    }

    async update_current_piece(piece_list, o_id, set_running=false) {
        const piece_list_length = piece_list.length;

        // logger.debug(`Piece Count: ${piece_list_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(piece_list, o_id);
        const piece_db_id = current_piece['id']
        const piece_o_id = current_piece['0_id']

        // logger.debug(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        logger.debug(current_piece)

        const next_oid = (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id']                 : piece_list[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'];

        // logger.debug(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

        const piece_details = {
            title:       current_piece['title'],
            piece_type:  current_piece['piece_type'],
            description: current_piece['description'],
            sold:        current_piece['sold'],
            price:       current_piece['price'],
            width:       current_piece['width'],
            height:      current_piece['height'],
            real_width:  current_piece['real_width'],
            real_height: current_piece['real_height'],
            image_path:  `${PROJECT_CONSTANTS.AWS_BUCKET_URL}${current_piece['image_path']}`,
            instagram:   current_piece['instagram']
        }

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        // logger.debug("CURRENT PIECE DETAILS (Next Line):")
        // logger.debug(piece_details)

        this.setState({
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
            running: (set_running == true) ? true : this.state.running
        })

        if (this.state.running == true || set_running == true) {
            this.state.timer = setTimeout( () => { this.update_current_piece(this.state.piece_list, this.state.next_oid) }, (this.state.speed));
        }
    }

    async create_image_array(piece_list, piece_position) {
        var image_array = [];
        for (var i=0; i < piece_list.length; i++) {
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
    }

    async get_piece_from_path_o_id(piece_list, o_id) {
        for (var i=0; i < piece_list.length; i++) {
            if (piece_list[i].o_id.toString() == o_id.toString()) {
                return [i, piece_list[i]]
            }
        }
    }

    render() {
        // logger.debug("CURRENT PIECE DETAILS (Next Line):")
        // logger.debug(this.state.piece_details)

        return (
            <div className={styles.slideshow_body}>
                <div className={styles.centered_image_outer_container} onClick={(e) => { 
                    e.preventDefault(); 
                    {(this.state.running == false) ? ( 
                        this.update_current_piece(this.state.piece_list, this.state.next_oid, true)
                    ) : ( 
                        this.setState({running: false}) 
                    )
                }}}>
                    {this.state.image_array}
                </div>
                <div className={styles.slideshow_menu_container}>
                    <div className={styles.slideshow_menu_left_container}>
                        {this.state.running == true ? (
                            <Pause className={`${styles.slideshow_icon}`} onClick={(e) => { e.preventDefault(); this.setState({running: false}) }}/>
                        ) : (
                            <PlayArrow className={`${styles.slideshow_icon}`}  onClick={(e) => {
                                e.preventDefault();
                                this.update_current_piece(this.state.piece_list, this.state.next_oid, true)
                            }}/>
                        )}

                        <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon} ${styles.img_hor_vert}`} onClick={(e) => {e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.last_oid)}}/>

                        <ArrowForwardIosRoundedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.next_oid)}}/>

                        <SpeedIcon className={`${styles.slideshow_icon}`} onClick={(e) => {e.preventDefault(); this.setState({speed_open: !this.state.speed_open})}}/>
                    </div>
                    <div className={styles.slideshow_menu_title_container}>
                        <div className={styles.slideshow_menu_title}>
                            {this.state.piece_list[this.state.piece_position]['title']}
                        </div>
                    </div>
                </div>

                {this.state.speed_open == true ? (
                    <div className={styles.speed_menu}>
                        <input 
                            type="range" 
                            min="1" 
                            max="100" 
                            defaultValue={this.state.base_speed} 
                            className={styles.speed_slider} 
                            id="speed_slider" 
                            onChange={(e) => {e.preventDefault(); this.change_speed(e.target.value) }}
                        />
                        <div className={styles.speed_text}>
                            {`${(this.state.speed / 1000)}s`}
                        </div>
                    </div>
                ) : (
                    null
                )}
            </div>
        )
    }
}

export default Slideshow;
