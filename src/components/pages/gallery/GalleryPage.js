import React from 'react';

import PageLayout from '../../../../src/components/layout/PageLayout'

import styles from '../../../../styles/components/Gallery.module.scss'

import Piece from '../components/Piece'

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class GalleryPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${this.props.id}`)
        const passed_o_id = this.props.id;

        const piece_list = this.props.piece_list;
        const piece_list_length = piece_list.length

        console.log(`getServerSideProps piece_list length: ${piece_list_length} | Data (Next Line):`)
        console.log(piece_list)

        
        console.log(`Pieces Length: ${piece_list_length}`)

        var gallery_pieces = [];
        
        var current_piece = null;
        var piece_position = 0;
        var piece_db_id = null;
        var piece_o_id = null;

        for (var i=0; i < piece_list.length; i++) {
            if (piece_list[i]['o_id'].toString() == passed_o_id.toString()) {
                piece_position = i
            }
        }

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

            description = current_piece['description'].split('<br>').join(" \n");

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
                            priority={(i == piece_position) ? true : false}
                            layout='fill'
                            objectFit='contain'
                            quality={100}
                            onClick={(e) => {e.preventDefault(); this.setState({full_screen: !this.state.full_screen})}}
                        />
                    </div>
                ))
            }
        }

        this.state = {
            debug: false,
            loading: true,
            piece_list: piece_list,
            gallery_pieces: gallery_pieces,
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
    }

    async componentDidMount() {        
        // await this.update_current_piece(this.state.piece_list, this.state.url_o_id)
        this.setState({loading: false})
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
                                {this.state.image_array}
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
                                            (this.state.sold == true) ? (
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
                                            (this.state.piece_details['instagram'] != null && this.state.piece_details['instagram'] != '' && this.state.piece_details['instagram'].length > 5) ? (
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

export default GalleryPage;
