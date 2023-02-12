import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import PageLayout from '../../../../src/components/layout/PageLayout'

import styles from '../../../../styles/pages/Details.module.scss'

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';
import { CircularProgress } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class DetailsPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        const piece_list = this.props.piece_list;

        console.log(`getServerSideProps Pieces (Next Line):`)
        console.log(piece_list)

        const piece_list_length = piece_list.length
        console.log(`Pieces Length: ${piece_list_length}`)

        var image_array = [];
        
        var current_piece = null;
        var piece_position = 0;
        var piece_db_id = null;
        var piece_o_id = null;

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
            image_path =  (current_piece['image_path']  !== undefined) ? `${baseURL}${current_piece['image_path']}` : ''
            instagram =   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : ''
        }

        this.state = {
            debug: false,
            loading: true,
            url_o_id: props.id,
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
            description: description,
            price: price,
            sold: sold,
            full_screen: false
        }

        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);
        this.create_image_array = this.create_image_array.bind(this);
    }

    async componentDidMount() {        
        await this.update_current_piece(this.state.piece_list, this.state.url_o_id)
    }

    async update_current_piece(piece_list, o_id) {
        const previous_url_o_id = this.state.url_o_id
        const piece_list_length = piece_list.length;

        console.log(`Piece Count: ${piece_list_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(piece_list, o_id);
        const piece_db_id = current_piece['id']
        const piece_o_id = current_piece['o_id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)

        const next_oid = (piece_position + 1 > piece_list_length - 1) ? piece_list[0]['o_id']                 : piece_list[piece_position + 1]['o_id'];
        const last_oid = (piece_position - 1 < 0)                 ? piece_list[piece_list_length - 1]['o_id'] : piece_list[piece_position - 1]['o_id'];
        
        console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

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

        const sold = current_piece["sold"]
        const price = current_piece['price']

        const description = current_piece['description'].split('<br>').join("\n");

        const image_array = await this.create_image_array(this.state.piece_list, piece_position);

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

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
            description: description,
            sold: sold,
            price: price
        }, async () => {
            if (previous_url_o_id != o_id) {
                this.router.push(`/details/${o_id}`) 
            }
        })
    }

    async create_image_array(piece_list, piece_position) {
        var image_array = [];
        for (var i=0; i < piece_list.length; i++) {
            let piece = piece_list[i];
            image_array.push((
                <div key={`image_${i}`} className={(i == piece_position) ? styles.details_image_container : styles.details_image_container_hidden}>
                    <Image
                        id={`details_image_${i}`}
                        className={styles.details_image}
                        src={`${baseURL}${piece['image_path']}`}
                        alt={piece['title']}
                        // width={this.state.piece_details['width']}
                        // height={this.state.piece_details['height']}
                        priority={true}
                        layout='fill'
                        objectFit='contain'
                        quality={100}
                        onClick={(e) => {e.preventDefault(); this.setState({full_screen: !this.state.full_screen})}}
                    />
                </div>
            ))
        }
        return image_array
    }

    async get_piece_from_path_o_id(piece_list, o_id) {
        for (var i=0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == o_id.toString()) {
                return [i, piece_list[i]]
            }
        }
    }

    render() {
        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(this.state.piece_details)

        var page_layout = null;
        const title = (this.state.piece_details['title'] != null) ? (this.state.piece_details['title']) : ('')
        if (this.state.full_screen == true) {
            page_layout = (
                <PageLayout page_title={`Piece Details - ${title}`}>
                    <div className={styles.full_screen_container}>
                        <div className={styles.full_screen_image_container}>
                            <div className={styles.details_image_outer_container}>
                                {this.state.image_array}
                            </div>
                        </div>
                        <div className={styles.full_screen_close_container} onClick={(e) => {e.preventDefault(); this.setState({full_screen: false})}}>
                            <CloseIcon className={`${styles.full_screen_close_icon}`} />
                        </div>
                    </div>
                </PageLayout>
            )
         } else {
            page_layout = (
                <PageLayout page_title={ (title == '') ? (``) : (`Piece Details - ${title}`) }>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            <div className={styles.details_image_outer_container}>
                                { (this.state.loading == true) ? ( 
                                    <div className={styles.loader_container}>
                                        <div>Loading Gallery</div>
                                        <CircularProgress color="inherit" className={styles.loader}/>
                                    </div>
                                ) : (
                                    this.state.image_array
                                )}
                            </div>
                        </div>
                        <div className={styles.details_container_right}>
                            <div className={styles.title_container}>
                                <div className={styles.title_inner_container}>
                                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.last_oid)}} />
                                    <b className={styles.title}>{ (title == '') ? (``) : (`"${title}"`) }</b>
                                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.piece_list, this.state.next_oid)}} />
                                </div>
                            </div>
                            <div className={styles.details_form_container}>
                                <div className={styles.details_navigation_container}>
                                    <div className={styles.details_navigation_inner_container}>
                                        {
                                            (this.state.sold == false) ? ( 
                                                <b className={styles.price_text}>{`$${this.state.price}`}</b> 
                                            ) : ( 
                                                null
                                            )
                                        }
                                        {
                                            (this.state.sold == true) ? ( 
                                                <b className={styles.piece_sold}>Sold</b> 
                                            ) : ( 
                                                <Link href={`/checkout/${this.state.url_o_id}`}>
                                                    <button className={styles.buy_now_button}>Buy</button>
                                                </Link> 
                                            )
                                        }
                                        {
                                            (this.state.sold == true) ? 
                                                (
                                                    null
                                                ) : (
                                                    <Link href='https://stripe.com'>
                                                        <div className={styles.powered_by_stripe_container}>
                                                            <Image src='/powered_by_stripe_blue_background_small.png' alt='View Stripe Info' priority={true} layout="fill" objectFit='contain'/>
                                                            </div>
                                                    </Link>
                                                )
                                        }
                                        {
                                            (this.state.piece_details['instagram'] != null && this.state.piece_details['instagram'] != '') ? (
                                                <Link href={this.state.piece_details['instagram']}>
                                                    <div className={styles.instagram_link_container}>
                                                        <div className={styles.instagram_image_container}>
                                                            <Image className={styles.instagram_link_image} src='/instagram_icon_100.png' alt='Instagram Link' priority={true} layout="fill" objectFit='contain'/>
                                                        </div>
                                                        <div className={styles.instagram_link_label}>View On Instagram</div>
                                                    </div>
                                                </Link>
                                            ) : (
                                                null
                                            )
                                        }
                                    </div>
                                </div>
                                <div className={styles.details_description_container}>
                                    <h3 className={styles.details_description}>{this.state.description}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </PageLayout>
            )
        }
        return page_layout
    }
}

export default DetailsPage;
