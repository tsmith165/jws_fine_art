import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import styles from '../../../../styles/pages/Details.module.scss'

import PageLayout from '../../../../src/components/layout/PageLayout'
import { fetch_pieces } from '../../../../lib/api_calls';

import ArrowForwardIosRoundedIcon from '@material-ui/icons/ArrowForwardIosRounded';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class DetailsPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        // Don't call this.setState() here!
        this.state = {
            debug: false,
            url_o_id: props.id,
            pieces: null,
            piece_id: null,
            current_piece: null,
            piece_details: {
                title:       '',
                type:        '',
                description: '',
                sold:        '',
                price:       '',
                width:       0,
                height:      0,
                real_width:  '',
                real_height: '',
                image_path:  '',
                instagram:   '',
            },
            image_url: '',
            next_oid: null,
            last_oid: null,
            full_screen: false,
            price: 0,
            price_html: null,
            sold: false,
            sold_html: null,
            description: ''
        }; 

        this.fetch_pieces = this.fetch_pieces_from_api.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_id_from_path_o_id = this.get_piece_id_from_path_o_id.bind(this);
    }

    async componentDidMount() {
        await this.fetch_pieces_from_api()
    }

    async fetch_pieces_from_api() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const pieces = await fetch_pieces();

        console.log('Pieces output (Next Line):')
        console.log(pieces)

        await this.update_current_piece(this.state.url_o_id, pieces)
    }

    async update_current_piece(o_id, pieces) {
        console.log(`Searching for URL_O_ID: ${o_id}`)
        const piece_id = await this.get_piece_id_from_path_o_id(o_id, pieces);

        const current_piece = pieces[piece_id]
        console.log(`CURRENT PIECE ID ${piece_id} DATA (NEXT LINE):`)
        console.log(current_piece)

        const pieces_length = pieces.length;
        const next_oid = (piece_id + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[piece_id + 1]['o_id'];
        const last_oid = (piece_id - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[piece_id - 1]['o_id'];
        
        console.log(`Updating to new selected piece with ID: ${piece_id} | O_ID: ${o_id} | NEXT_O_ID: ${next_oid} | LAST_O_ID: ${last_oid}`)

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
        const sold_html = (sold == true) ? 
            ( 
                <b className={styles.piece_sold}>Sold</b> 
            ) : ( 
                <Link href={`/checkout/${o_id}`}>
                    <button className={styles.buy_now_button}>Buy</button>
                </Link> 
            )
    
        const price = current_piece['price']
        const price_html = (current_piece["sold"] == false) ? ( <b className={styles.price_text}>{`$current_piece['price']`}</b> ) : ( null )

        const image_url = piece_details.image_path
        console.log(`Setting Details Image Path: ${image_url}`)

        const description = current_piece['description'].split('<br>').join("\n");
        this.setState({pieces: pieces, piece_id: piece_id, piece: current_piece, image_url: image_url, next_oid: next_oid, last_oid: last_oid, sold: sold, sold_html: sold_html, price: price, price_html: price_html, piece_details: piece_details, description: description})
        
        this.router.push(`/details/${o_id}`)
    }

    async get_piece_id_from_path_o_id(URL_O_ID, pieces) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == URL_O_ID.toString()) {
                return i
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
                            <Image
                                className={styles.full_screen_image}
                                src={this.state.image_url}
                                alt={this.state.piece_details['title']}
                                width={this.state.piece_details['width']}
                                height={this.state.piece_details['height']}
                                priority={true}
                                layout='fill'
                                objectFit='contain'
                                quality={100}
                                onClick={(e) => {e.preventDefault(); this.setState({full_screen: true})}}
                            />
                        </div>
                        <div className={styles.full_screen_close_container} onClick={(e) => {e.preventDefault(); this.setState({full_screen: false})}}>
                            <CloseIcon className={`${styles.full_screen_close_icon}`} />
                        </div>
                    </div>
                </PageLayout>
            )
         } else {
            page_layout = (
                <PageLayout page_title={`Piece Details - ${title}}`}>
                    <div className={styles.details_container}>
                        <div className={styles.details_container_left}>
                            <div className={styles.details_image_container}>
                                <Image
                                    className={styles.details_image}
                                    src={this.state.image_url}
                                    alt={this.state.piece_details['title']}
                                    width={this.state.piece_details['width']}
                                    height={this.state.piece_details['height']}
                                    priority={true}
                                    layout='fill'
                                    objectFit='contain'
                                    quality={100}
                                    onClick={(e) => {e.preventDefault(); set_full_screen(true)}}
                                />
                            </div>
                        </div>
                        <div className={styles.details_container_right}>
                            <div className={styles.title_container}>
                                <div className={styles.title_inner_container}>
                                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow} ${styles.img_hor_vert}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.last_oid, this.state.pieces)}} />
                                    <b className={styles.title}>{this.state.piece_details['title']}</b>
                                    <ArrowForwardIosRoundedIcon className={`${styles.title_arrow}`} onClick={(e) => { e.preventDefault(); this.update_current_piece(this.state.next_oid, this.state.pieces)}} />
                                </div>
                            </div>
                            <div className={styles.details_form_container}>
                                <div className={styles.details_navigation_container}>
                                    <div className={styles.details_navigation_inner_container}>
                                        {this.state.price_html}
                                        {this.state.sold_html}
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
                                                <Link href={`https://www.instagram.com/${this.state.piece_details['instagram']}`}>
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
