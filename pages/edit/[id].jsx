import PageLayout from '../../src/components/layout/PageLayout'
import Image from 'next/image'
import { prisma } from '../../lib/prisma'
import React, { useState, useEffect } from 'react';
import { UserButton, useUser, RedirectToSignIn } from "@clerk/clerk-react";

import styles from '../../styles/pages/Details.module.scss'

import EditDetailsForm from '../../src/components/forms/EditDetailsForm'

import { get_piece_id_from_path_o_id } from '../../lib/helpers'

const baseURL = "https://jwsfineartpieces.s3.us-west-1.amazonaws.com";

async function fetchPieces() {
    console.log(`Fetching pieces with prisma`)
    const pieces = await prisma.piece.findMany({
        orderBy: {
            o_id: 'asc',
        },
    })

    return pieces
}

export const getServerSideProps = async (context) => {
    console.log("Getting Server Side Props")
    const pieces = await fetchPieces()

    //console.log(context)
    return { 
        props: {
            "id": context.params.id, 
            "pieces": pieces
        },
        revalidate: 60
    }
}

const EditPage = ({id, pieces}) => {
    const { isLoaded, isSignedIn, user } = useUser();

    if  (!isLoaded) {
      return(<></>)
    }
    if (!isSignedIn) {
      router.push('/')
    }
    if (user == null) {
      router.push('/')
    }
    const role = user.publicMetadata.role;
    console.log(`USER ROLE: ${role}`)
    if (user.publicMetadata.role !== "ADMIN") {
      router.push('/')
    }

    var PathOID = id;
    var pieceID = get_piece_id_from_path_o_id(PathOID, pieces);
    console.log(`Piece ID: ${pieceID}`)

    const pieces_length = pieces.length;
    var next_oid = (pieceID + 1 > pieces_length - 1) ? pieces[0]['o_id']                 : pieces[pieceID + 1]['o_id'];
    var last_oid = (pieceID - 1 < 0)                 ? pieces[pieces_length - 1]['o_id'] : pieces[pieceID - 1]['o_id'];

    var piece_details = {
        title:       pieces[pieceID]['title'],
        type:        pieces[pieceID]['type'],
        description: pieces[pieceID]['description'],
        sold:        pieces[pieceID]['sold'],
        price:       pieces[pieceID]['price'],
        width:       pieces[pieceID]['width'],
        height:      pieces[pieceID]['height'],
        real_width:  pieces[pieceID]['real_width'],
        real_height: pieces[pieceID]['real_height'],
        image_path:  `${baseURL}${pieces[pieceID]['image_path']}`,
        instagram:   pieces[pieceID]['instagram']
    }

    console.log("CURRENT PIECE DETAILS:")
    console.log(piece_details)

    var [piece, set_piece] = useState(piece_details)

    useEffect(() => {
        set_piece(piece_details)
    }, [id, pieces]);

    var [image_url, set_image_url] = useState(piece['image_path'])
    
    useEffect(() => {
        set_image_url(piece['image_path'])
    }, [piece['image_path']]);
            
    console.log(`IMAGE URL : ${image_url}`)

    const page_jsx =  (
        <PageLayout page_title={`Edit Details - ${piece['title']}`}>
            <div className={styles.details_container}>
                <div className={styles.details_container_left}>
                    <div className={styles.details_image_container}>

                        <Image
                            className={styles.details_image}
                            src={image_url}
                            alt={piece['title']}
                            width={piece['width']}
                            height={piece['height']}
                            priority={true}
                            layout='fill'
                            objectFit='contain'
                            quality={100}
                        />

                    </div>
                </div>
                <div className={styles.details_container_right}>

                    <EditDetailsForm 
                        id={id} 
                        last_oid={last_oid} 
                        next_oid={next_oid} 
                        piece={piece} 
                        set_piece={set_piece} 
                        set_image_url={set_image_url}
                    />

                </div>
            </div>
        </PageLayout>
    )

    return page_jsx
}

export default EditPage