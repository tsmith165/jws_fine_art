import React from 'react';
import Image from 'next/image'

import styles from '../../../../styles/pages/Details.module.scss'

import PageLayout from '../../../../src/components/layout/PageLayout'
import EditDetailsForm from '../../../../src/components/forms/EditDetailsForm'
import { fetch_pieces } from '../../../../lib/api_calls';

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

class EditPage extends React.Component {
    constructor(props) {
        super(props);

        this.router = props.router

        // Don't call this.setState() here!
        this.state = {
            debug: false,
            path_id: props.id,
            pieces: null,
            piece_id: null,
            current_piece: null,
            next_oid: null,
            last_oid: null,
            piece_details: {
                title:       '',
                type:        '',
                description: '',
                sold:        '',
                price:       '',
                width:       '',
                height:      '',
                real_width:  '',
                real_height: '',
                image_path:  '',
                instagram:   '',
            },
            image_url: '',
        }; 

        this.fetch_pieces = this.fetch_pieces.bind(this);
        this.update_current_piece = this.update_current_piece.bind(this);
        this.get_piece_id_from_path_o_id = this.get_piece_id_from_path_o_id.bind(this);
    }

    async fetch_pieces() {
        console.log(`-------------- Fetching Initial Server List --------------`)
        const response = await fetch_pieces();
        const pieces = response['pieces']

        console.log('Pieces output (Next Line):')
        console.log(pieces)

        this.update_current_piece(this.state.path_id, pieces)
    }

    async get_piece_id_from_path_o_id(PathOID, pieces) {
        for (var i=0; i < pieces.length; i++) {
            if (pieces[i]['o_id'].toString() == PathOID.toString()) {
                return i
            }
        }
    }

    async update_current_piece(o_id, pieces) {
        const piece_id = await this.get_piece_id_from_path_o_id(o_id, pieces);
        console.log(`Current Selected Piece ID: ${piece_id}`)

        const current_piece = pieces[piece_id]

        const pieces_length = pieces.length;
        const next_oid = (piece_id + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[piece_id + 1]['o_id'];
        const last_oid = (piece_id - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[piece_id - 1]['o_id'];

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

        console.log("CURRENT PIECE DETAILS (Next Line):")
        console.log(piece_details)

        this.setState({pieces: pieces, piece_id: piece_id, piece: current_piece, next_oid: next_oid, last_oid: last_oid, piece_details: piece_details, image_url: image_url})

        this.router.push(`/edit/${piece_id}`)
    }

    async componentDidMount() {
        this.fetch_pieces()
    }

    render() {
        return (
            <PageLayout page_title={`Edit Details - ${this.state.piece_details['title']}`}>
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
                            />

                        </div>
                    </div>
                    <div className={styles.details_container_right}>

                        <EditDetailsForm 
                            id={this.state.piece_id} 
                            last_oid={this.state.last_oid} 
                            next_oid={this.state.next_oid} 
                            piece={this.state.piece_details} 
                            pieces={this.state.pieces}
                            set_state={this.setState}
                            update_current_piece={this.update_current_piece}
                        />

                    </div>
                </div>
            </PageLayout>
        )
    }
}

export default EditPage;
