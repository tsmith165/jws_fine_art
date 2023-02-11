import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import styles from '../../../../styles/pages/Details.module.scss'

import PageLayout from '../../../../src/components/layout/PageLayout'
import { fetch_pieces } from '../../../../lib/api_calls';

import { CircularProgress } from '@material-ui/core';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class SuccessPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        console.log(`getServerSideProps Pieces (Next Line):`)
        console.log(this.props.pieces)

        const pieces = this.props.pieces
        const pieces_length = this.props.pieces.length
        console.log(`Pieces Length: ${pieces_length}`)

        if (pieces_length > 0) {
            const piece_position = 0
            const current_piece = this.props.pieces[piece_position]

            this.state = {
                debug: false,
                loading: true,
                url_o_id: props.id,
                pieces: pieces,
                current_piece: current_piece,
                piece_position: piece_position,
                piece_db_id: (current_piece['id'] !== undefined) ? current_piece['id'] : '',
                piece_details: {
                    title:       (current_piece['title']       !== undefined) ? current_piece['title'] : '',
                    type:        (current_piece['type']        !== undefined) ? current_piece['type'] : '',
                    description: (current_piece['description'] !== undefined) ? current_piece['description'] : '',
                    sold:        (current_piece['sold']        !== undefined) ? current_piece['sold'] : '',
                    price:       (current_piece['price']       !== undefined) ? current_piece['price'] : '',
                    width:       (current_piece['width']       !== undefined) ? current_piece['width'] : '',
                    height:      (current_piece['height']      !== undefined) ? current_piece['height'] : '',
                    real_width:  (current_piece['real_width']  !== undefined) ? current_piece['real_width'] : '',
                    real_height: (current_piece['real_height'] !== undefined) ? current_piece['real_height'] : '',
                    image_path:  (current_piece['image_path']  !== undefined) ? `${baseURL}${current_piece['image_path']}` : '',
                    instagram:   (current_piece['instagram']   !== undefined) ? current_piece['instagram'] : '',
                },
                image_url: (current_piece['image_path'] !== undefined) ? `${baseURL}${current_piece['image_path']}` : '',
            }; 
        } else {
            this.state = {
                debug: false,
                loading: true,
                url_o_id: props.id,
                piece_position: null,
                piece_db_id: null,
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
                image_url: ''
            }; 
        }

        this.fetch_pieces = this.fetch_pieces_from_api.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);

        // this.fetch_pieces_from_api()
    }

    async componentDidMount() {
        // await this.fetch_pieces_from_api()
    }

    async fetch_pieces_from_api() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const pieces = await fetch_pieces();

        // console.log('Pieces output (Next Line):')
        // console.log(pieces)

        this.update_current_piece(pieces, this.state.url_o_id)
    }

    async update_current_piece(pieces, o_id) {
        const pieces_length = pieces.length;

        console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(pieces, o_id);
        const piece_db_id = current_piece['id']

        console.log(`Piece Position: ${piece_position} | Piece DB ID: ${piece_db_id} | Data (Next Line):`)
        console.log(current_piece)
        
        console.log(`Updating to new selected piece with Postition: ${piece_position} | DB ID: ${piece_db_id} | O_ID: ${o_id}`)

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

        const image_url = piece_details.image_path
        console.log(`Setting Details Image Path: ${image_url}`)

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        console.log(`Piece sold: ${piece_details['sold']} | Piece Type: ${piece_details['type']}`)
        const previous_url_o_id = this.state.url_o_id
        this.setState({
            loading: false,
            url_o_id: o_id,
            pieces: pieces,
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece: current_piece, 
            piece_details: piece_details, 
            image_url: image_url
        }, async () => {
            if (previous_url_o_id != o_id) {
                this.router.push(`/checkout/success/${o_id}`) 
            }
        })
    }

    async get_piece_from_path_o_id(pieces, o_id) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, pieces[i]]
            }
        }
    }

    render() {
        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(this.state.piece_details)

        const title = (this.state.piece_details['title'] != null) ? (this.state.piece_details['title']) : ('')
        return (
            <PageLayout page_title={ (title == '') ? (``) : (`Checkout Success - ${title}`) }>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_container}>
                            { (this.state.image_url == '') ? ( 
                                <div className={styles.loader_container}>
                                    <div>Loading Gallery</div>
                                    <CircularProgress color="inherit" className={styles.loader}/>
                                </div>
                            ) : (
                                <Image
                                    className={styles.details_image}
                                    src={this.state.image_url}
                                    alt={this.state.piece_details['title']}
                                    // width={this.state.piece_details['width']}
                                    // height={this.state.piece_details['height']}
                                    priority={true}
                                    layout='fill'
                                    objectFit='contain'
                                    quality={100}
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.details_container_right}>
                        <div className={styles.title_container}>
                            <b className={styles.title}>{ (title == '') ? (``) : (`"${title}"`) }</b>
                        </div>
                        <div className={styles.checkout_return_message_container}>
                            <div className={styles.checkout_return_message}>
                                {`Successfully purhcased ${this.state.piece_details['title']}!` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`Check your email for your reciept from Stripe.` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`Please E Mail at jwsfineart@gmail.com with any questions.` }
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default SuccessPage;
