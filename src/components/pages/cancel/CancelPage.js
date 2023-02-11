import React from 'react';
import Image from 'next/image'
import Link from 'next/link'

import styles from '../../../../styles/pages/Details.module.scss'

import PageLayout from '../../../../src/components/layout/PageLayout'
import { fetch_pieces } from '../../../../lib/api_calls';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class CancelPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        console.log(`ID PROP: ${props.id}`)

        // Don't call this.setState() here!
        this.state = {
            debug: false,
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

        this.fetch_pieces = this.fetch_pieces_from_api.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_from_path_o_id = this.get_piece_from_path_o_id.bind(this);

        this.fetch_pieces_from_api()
    }

    async componentDidMount() {
        // await this.fetch_pieces_from_api()
    }

    async fetch_pieces_from_api() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const pieces = await fetch_pieces();

        console.log('Pieces output (Next Line):')
        console.log(pieces)

        this.setState({pieces: pieces}, async () => {await this.update_current_piece(this.state.url_o_id)})
    }

    async update_current_piece(o_id) {
        const pieces_length = this.state.pieces.length;

        console.log(`Piece Count: ${pieces_length} | Searching for URL_O_ID: ${o_id}`)
        const [piece_position, current_piece] = await this.get_piece_from_path_o_id(o_id);
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

        this.setState({
            piece_position: piece_position,
            piece_db_id: piece_db_id, 
            piece: current_piece, 
            piece_details: piece_details, 
            image_url: image_url
        }, async () => {
            this.router.push(`/checkout/cancel/${o_id}`) 
        })
    }

    async get_piece_from_path_o_id(o_id) {
        for (var i=0; i < this.state.pieces.length; i++) {
            if (this.state.pieces[i]['o_id'].toString() == o_id.toString()) {
                return [i, this.state.pieces[i]]
            }
        }
    }

    render() {
        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(this.state.piece_details)

        const title = (this.state.piece_details['title'] != null) ? (this.state.piece_details['title']) : ('')
        return (
            <PageLayout page_title={ (title == '') ? (``) : (`Checkout Cancel - ${title}`) }>
                <div className={styles.details_container}>
                    <div className={styles.details_container_left}>
                        <div className={styles.details_image_container}>
                            { (this.state.image_url == '') ? (null) : (
                                <Image
                                    className={styles.details_image}
                                    src={`${this.state.image_url}`}
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
                                {`Purchase Unsuccessful!` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`Try reloading the home page and selecting the piece again.` }
                            </div>
                            <div className={styles.checkout_return_message}>
                                {`If problems persist, feel free to reach out at jwsfineart@gmail.com` }
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default CancelPage;
